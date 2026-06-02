import { Inject, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { Status } from '../../../identity/domain/enums/status.enum';
import { AuthEvent } from '../../domain/entities/auth-event.entity';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { AuthEventType } from '../../domain/enums/auth-event-type.enum';
import { SessionStatus } from '../../domain/enums/session-status.enum';
import { AuthEventRepository } from '../../domain/repositories/auth-event.repository.interface';
import { AuthUserRepository } from '../../domain/repositories/auth-user.repository.interface';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { AUTH_EVENT_REPOSITORY, AUTH_USER_REPOSITORY, REFRESH_TOKEN_REPOSITORY, USER_SESSION_REPOSITORY } from '../../domain/repositories/repository-tokens';
import { UserSessionRepository } from '../../domain/repositories/user-session.repository.interface';
import { PASSWORD_HASHER, PasswordHasher } from '../../domain/services/password-hasher.interface';
import { TOKEN_GENERATOR, TokenGenerator } from '../../domain/services/token-generator.interface';
import { RefreshTokenCommand } from '../commands/refresh-token.command';
import { LoginResponseDto } from '../dto/login-response.dto';
import { buildUiAccess } from '../services/ui-access.mapper';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand> {
  private readonly logger = new Logger(RefreshTokenHandler.name);

  constructor(
    @Inject(AUTH_USER_REPOSITORY) private readonly users: AuthUserRepository,
    @Inject(USER_SESSION_REPOSITORY) private readonly sessions: UserSessionRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokens: RefreshTokenRepository,
    @Inject(AUTH_EVENT_REPOSITORY) private readonly authEvents: AuthEventRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_GENERATOR) private readonly tokenGenerator: TokenGenerator,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<LoginResponseDto> {
    const activeSessions = await this.findSessionForRefreshToken(command.refreshToken);
    if (!activeSessions) {
      this.logger.warn(`Refresh token rejected ip=${command.ipAddress ?? 'unknown'}`);
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const { sessionId, tokenId, userId } = activeSessions;
    const now = new Date();
    const user = await this.users.findById(userId);
    const session = await this.sessions.findById(sessionId);

    if (!user || !session || session.status !== SessionStatus.ACTIVE || session.expiresAt <= now || !user.isActive || user.status !== Status.ACTIVE || !user.isTenantActive) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const refreshTokenTtlSeconds = Number(this.configService.get<string>('JWT_REFRESH_TOKEN_TTL_SECONDS', '604800'));
    const accessTokenTtlSeconds = Number(this.configService.get<string>('JWT_ACCESS_TOKEN_TTL_SECONDS', '900'));
    const rawRefreshToken = this.tokenGenerator.generateOpaqueToken();
    const newRefreshToken = await this.refreshTokens.save(
      new RefreshToken(randomUUID(), user.id, session.id, await this.passwordHasher.hash(rawRefreshToken), new Date(now.getTime() + refreshTokenTtlSeconds * 1000), null, null, now, now),
    );
    await this.refreshTokens.revoke(tokenId, now, newRefreshToken.id);

    const accessToken = await this.tokenGenerator.signAccessToken({
      sub: user.id,
      email: user.email,
      userType: user.userType,
      tenantId: user.tenantId,
      roles: user.roles,
      permissions: user.permissions,
      sessionId: session.id,
    });

    await this.authEvents.save(new AuthEvent(randomUUID(), AuthEventType.TOKEN_REFRESH, user.id, user.tenantId, session.id, user.email, command.ipAddress, command.userAgent, null, now));
    this.logger.log(`Refresh token rotated userId=${user.id} tenantId=${user.tenantId ?? 'global'} sessionId=${session.id}`);

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

  private async findSessionForRefreshToken(rawRefreshToken: string): Promise<{ sessionId: string; tokenId: string; userId: string } | null> {
    const candidates = await this.refreshTokens.findActive();
    for (const candidate of candidates) {
      if (await this.passwordHasher.verify(rawRefreshToken, candidate.tokenHash)) {
        return {
          sessionId: candidate.sessionId,
          tokenId: candidate.id,
          userId: candidate.userId,
        };
      }
    }
    return null;
  }
}
