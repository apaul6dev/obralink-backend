import { Inject, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { Status } from '../../../identity/domain/enums/status.enum';
import { UserType } from '../../../identity/domain/enums/user-type.enum';
import { AuthEvent } from '../../domain/entities/auth-event.entity';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { UserSession } from '../../domain/entities/user-session.entity';
import { AuthEventType } from '../../domain/enums/auth-event-type.enum';
import { SessionStatus } from '../../domain/enums/session-status.enum';
import { AuthEventRepository } from '../../domain/repositories/auth-event.repository.interface';
import { AuthUserRepository } from '../../domain/repositories/auth-user.repository.interface';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { AUTH_EVENT_REPOSITORY, AUTH_USER_REPOSITORY, REFRESH_TOKEN_REPOSITORY, USER_SESSION_REPOSITORY } from '../../domain/repositories/repository-tokens';
import { UserSessionRepository } from '../../domain/repositories/user-session.repository.interface';
import { PASSWORD_HASHER, PasswordHasher } from '../../domain/services/password-hasher.interface';
import { TOKEN_GENERATOR, TokenGenerator } from '../../domain/services/token-generator.interface';
import { LoginResponseDto } from '../dto/login-response.dto';
import { LoginCommand } from '../commands/login.command';
import { buildUiAccess } from '../services/ui-access.mapper';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  private readonly logger = new Logger(LoginHandler.name);

  constructor(
    @Inject(AUTH_USER_REPOSITORY) private readonly users: AuthUserRepository,
    @Inject(USER_SESSION_REPOSITORY) private readonly sessions: UserSessionRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokens: RefreshTokenRepository,
    @Inject(AUTH_EVENT_REPOSITORY) private readonly authEvents: AuthEventRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_GENERATOR) private readonly tokenGenerator: TokenGenerator,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: LoginCommand): Promise<LoginResponseDto> {
    this.logger.debug(`Login attempt for email=${command.email.toLowerCase()} tenantId=${command.tenantId ?? 'none'} companyIdentifier=${command.companyIdentifier ?? 'none'} ip=${command.ipAddress ?? 'unknown'}`);
    const user = await this.users.findForLogin(command.email, command.tenantId, command.companyIdentifier);
    if (!user) {
      await this.recordFailedLogin(command);
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (user.userType !== UserType.GLOBAL_ADMIN && !user.tenantId) {
      await this.recordFailedLogin(command, user.id, user.tenantId, 'TENANT_CONTEXT_REQUIRED');
      throw new UnauthorizedException('Tenant context is required.');
    }

    if (!user.isActive || user.status !== Status.ACTIVE) {
      await this.recordFailedLogin(command, user.id, user.tenantId, 'USER_NOT_ACTIVE');
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (!user.isTenantActive) {
      await this.recordFailedLogin(command, user.id, user.tenantId, 'TENANT_NOT_ACTIVE');
      throw new UnauthorizedException('Invalid email or password.');
    }

    const passwordMatches = await this.passwordHasher.verify(command.password, user.passwordHash);
    if (!passwordMatches) {
      await this.recordFailedLogin(command, user.id, user.tenantId, 'BAD_PASSWORD');
      throw new UnauthorizedException('Invalid email or password.');
    }

    const now = new Date();
    const sessionTtlSeconds = Number(this.configService.get<string>('AUTH_SESSION_TTL_SECONDS', '604800'));
    const refreshTokenTtlSeconds = Number(this.configService.get<string>('JWT_REFRESH_TOKEN_TTL_SECONDS', '604800'));
    const accessTokenTtlSeconds = Number(this.configService.get<string>('JWT_ACCESS_TOKEN_TTL_SECONDS', '900'));

    const session = await this.sessions.save(
      new UserSession(
        randomUUID(),
        user.id,
        user.tenantId,
        SessionStatus.ACTIVE,
        command.ipAddress,
        command.userAgent,
        now,
        null,
        new Date(now.getTime() + sessionTtlSeconds * 1000),
        now,
        now,
      ),
    );

    const rawRefreshToken = this.tokenGenerator.generateOpaqueToken();
    const refreshTokenHash = await this.passwordHasher.hash(rawRefreshToken);
    await this.refreshTokens.save(
      new RefreshToken(randomUUID(), user.id, session.id, refreshTokenHash, new Date(now.getTime() + refreshTokenTtlSeconds * 1000), null, null, now, now),
    );

    const accessToken = await this.tokenGenerator.signAccessToken({
      sub: user.id,
      email: user.email,
      userType: user.userType,
      tenantId: user.tenantId,
      roles: user.roles,
      permissions: user.permissions,
      sessionId: session.id,
    });

    await this.authEvents.save(new AuthEvent(randomUUID(), AuthEventType.LOGIN, user.id, user.tenantId, session.id, user.email, command.ipAddress, command.userAgent, null, now));
    this.logger.log(`Login succeeded userId=${user.id} tenantId=${user.tenantId ?? 'global'} sessionId=${session.id}`);

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      tokenType: 'Bearer',
      expiresIn: accessTokenTtlSeconds,
      sessionId: session.id,
      user: {
        id: user.id,
        tenantId: user.tenantId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        roles: user.roles,
        permissions: user.permissions,
        ui: buildUiAccess(user.userType, user.permissions),
      },
    };
  }

  private async recordFailedLogin(command: LoginCommand, userId: string | null = null, tenantId: string | null = null, reason = 'NOT_FOUND'): Promise<void> {
    await this.authEvents.save(new AuthEvent(randomUUID(), AuthEventType.FAILED_LOGIN, userId, tenantId, null, command.email.toLowerCase(), command.ipAddress, command.userAgent, { reason }, new Date()));
    this.logger.warn(`Login failed reason=${reason} email=${command.email.toLowerCase()} userId=${userId ?? 'unknown'} tenantId=${tenantId ?? 'none'} ip=${command.ipAddress ?? 'unknown'}`);
  }
}
