import { PasswordResetToken } from '../entities/password-reset-token.entity';

export interface PasswordResetTokenRepository {
  save(token: PasswordResetToken): Promise<PasswordResetToken>;
  findActive(): Promise<PasswordResetToken[]>;
  findActiveByUserId(userId: string): Promise<PasswordResetToken[]>;
  markUsed(tokenId: string, usedAt: Date): Promise<void>;
}
