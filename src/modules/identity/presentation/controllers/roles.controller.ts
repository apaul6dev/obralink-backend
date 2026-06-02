import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Inject } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROLE_REPOSITORY } from '../../domain/repositories/repository-tokens';
import { TenantQueryDto } from '../../application/dto/common/request.dto';
import { RoleRepository } from '../../domain/repositories/role.repository.interface';
import { AuthenticatedIdentity, TenantAccessPolicyService } from '../../domain/services/tenant-access-policy.service';
import { PermissionsGuard } from '../../infrastructure/security/permissions.guard';
import { TenantGuard } from '../../infrastructure/security/tenant.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Permissions } from '../decorators/permissions.decorator';

@Controller('identity/roles')
@UseGuards(AuthGuard('jwt'), TenantGuard, PermissionsGuard)
@ApiTags('Identity - Roles')
@ApiBearerAuth('jwt')
export class RolesController {
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: RoleRepository,
    private readonly accessPolicy: TenantAccessPolicyService,
  ) {}

  @Get()
  @Permissions('identity.roles.read')
  @ApiOperation({ summary: 'List roles by tenant / Listar roles por tenant' })
  async findByTenant(@CurrentUser() currentUser: AuthenticatedIdentity, @Query() query: TenantQueryDto) {
    const resolvedTenantId = this.accessPolicy.resolveTenantIdForTenantOperation(currentUser, query.tenantId);
    return this.roleRepository.findByTenantId(resolvedTenantId);
  }
}
