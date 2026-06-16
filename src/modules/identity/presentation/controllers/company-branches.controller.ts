import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateCompanyBranchDto } from '../../application/dto/company-branch/create-company-branch.dto';
import { UpdateCompanyBranchDto } from '../../application/dto/company-branch/update-company-branch.dto';
import { CompanyBranchIdParamDto, CompanyIdParamDto } from '../../application/dto/common/request.dto';
import { CompanyBranchAdminService } from '../../application/services/company-branch-admin.service';
import { PermissionCode } from '../../domain/constants';
import { UserType } from '../../domain/enums/user-type.enum';
import { AuthenticatedIdentity } from '../../domain/services/company-access-policy.service';
import { AuthenticatedIdentityGuard } from '../../infrastructure/security/authenticated-identity.guard';
import { CompanyGuard } from '../../infrastructure/security/company.guard';
import { PermissionsGuard } from '../../infrastructure/security/permissions.guard';
import { RolesGuard } from '../../infrastructure/security/roles.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Permissions } from '../decorators/permissions.decorator';
import { Roles } from '../decorators/roles.decorator';

@Controller('identity/companies/:companyId/branches')
@UseGuards(AuthenticatedIdentityGuard, CompanyGuard, RolesGuard, PermissionsGuard)
@ApiTags('Identity - Company Branches')
@ApiCookieAuth('better-auth-session')
export class CompanyBranchesController {
  constructor(private readonly branchAdminService: CompanyBranchAdminService) {}

  @Get()
  @Permissions(PermissionCode.IdentityBranchesRead)
  @ApiOperation({ summary: 'List company branches / Listar sucursales de empresa' })
  async findByCompany(@CurrentUser() currentUser: AuthenticatedIdentity, @Param() params: CompanyIdParamDto) {
    return this.branchAdminService.findByCompany(currentUser, params.companyId);
  }

  @Post()
  @Roles(UserType.SYSTEM_OWNER, UserType.COMPANY_ADMIN)
  @Permissions(PermissionCode.IdentityBranchesCreate)
  @ApiOperation({ summary: 'Create company branch / Crear sucursal' })
  async create(@CurrentUser() currentUser: AuthenticatedIdentity, @Param() params: CompanyIdParamDto, @Body() payload: CreateCompanyBranchDto) {
    return this.branchAdminService.create(currentUser, params.companyId, payload);
  }

  @Patch(':branchId')
  @Roles(UserType.SYSTEM_OWNER, UserType.COMPANY_ADMIN)
  @Permissions(PermissionCode.IdentityBranchesUpdate)
  @ApiOperation({ summary: 'Update company branch / Actualizar sucursal' })
  async update(@CurrentUser() currentUser: AuthenticatedIdentity, @Param() params: CompanyBranchIdParamDto, @Body() payload: UpdateCompanyBranchDto) {
    return this.branchAdminService.update(currentUser, params.companyId, params.branchId, payload);
  }

  @Delete(':branchId')
  @Roles(UserType.SYSTEM_OWNER, UserType.COMPANY_ADMIN)
  @Permissions(PermissionCode.IdentityBranchesDelete)
  @ApiOperation({ summary: 'Delete company branch / Eliminar sucursal' })
  async remove(@CurrentUser() currentUser: AuthenticatedIdentity, @Param() params: CompanyBranchIdParamDto) {
    await this.branchAdminService.remove(currentUser, params.companyId, params.branchId);
    return { success: true };
  }
}
