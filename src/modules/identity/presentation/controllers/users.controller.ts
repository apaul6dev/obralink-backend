import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AssignRolesToUserCommand } from '../../application/commands/user/assign-roles-to-user.command';
import { CreateUserCommand } from '../../application/commands/user/create-user.command';
import { UpdateUserCommand } from '../../application/commands/user/update-user.command';
import { AssignRolesToUserDto } from '../../application/dto/user/assign-roles-to-user.dto';
import { CreateUserDto } from '../../application/dto/user/create-user.dto';
import { UpdateUserDto } from '../../application/dto/user/update-user.dto';
import { TenantQueryDto, UserIdParamDto } from '../../application/dto/common/request.dto';
import { GetUserByIdQuery } from '../../application/queries/user/get-user-by-id.query';
import { GetUsersByTenantQuery } from '../../application/queries/user/get-users-by-tenant.query';
import { UserType } from '../../domain/enums/user-type.enum';
import { AuthenticatedIdentity } from '../../domain/services/tenant-access-policy.service';
import { PermissionsGuard } from '../../infrastructure/security/permissions.guard';
import { RolesGuard } from '../../infrastructure/security/roles.guard';
import { TenantGuard } from '../../infrastructure/security/tenant.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Permissions } from '../decorators/permissions.decorator';
import { Roles } from '../decorators/roles.decorator';
import { UserPresenter } from '../presenters/user.presenter';

@Controller('identity/users')
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard, PermissionsGuard)
@ApiTags('Identity - Users')
@ApiBearerAuth('jwt')
export class UsersController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Post()
  @Roles(UserType.GLOBAL_ADMIN, UserType.TENANT_ADMIN)
  @Permissions('identity.users.create')
  @ApiOperation({ summary: 'Create user / Crear usuario' })
  async create(@CurrentUser() currentUser: AuthenticatedIdentity, @Body() payload: CreateUserDto) {
    const user = await this.commandBus.execute(new CreateUserCommand(currentUser, payload));
    return UserPresenter.toHttp(user);
  }

  @Get()
  @Roles(UserType.GLOBAL_ADMIN, UserType.TENANT_ADMIN)
  @Permissions('identity.users.read')
  @ApiOperation({ summary: 'List users by tenant / Listar usuarios por tenant' })
  async findByTenant(@CurrentUser() currentUser: AuthenticatedIdentity, @Query() query: TenantQueryDto) {
    const users = await this.queryBus.execute(new GetUsersByTenantQuery(currentUser, query.tenantId));
    return users.map(UserPresenter.toHttp);
  }

  @Get(':userId')
  @Permissions('identity.users.read')
  @ApiOperation({ summary: 'Get user by id / Obtener usuario por id' })
  async findById(@CurrentUser() currentUser: AuthenticatedIdentity, @Param() params: UserIdParamDto) {
    const user = await this.queryBus.execute(new GetUserByIdQuery(currentUser, params.userId));
    return UserPresenter.toHttp(user);
  }

  @Patch(':userId')
  @Roles(UserType.GLOBAL_ADMIN, UserType.TENANT_ADMIN)
  @Permissions('identity.users.update')
  @ApiOperation({ summary: 'Update user / Actualizar usuario' })
  async update(@CurrentUser() currentUser: AuthenticatedIdentity, @Param() params: UserIdParamDto, @Body() payload: UpdateUserDto) {
    const user = await this.commandBus.execute(new UpdateUserCommand(currentUser, params.userId, payload));
    return UserPresenter.toHttp(user);
  }

  @Post(':userId/roles')
  @Roles(UserType.TENANT_ADMIN)
  @Permissions('identity.users.roles.assign')
  @ApiOperation({ summary: 'Assign roles to user / Asignar roles a usuario' })
  async assignRoles(@CurrentUser() currentUser: AuthenticatedIdentity, @Param() params: UserIdParamDto, @Body() payload: AssignRolesToUserDto) {
    await this.commandBus.execute(new AssignRolesToUserCommand(currentUser, params.userId, payload.roleIds));
    return { success: true };
  }
}
