import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MenuQueryService } from '../../application/services/menu-query.service';
import { AuthenticatedIdentity } from '../../domain/services/company-access-policy.service';
import { AuthenticatedIdentityGuard } from '../../infrastructure/security/authenticated-identity.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('identity/menu')
@UseGuards(AuthenticatedIdentityGuard)
@ApiTags('Identity - Menu')
@ApiCookieAuth('better-auth-session')
export class MenuController {
  constructor(private readonly menuQueryService: MenuQueryService) {}

  @Get()
  @ApiOperation({ summary: 'Get authorized menu options / Obtener opciones de menu autorizadas' })
  async findAuthorizedMenu(@CurrentUser() currentUser: AuthenticatedIdentity) {
    return this.menuQueryService.findAuthorizedMenu(currentUser);
  }
}
