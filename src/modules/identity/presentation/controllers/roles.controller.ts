import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROLE_REPOSITORY } from '../../domain/repositories/repository-tokens';
import { CompanyQueryDto } from '../../application/dto/common/request.dto';
import { RoleRepository } from '../../domain/repositories/role.repository.interface';
import { AuthenticatedIdentity, CompanyAccessPolicyService } from '../../domain/services/company-access-policy.service';
import { AuthenticatedIdentityGuard } from '../../infrastructure/security/authenticated-identity.guard';
import { PermissionsGuard } from '../../infrastructure/security/permissions.guard';
import { CompanyGuard } from '../../infrastructure/security/company.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Permissions } from '../decorators/permissions.decorator';

@Controller('identity/roles')
@UseGuards(AuthenticatedIdentityGuard, CompanyGuard, PermissionsGuard)
@ApiTags('Identity - Roles')
@ApiCookieAuth('better-auth-session')
export class RolesController {
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: RoleRepository,
    private readonly accessPolicy: CompanyAccessPolicyService,
  ) {}

  @Get()
  @Permissions('identity.roles.read')
  @ApiOperation({ summary: 'List roles by company / Listar roles por empresa' })
  async findByCompany(@CurrentUser() currentUser: AuthenticatedIdentity, @Query() query: CompanyQueryDto) {
    const resolvedCompanyId = this.accessPolicy.resolveCompanyIdForCompanyOperation(currentUser, query.companyId);
    return this.roleRepository.findByCompanyId(resolvedCompanyId);
  }
}
