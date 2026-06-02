import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActivateTenantCommand } from '../../application/commands/tenant/activate-tenant.command';
import { CreateTenantCommand } from '../../application/commands/tenant/create-tenant.command';
import { SuspendTenantCommand } from '../../application/commands/tenant/suspend-tenant.command';
import { UpdateTenantCommand } from '../../application/commands/tenant/update-tenant.command';
import { CreateTenantDto } from '../../application/dto/tenant/create-tenant.dto';
import { UpdateTenantDto } from '../../application/dto/tenant/update-tenant.dto';
import { TenantIdParamDto } from '../../application/dto/common/request.dto';
import { GetTenantByIdQuery } from '../../application/queries/tenant/get-tenant-by-id.query';
import { GetTenantsQuery } from '../../application/queries/tenant/get-tenants.query';
import { UserType } from '../../domain/enums/user-type.enum';
import { AuthenticatedIdentity } from '../../domain/services/tenant-access-policy.service';
import { RolesGuard } from '../../infrastructure/security/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { TenantPresenter } from '../presenters/tenant.presenter';

@Controller('identity/tenants')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Identity - Tenants')
@ApiBearerAuth('jwt')
export class TenantsController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Post()
  @Roles(UserType.GLOBAL_ADMIN)
  @ApiOperation({ summary: 'Create tenant / Crear tenant' })
  async create(@CurrentUser() currentUser: AuthenticatedIdentity, @Body() payload: CreateTenantDto) {
    const tenant = await this.commandBus.execute(new CreateTenantCommand(currentUser, payload));
    return TenantPresenter.toHttp(tenant);
  }

  @Get()
  @Roles(UserType.GLOBAL_ADMIN)
  @ApiOperation({ summary: 'List tenants / Listar tenants' })
  async findAll(@CurrentUser() currentUser: AuthenticatedIdentity) {
    const tenants = await this.queryBus.execute(new GetTenantsQuery(currentUser));
    return tenants.map(TenantPresenter.toHttp);
  }

  @Get(':tenantId')
  @ApiOperation({ summary: 'Get tenant by id / Obtener tenant por id' })
  async findById(@CurrentUser() currentUser: AuthenticatedIdentity, @Param() params: TenantIdParamDto) {
    const tenant = await this.queryBus.execute(new GetTenantByIdQuery(currentUser, params.tenantId));
    return TenantPresenter.toHttp(tenant);
  }

  @Patch(':tenantId')
  @Roles(UserType.GLOBAL_ADMIN)
  @ApiOperation({ summary: 'Update tenant / Actualizar tenant' })
  async update(@CurrentUser() currentUser: AuthenticatedIdentity, @Param() params: TenantIdParamDto, @Body() payload: UpdateTenantDto) {
    const tenant = await this.commandBus.execute(new UpdateTenantCommand(currentUser, params.tenantId, payload));
    return TenantPresenter.toHttp(tenant);
  }

  @Patch(':tenantId/activate')
  @Roles(UserType.GLOBAL_ADMIN)
  @ApiOperation({ summary: 'Activate tenant / Activar tenant' })
  async activate(@CurrentUser() currentUser: AuthenticatedIdentity, @Param() params: TenantIdParamDto) {
    const tenant = await this.commandBus.execute(new ActivateTenantCommand(currentUser, params.tenantId));
    return TenantPresenter.toHttp(tenant);
  }

  @Patch(':tenantId/suspend')
  @Roles(UserType.GLOBAL_ADMIN)
  @ApiOperation({ summary: 'Suspend tenant / Suspender tenant' })
  async suspend(@CurrentUser() currentUser: AuthenticatedIdentity, @Param() params: TenantIdParamDto) {
    const tenant = await this.commandBus.execute(new SuspendTenantCommand(currentUser, params.tenantId));
    return TenantPresenter.toHttp(tenant);
  }
}
