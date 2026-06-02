import { Inject, Logger, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { AuthEvent } from '../../domain/entities/auth-event.entity';
import { AuthEventType } from '../../domain/enums/auth-event-type.enum';
import { AuthEventRepository } from '../../domain/repositories/auth-event.repository.interface';
import { AuthUserRepository } from '../../domain/repositories/auth-user.repository.interface';
import { PasswordResetTokenRepository } from '../../domain/repositories/password-reset-token.repository.interface';
import { AUTH_EVENT_REPOSITORY, AUTH_USER_REPOSITORY, PASSWORD_RESET_TOKEN_REPOSITORY, REFRESH_TOKEN_REPOSITORY, USER_SESSION_REPOSITORY } from '../../domain/repositories/repository-tokens';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { UserSessionRepository } from '../../domain/repositories/user-session.repository.interface';
import { PASSWORD_HASHER, PasswordHasher } from '../../domain/services/password-hasher.interface';
import { ResetPasswordCommand } from '../commands/reset-password.command';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler implements ICommandHandler<ResetPasswordCommand> {
  private readonly logger = new Logger(ResetPasswordHandler.name);

  constructor(
    @Inject(AUTH_USER_REPOSITORY) private readonly users: AuthUserRepository,
    @Inject(PASSWORD_RESET_TOKEN_REPOSITORY) private readonly resetTokens: PasswordResetTokenRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokens: RefreshTokenRepository,
    @Inject(USER_SESSION_REPOSITORY) private readonly sessions: UserSessionRepository,
    @Inject(AUTH_EVENT_REPOSITORY) private readonly authEvents: AuthEventRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(command: ResetPasswordCommand): Promise<{ success: true }> {
    const tokens = await this.resetTokens.findActive();
    const resetToken = await (async () => {
      for (const token of tokens) {
        if (await this.passwordHasher.verify(command.token, token.tokenHash)) {
          return token;
        }
      }
      return null;
    })();

    if (!resetToken) {
      throw new UnauthorizedException('Invalid reset token.');
    }

    const user = await this.users.findById(resetToken.userId);
    if (!user || !user.isActive || !user.isTenantActive) {
      throw new UnauthorizedException('Invalid reset token.');
    }

    const now = new Date();
    await this.users.updatePasswordHash(user.id, await this.passwordHasher.hash(command.newPassword));
    await this.resetTokens.markUsed(resetToken.id, now);
    await this.refreshTokens.revokeActiveByUserId(user.id, now);
    await this.sessions.revokeAllActiveByUserId(user.id, now);
    await this.authEvents.save(new AuthEvent(randomUUID(), AuthEventType.PASSWORD_RESET, user.id, user.tenantId, null, user.email, command.ipAddress, command.userAgent, null, now));
    this.logger.log(`Password reset completed userId=${user.id} tenantId=${user.tenantId ?? 'global'}`);

    return { success: true };
  }
}
