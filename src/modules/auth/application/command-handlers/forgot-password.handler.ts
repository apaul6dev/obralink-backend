import { Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { AuthEvent } from '../../domain/entities/auth-event.entity';
import { PasswordResetToken } from '../../domain/entities/password-reset-token.entity';
import { AuthEventType } from '../../domain/enums/auth-event-type.enum';
import { AuthEventRepository } from '../../domain/repositories/auth-event.repository.interface';
import { AuthUserRepository } from '../../domain/repositories/auth-user.repository.interface';
import { PasswordResetTokenRepository } from '../../domain/repositories/password-reset-token.repository.interface';
import { AUTH_EVENT_REPOSITORY, AUTH_USER_REPOSITORY, PASSWORD_RESET_TOKEN_REPOSITORY } from '../../domain/repositories/repository-tokens';
import { PASSWORD_HASHER, PasswordHasher } from '../../domain/services/password-hasher.interface';
import { TOKEN_GENERATOR, TokenGenerator } from '../../domain/services/token-generator.interface';
import { ForgotPasswordCommand } from '../commands/forgot-password.command';

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordHandler implements ICommandHandler<ForgotPasswordCommand> {
  private readonly logger = new Logger(ForgotPasswordHandler.name);

  constructor(
    @Inject(AUTH_USER_REPOSITORY) private readonly users: AuthUserRepository,
    @Inject(PASSWORD_RESET_TOKEN_REPOSITORY) private readonly resetTokens: PasswordResetTokenRepository,
    @Inject(AUTH_EVENT_REPOSITORY) private readonly authEvents: AuthEventRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_GENERATOR) private readonly tokenGenerator: TokenGenerator,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: ForgotPasswordCommand): Promise<{ success: true; resetToken?: string }> {
    const user = await this.users.findForLogin(command.email, command.tenantId, command.companyIdentifier);
    const now = new Date();

    if (!user || !user.isActive || !user.isTenantActive) {
      await this.authEvents.save(new AuthEvent(randomUUID(), AuthEventType.PASSWORD_RESET_REQUESTED, null, null, null, command.email.toLowerCase(), command.ipAddress, command.userAgent, { result: 'IGNORED' }, now));
      this.logger.warn(`Password reset requested for non-eligible account email=${command.email.toLowerCase()} tenantId=${command.tenantId ?? 'none'} ip=${command.ipAddress ?? 'unknown'}`);
      return { success: true };
    }

    const rawToken = this.tokenGenerator.generateOpaqueToken();
    const ttlSeconds = Number(this.configService.get<string>('PASSWORD_RESET_TOKEN_TTL_SECONDS', '3600'));
    await this.resetTokens.save(new PasswordResetToken(randomUUID(), user.id, await this.passwordHasher.hash(rawToken), new Date(now.getTime() + ttlSeconds * 1000), null, now, now));
    await this.authEvents.save(new AuthEvent(randomUUID(), AuthEventType.PASSWORD_RESET_REQUESTED, user.id, user.tenantId, null, user.email, command.ipAddress, command.userAgent, null, now));
    this.logger.log(`Password reset requested userId=${user.id} tenantId=${user.tenantId ?? 'global'}`);

    return process.env.NODE_ENV === 'production' ? { success: true } : { success: true, resetToken: rawToken };
  }
}
