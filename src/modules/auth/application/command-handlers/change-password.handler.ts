import { Inject, Logger, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { AuthEvent } from '../../domain/entities/auth-event.entity';
import { AuthEventType } from '../../domain/enums/auth-event-type.enum';
import { AuthEventRepository } from '../../domain/repositories/auth-event.repository.interface';
import { AuthUserRepository } from '../../domain/repositories/auth-user.repository.interface';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { AUTH_EVENT_REPOSITORY, AUTH_USER_REPOSITORY, REFRESH_TOKEN_REPOSITORY, USER_SESSION_REPOSITORY } from '../../domain/repositories/repository-tokens';
import { UserSessionRepository } from '../../domain/repositories/user-session.repository.interface';
import { PASSWORD_HASHER, PasswordHasher } from '../../domain/services/password-hasher.interface';
import { ChangePasswordCommand } from '../commands/change-password.command';

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler implements ICommandHandler<ChangePasswordCommand> {
  private readonly logger = new Logger(ChangePasswordHandler.name);

  constructor(
    @Inject(AUTH_USER_REPOSITORY) private readonly users: AuthUserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokens: RefreshTokenRepository,
    @Inject(USER_SESSION_REPOSITORY) private readonly sessions: UserSessionRepository,
    @Inject(AUTH_EVENT_REPOSITORY) private readonly authEvents: AuthEventRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(command: ChangePasswordCommand): Promise<{ success: true }> {
    const user = await this.users.findById(command.userId);
    if (!user || !user.isActive || !user.isTenantActive || user.tenantId !== command.tenantId) {
      throw new UnauthorizedException('Invalid authenticated user.');
    }

    const matches = await this.passwordHasher.verify(command.currentPassword, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedException('Invalid current password.');
    }

    const now = new Date();
    await this.users.updatePasswordHash(user.id, await this.passwordHasher.hash(command.newPassword));
    await this.refreshTokens.revokeActiveByUserId(user.id, now);
    await this.sessions.revokeAllActiveByUserId(user.id, now);
    await this.authEvents.save(new AuthEvent(randomUUID(), AuthEventType.PASSWORD_CHANGED, user.id, user.tenantId, command.sessionId, user.email, command.ipAddress, command.userAgent, null, now));
    this.logger.log(`Password changed userId=${user.id} tenantId=${user.tenantId ?? 'global'} sessionId=${command.sessionId}`);
    return { success: true };
  }
}
