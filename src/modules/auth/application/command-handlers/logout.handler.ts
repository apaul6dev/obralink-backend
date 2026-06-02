import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { AuthEvent } from '../../domain/entities/auth-event.entity';
import { AuthEventType } from '../../domain/enums/auth-event-type.enum';
import { AuthEventRepository } from '../../domain/repositories/auth-event.repository.interface';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { AUTH_EVENT_REPOSITORY, REFRESH_TOKEN_REPOSITORY, USER_SESSION_REPOSITORY } from '../../domain/repositories/repository-tokens';
import { UserSessionRepository } from '../../domain/repositories/user-session.repository.interface';
import { LogoutCommand } from '../commands/logout.command';

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  private readonly logger = new Logger(LogoutHandler.name);

  constructor(
    @Inject(USER_SESSION_REPOSITORY) private readonly sessions: UserSessionRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokens: RefreshTokenRepository,
    @Inject(AUTH_EVENT_REPOSITORY) private readonly authEvents: AuthEventRepository,
  ) {}

  async execute(command: LogoutCommand): Promise<{ success: true }> {
    const now = new Date();
    await this.refreshTokens.revokeActiveBySessionId(command.sessionId, now);
    await this.sessions.revoke(command.sessionId, now);
    await this.authEvents.save(new AuthEvent(randomUUID(), AuthEventType.LOGOUT, command.userId, command.tenantId, command.sessionId, null, command.ipAddress, command.userAgent, null, now));
    this.logger.log(`Logout succeeded userId=${command.userId} tenantId=${command.tenantId ?? 'global'} sessionId=${command.sessionId}`);
    return { success: true };
  }
}
