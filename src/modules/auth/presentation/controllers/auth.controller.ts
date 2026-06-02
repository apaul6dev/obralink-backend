import { Body, Controller, Get, Headers, Ip, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ChangePasswordCommand } from '../../application/commands/change-password.command';
import { ForgotPasswordCommand } from '../../application/commands/forgot-password.command';
import { LoginCommand } from '../../application/commands/login.command';
import { LogoutAllDevicesCommand } from '../../application/commands/logout-all-devices.command';
import { LogoutCommand } from '../../application/commands/logout.command';
import { RefreshTokenCommand } from '../../application/commands/refresh-token.command';
import { ResetPasswordCommand } from '../../application/commands/reset-password.command';
import { ChangePasswordRequestDto } from '../../application/dto/change-password-request.dto';
import { ForgotPasswordRequestDto } from '../../application/dto/forgot-password-request.dto';
import { LoginRequestDto } from '../../application/dto/login-request.dto';
import { LoginResponseDto } from '../../application/dto/login-response.dto';
import { RefreshTokenRequestDto } from '../../application/dto/refresh-token-request.dto';
import { ResetPasswordRequestDto } from '../../application/dto/reset-password-request.dto';
import { GetActiveSessionsQuery } from '../../application/queries/get-active-sessions.query';
import { GetCurrentUserQuery } from '../../application/queries/get-current-user.query';
import { AuthenticatedRequestUser } from '../../infrastructure/security/jwt.strategy';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Public } from '../decorators/public.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
@ApiTags('Authentication / Autenticacion')
@UseGuards(ThrottlerGuard, JwtAuthGuard)
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('login')
  @Public()
  @Throttle({ login: {} })
  @ApiOperation({ summary: 'Login / Iniciar sesion' })
  async login(
    @Body() payload: LoginRequestDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent?: string,
  ): Promise<LoginResponseDto> {
    return this.commandBus.execute(new LoginCommand(payload.email, payload.password, payload.tenantId ?? null, payload.companyIdentifier ?? null, ipAddress ?? null, userAgent ?? null));
  }

  @Post('refresh-token')
  @Public()
  @ApiOperation({ summary: 'Refresh token / Refrescar token' })
  async refreshToken(@Body() payload: RefreshTokenRequestDto, @Ip() ipAddress: string, @Headers('user-agent') userAgent?: string): Promise<LoginResponseDto> {
    return this.commandBus.execute(new RefreshTokenCommand(payload.refreshToken, ipAddress ?? null, userAgent ?? null));
  }

  @Post('logout')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Logout / Cerrar sesion' })
  async logout(@CurrentUser() user: AuthenticatedRequestUser, @Ip() ipAddress: string, @Headers('user-agent') userAgent?: string): Promise<{ success: true }> {
    return this.commandBus.execute(new LogoutCommand(user.id, user.tenantId, user.sessionId, ipAddress ?? null, userAgent ?? null));
  }

  @Post('logout-all')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Logout from all devices / Cerrar sesion en todos los dispositivos' })
  async logoutAll(@CurrentUser() user: AuthenticatedRequestUser, @Ip() ipAddress: string, @Headers('user-agent') userAgent?: string): Promise<{ success: true }> {
    return this.commandBus.execute(new LogoutAllDevicesCommand(user.id, user.tenantId, user.sessionId, ipAddress ?? null, userAgent ?? null));
  }

  @Post('forgot-password')
  @Public()
  @Throttle({ passwordRecovery: {} })
  @ApiOperation({ summary: 'Forgot password / Olvide mi contrasena' })
  async forgotPassword(@Body() payload: ForgotPasswordRequestDto, @Ip() ipAddress: string, @Headers('user-agent') userAgent?: string): Promise<{ success: true; resetToken?: string }> {
    return this.commandBus.execute(new ForgotPasswordCommand(payload.email, payload.tenantId ?? null, payload.companyIdentifier ?? null, ipAddress ?? null, userAgent ?? null));
  }

  @Post('reset-password')
  @Public()
  @ApiOperation({ summary: 'Reset password / Restablecer contrasena' })
  async resetPassword(@Body() payload: ResetPasswordRequestDto, @Ip() ipAddress: string, @Headers('user-agent') userAgent?: string): Promise<{ success: true }> {
    return this.commandBus.execute(new ResetPasswordCommand(payload.token, payload.newPassword, ipAddress ?? null, userAgent ?? null));
  }

  @Post('change-password')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Change password / Cambiar contrasena' })
  async changePassword(@CurrentUser() user: AuthenticatedRequestUser, @Body() payload: ChangePasswordRequestDto, @Ip() ipAddress: string, @Headers('user-agent') userAgent?: string): Promise<{ success: true }> {
    return this.commandBus.execute(new ChangePasswordCommand(user.id, user.tenantId, user.sessionId, payload.currentPassword, payload.newPassword, ipAddress ?? null, userAgent ?? null));
  }

  @Get('me')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Get current user / Obtener usuario actual' })
  async me(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.queryBus.execute(new GetCurrentUserQuery(user.id, user.email, user.userType, user.tenantId, user.sessionId, user.roles, user.permissions));
  }

  @Get('sessions')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Get active sessions / Obtener sesiones activas' })
  async sessions(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.queryBus.execute(new GetActiveSessionsQuery(user.id));
  }
}
