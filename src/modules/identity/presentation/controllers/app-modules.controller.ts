import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateAppModuleDto } from '../../application/dto/app-module/create-app-module.dto';
import { UpdateAppModuleDto } from '../../application/dto/app-module/update-app-module.dto';
import { AppModuleIdParamDto } from '../../application/dto/common/request.dto';
import { AppModuleAdminService } from '../../application/services/app-module-admin.service';
import { UserType } from '../../domain/enums/user-type.enum';
import { AuthenticatedIdentityGuard } from '../../infrastructure/security/authenticated-identity.guard';
import { RolesGuard } from '../../infrastructure/security/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@Controller('identity/modules')
@UseGuards(AuthenticatedIdentityGuard, RolesGuard)
@Roles(UserType.SYSTEM_OWNER)
@ApiTags('Identity - Modules')
@ApiCookieAuth('better-auth-session')
export class AppModulesController {
  constructor(private readonly appModuleAdminService: AppModuleAdminService) {}

  @Get()
  @ApiOperation({ summary: 'List modules / Listar modulos' })
  async findAll() {
    return this.appModuleAdminService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create module / Crear modulo' })
  async create(@Body() payload: CreateAppModuleDto) {
    return this.appModuleAdminService.create(payload);
  }

  @Patch(':moduleId')
  @ApiOperation({ summary: 'Update module / Actualizar modulo' })
  async update(@Param() params: AppModuleIdParamDto, @Body() payload: UpdateAppModuleDto) {
    return this.appModuleAdminService.update(params.moduleId, payload);
  }

  @Delete(':moduleId')
  @ApiOperation({ summary: 'Delete module / Eliminar modulo' })
  async remove(@Param() params: AppModuleIdParamDto) {
    await this.appModuleAdminService.remove(params.moduleId);
    return { success: true };
  }
}
