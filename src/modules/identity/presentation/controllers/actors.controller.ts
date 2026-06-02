import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AssignRolesToActorCommand } from '../../application/commands/actor/assign-roles-to-actor.command';
import { CreateActorCommand } from '../../application/commands/actor/create-actor.command';
import { RemoveRolesFromActorCommand } from '../../application/commands/actor/remove-roles-from-actor.command';
import { UpdateActorCommand } from '../../application/commands/actor/update-actor.command';
import { AssignRolesToActorDto } from '../../application/dto/actor/assign-roles-to-actor.dto';
import { CreateActorDto } from '../../application/dto/actor/create-actor.dto';
import { RemoveRolesFromActorDto } from '../../application/dto/actor/remove-roles-from-actor.dto';
import { UpdateActorDto } from '../../application/dto/actor/update-actor.dto';
import { ActorIdParamDto, RoleIdParamDto, TenantQueryDto } from '../../application/dto/common/request.dto';
import { GetActorsByRoleQuery } from '../../application/queries/actor/get-actors-by-role.query';
import { GetActorsByTenantQuery } from '../../application/queries/actor/get-actors-by-tenant.query';
import { UserType } from '../../domain/enums/user-type.enum';
import { AuthenticatedIdentity } from '../../domain/services/tenant-access-policy.service';
import { PermissionsGuard } from '../../infrastructure/security/permissions.guard';
import { RolesGuard } from '../../infrastructure/security/roles.guard';
import { TenantGuard } from '../../infrastructure/security/tenant.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Permissions } from '../decorators/permissions.decorator';
import { Roles } from '../decorators/roles.decorator';
import { ActorPresenter } from '../presenters/actor.presenter';

@Controller('identity/actors')
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard, PermissionsGuard)
@ApiTags('Identity - Actors')
@ApiBearerAuth('jwt')
export class ActorsController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Post()
  @Roles(UserType.TENANT_ADMIN, UserType.TENANT_USER)
  @Permissions('identity.actors.create')
  @ApiOperation({ summary: 'Create business actor / Crear actor de negocio' })
  async create(@CurrentUser() currentUser: AuthenticatedIdentity, @Body() payload: CreateActorDto) {
    const actor = await this.commandBus.execute(new CreateActorCommand(currentUser, payload));
    return ActorPresenter.toHttp(actor);
  }

  @Get()
  @Permissions('identity.actors.read')
  @ApiOperation({ summary: 'List actors by tenant / Listar actores por tenant' })
  async findByTenant(@CurrentUser() currentUser: AuthenticatedIdentity, @Query() query: TenantQueryDto) {
    const actors = await this.queryBus.execute(new GetActorsByTenantQuery(currentUser, query.tenantId));
    return actors.map(ActorPresenter.toHttp);
  }

  @Get('by-role/:roleId')
  @Permissions('identity.actors.read')
  @ApiOperation({ summary: 'List actors by role / Listar actores por rol' })
  async findByRole(@CurrentUser() currentUser: AuthenticatedIdentity, @Param() params: RoleIdParamDto, @Query() query: TenantQueryDto) {
    const actors = await this.queryBus.execute(new GetActorsByRoleQuery(currentUser, params.roleId, query.tenantId));
    return actors.map(ActorPresenter.toHttp);
  }

  @Patch(':actorId')
  @Roles(UserType.TENANT_ADMIN, UserType.TENANT_USER)
  @Permissions('identity.actors.update')
  @ApiOperation({ summary: 'Update business actor / Actualizar actor de negocio' })
  async update(@CurrentUser() currentUser: AuthenticatedIdentity, @Param() params: ActorIdParamDto, @Body() payload: UpdateActorDto) {
    const actor = await this.commandBus.execute(new UpdateActorCommand(currentUser, params.actorId, payload));
    return ActorPresenter.toHttp(actor);
  }

  @Post(':actorId/roles')
  @Roles(UserType.TENANT_ADMIN)
  @Permissions('identity.actors.roles.assign')
  @ApiOperation({ summary: 'Assign roles to actor / Asignar roles al actor' })
  async assignRoles(@CurrentUser() currentUser: AuthenticatedIdentity, @Param() params: ActorIdParamDto, @Body() payload: AssignRolesToActorDto) {
    await this.commandBus.execute(new AssignRolesToActorCommand(currentUser, params.actorId, payload.roleIds));
    return { success: true };
  }

  @Post(':actorId/roles/remove')
  @Roles(UserType.TENANT_ADMIN)
  @Permissions('identity.actors.roles.remove')
  @ApiOperation({ summary: 'Remove roles from actor / Remover roles del actor' })
  async removeRoles(@CurrentUser() currentUser: AuthenticatedIdentity, @Param() params: ActorIdParamDto, @Body() payload: RemoveRolesFromActorDto) {
    await this.commandBus.execute(new RemoveRolesFromActorCommand(currentUser, params.actorId, payload.roleIds));
    return { success: true };
  }
}
