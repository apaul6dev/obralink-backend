import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AssignRolePermissionsDto } from '../../application/dto/role/assign-role-permissions.dto';
import { CreateRoleDto } from '../../application/dto/role/create-role.dto';
import { UpdateRoleDto } from '../../application/dto/role/update-role.dto';
import { CompanyQueryDto, RoleIdParamDto } from '../../application/dto/common/request.dto';
import { RoleAdminService } from '../../application/services/role-admin.service';
import { UserType } from '../../domain/enums/user-type.enum';
import { AuthenticatedIdentity } from '../../domain/services/company-access-policy.service';
import { AuthenticatedIdentityGuard } from '../../infrastructure/security/authenticated-identity.guard';
import { PermissionsGuard } from '../../infrastructure/security/permissions.guard';
import { CompanyGuard } from '../../infrastructure/security/company.guard';
import { RolesGuard } from '../../infrastructure/security/roles.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Permissions } from '../decorators/permissions.decorator';
import { Roles } from '../decorators/roles.decorator';

@Controller('identity/roles')
@UseGuards(AuthenticatedIdentityGuard, CompanyGuard, RolesGuard, PermissionsGuard)
@ApiTags('Identity - Roles')
@ApiCookieAuth('better-auth-session')
export class RolesController {
  constructor(private readonly roleAdminService: RoleAdminService) {}

  @Get()
  @Permissions('identity.roles.read')
  @ApiOperation({ summary: 'List roles by company / Listar roles por empresa' })
  async findByCompany(@CurrentUser() currentUser: AuthenticatedIdentity, @Query() query: CompanyQueryDto) {
    return this.roleAdminService.findAll(currentUser, query.companyId);
  }

  @Post()
  @Roles(UserType.SYSTEM_OWNER)
  @ApiOperation({ summary: 'Create role / Crear rol' })
  async create(@Body() payload: CreateRoleDto) {
    return this.roleAdminService.create(payload);
  }

  @Patch(':roleId')
  @Roles(UserType.SYSTEM_OWNER)
  @ApiOperation({ summary: 'Update role / Actualizar rol' })
  async update(@Param() params: RoleIdParamDto, @Body() payload: UpdateRoleDto) {
    return this.roleAdminService.update(params.roleId, payload);
  }

  @Post(':roleId/permissions')
  @Roles(UserType.SYSTEM_OWNER)
  @ApiOperation({ summary: 'Assign role permissions / Asignar permisos al rol' })
  async assignPermissions(@Param() params: RoleIdParamDto, @Body() payload: AssignRolePermissionsDto) {
    return this.roleAdminService.assignPermissions(params.roleId, payload);
  }

  @Delete(':roleId')
  @Roles(UserType.SYSTEM_OWNER)
  @ApiOperation({ summary: 'Delete role / Eliminar rol' })
  async remove(@Param() params: RoleIdParamDto) {
    await this.roleAdminService.remove(params.roleId);
    return { success: true };
  }
}
