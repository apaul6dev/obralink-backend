import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreatePermissionDto } from '../../application/dto/permission/create-permission.dto';
import { UpdatePermissionDto } from '../../application/dto/permission/update-permission.dto';
import { PermissionIdParamDto } from '../../application/dto/common/request.dto';
import { PermissionAdminService } from '../../application/services/permission-admin.service';
import { PermissionCode } from '../../domain/constants';
import { UserType } from '../../domain/enums/user-type.enum';
import { AuthenticatedIdentityGuard } from '../../infrastructure/security/authenticated-identity.guard';
import { PermissionsGuard } from '../../infrastructure/security/permissions.guard';
import { RolesGuard } from '../../infrastructure/security/roles.guard';
import { Permissions } from '../decorators/permissions.decorator';
import { Roles } from '../decorators/roles.decorator';

@Controller('identity/permissions')
@UseGuards(AuthenticatedIdentityGuard, RolesGuard, PermissionsGuard)
@ApiTags('Identity - Permissions')
@ApiCookieAuth('better-auth-session')
export class PermissionsController {
  constructor(private readonly permissionAdminService: PermissionAdminService) {}

  @Get('catalog')
  @Roles(UserType.SYSTEM_OWNER, UserType.COMPANY_ADMIN)
  @Permissions(PermissionCode.IdentityPermissionsRead)
  @ApiOperation({ summary: 'Get grouped permission catalog / Obtener catalogo agrupado de permisos' })
  async findCatalog() {
    return this.permissionAdminService.findCatalog();
  }

  @Get('catalog/ui')
  @Roles(UserType.SYSTEM_OWNER, UserType.COMPANY_ADMIN)
  @Permissions(PermissionCode.IdentityPermissionsRead)
  @ApiOperation({ summary: 'Get grouped UI permission catalog / Obtener catalogo agrupado de permisos UI' })
  async findUiCatalog() {
    return this.permissionAdminService.findCatalog('UI');
  }

  @Get()
  @Roles(UserType.SYSTEM_OWNER, UserType.COMPANY_ADMIN)
  @Permissions(PermissionCode.IdentityPermissionsRead)
  @ApiOperation({ summary: 'List permissions / Listar permisos' })
  async findAll() {
    return this.permissionAdminService.findAll();
  }

  @Post()
  @Roles(UserType.SYSTEM_OWNER)
  @ApiOperation({ summary: 'Create permission / Crear permiso' })
  async create(@Body() payload: CreatePermissionDto) {
    return this.permissionAdminService.create(payload);
  }

  @Patch(':permissionId')
  @Roles(UserType.SYSTEM_OWNER)
  @ApiOperation({ summary: 'Update permission / Actualizar permiso' })
  async update(@Param() params: PermissionIdParamDto, @Body() payload: UpdatePermissionDto) {
    return this.permissionAdminService.update(params.permissionId, payload);
  }

  @Delete(':permissionId')
  @Roles(UserType.SYSTEM_OWNER)
  @ApiOperation({ summary: 'Delete permission / Eliminar permiso' })
  async remove(@Param() params: PermissionIdParamDto) {
    await this.permissionAdminService.remove(params.permissionId);
    return { success: true };
  }
}
