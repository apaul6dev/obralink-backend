import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreatePermissionDto } from '../../application/dto/permission/create-permission.dto';
import { UpdatePermissionDto } from '../../application/dto/permission/update-permission.dto';
import { PermissionIdParamDto } from '../../application/dto/common/request.dto';
import { PermissionAdminService } from '../../application/services/permission-admin.service';
import { UserType } from '../../domain/enums/user-type.enum';
import { AuthenticatedIdentityGuard } from '../../infrastructure/security/authenticated-identity.guard';
import { RolesGuard } from '../../infrastructure/security/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@Controller('identity/permissions')
@UseGuards(AuthenticatedIdentityGuard, RolesGuard)
@Roles(UserType.SYSTEM_OWNER)
@ApiTags('Identity - Permissions')
@ApiCookieAuth('better-auth-session')
export class PermissionsController {
  constructor(private readonly permissionAdminService: PermissionAdminService) {}

  @Get()
  @ApiOperation({ summary: 'List permissions / Listar permisos' })
  async findAll() {
    return this.permissionAdminService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create permission / Crear permiso' })
  async create(@Body() payload: CreatePermissionDto) {
    return this.permissionAdminService.create(payload);
  }

  @Patch(':permissionId')
  @ApiOperation({ summary: 'Update permission / Actualizar permiso' })
  async update(@Param() params: PermissionIdParamDto, @Body() payload: UpdatePermissionDto) {
    return this.permissionAdminService.update(params.permissionId, payload);
  }

  @Delete(':permissionId')
  @ApiOperation({ summary: 'Delete permission / Eliminar permiso' })
  async remove(@Param() params: PermissionIdParamDto) {
    await this.permissionAdminService.remove(params.permissionId);
    return { success: true };
  }
}
