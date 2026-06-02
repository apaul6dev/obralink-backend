import { Inject, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Status } from '../../../identity/domain/enums/status.enum';
import { SessionStatus } from '../../domain/enums/session-status.enum';
import { AuthUserRepository } from '../../domain/repositories/auth-user.repository.interface';
import { AUTH_USER_REPOSITORY, USER_SESSION_REPOSITORY } from '../../domain/repositories/repository-tokens';
import { UserSessionRepository } from '../../domain/repositories/user-session.repository.interface';
import { ValidateAccessTokenCommand } from '../commands/validate-access-token.command';

@CommandHandler(ValidateAccessTokenCommand)
export class ValidateAccessTokenHandler implements ICommandHandler<ValidateAccessTokenCommand> {
  constructor(
    @Inject(AUTH_USER_REPOSITORY) private readonly users: AuthUserRepository,
    @Inject(USER_SESSION_REPOSITORY) private readonly sessions: UserSessionRepository,
  ) {}

  async execute(command: ValidateAccessTokenCommand): Promise<void> {
    const [user, session] = await Promise.all([
      this.users.findById(command.userId),
      this.sessions.findById(command.sessionId),
    ]);

    if (!user || !session || session.userId !== command.userId || session.tenantId !== command.tenantId) {
      throw new UnauthorizedException('Invalid access token.');
    }

    if (!user.isActive || user.status !== Status.ACTIVE || !user.isTenantActive) {
      throw new UnauthorizedException('User or tenant is not active.');
    }

    if (session.status !== SessionStatus.ACTIVE || session.expiresAt <= new Date()) {
      throw new UnauthorizedException('Session is not active.');
    }
  }
}
