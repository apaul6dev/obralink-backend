import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateMenuItemDto } from '../../application/dto/menu/create-menu-item.dto';
import { UpdateMenuItemDto } from '../../application/dto/menu/update-menu-item.dto';
import { MenuItemIdParamDto } from '../../application/dto/common/request.dto';
import { MenuAdminService } from '../../application/services/menu-admin.service';
import { MenuQueryService } from '../../application/services/menu-query.service';
import { UserType } from '../../domain/enums/user-type.enum';
import { AuthenticatedIdentity } from '../../domain/services/company-access-policy.service';
import { AuthenticatedIdentityGuard } from '../../infrastructure/security/authenticated-identity.guard';
import { RolesGuard } from '../../infrastructure/security/roles.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Roles } from '../decorators/roles.decorator';

@Controller('identity/menu')
@UseGuards(AuthenticatedIdentityGuard, RolesGuard)
@ApiTags('Identity - Menu')
@ApiCookieAuth('better-auth-session')
export class MenuController {
  constructor(
    private readonly menuQueryService: MenuQueryService,
    private readonly menuAdminService: MenuAdminService,
  ) {}

  @Get('admin')
  @Roles(UserType.SYSTEM_OWNER)
  @ApiOperation({ summary: 'List menu items for administration / Listar items de menu para administracion' })
  async findAllForAdmin() {
    return this.menuAdminService.findAll();
  }

  @Post('admin')
  @Roles(UserType.SYSTEM_OWNER)
  @ApiOperation({ summary: 'Create menu item / Crear item de menu' })
  async create(@Body() payload: CreateMenuItemDto) {
    return this.menuAdminService.create(payload);
  }

  @Patch('admin/:menuItemId')
  @Roles(UserType.SYSTEM_OWNER)
  @ApiOperation({ summary: 'Update menu item / Actualizar item de menu' })
  async update(@Param() params: MenuItemIdParamDto, @Body() payload: UpdateMenuItemDto) {
    return this.menuAdminService.update(params.menuItemId, payload);
  }

  @Delete('admin/:menuItemId')
  @Roles(UserType.SYSTEM_OWNER)
  @ApiOperation({ summary: 'Delete menu item / Eliminar item de menu' })
  async remove(@Param() params: MenuItemIdParamDto) {
    await this.menuAdminService.remove(params.menuItemId);
    return { success: true };
  }

  @Get()
  @ApiOperation({ summary: 'Get authorized menu options / Obtener opciones de menu autorizadas' })
  async findAuthorizedMenu(@CurrentUser() currentUser: AuthenticatedIdentity) {
    return this.menuQueryService.findAuthorizedMenu(currentUser);
  }
}
