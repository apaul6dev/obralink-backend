import { RefreshToken } from '../entities/refresh-token.entity';

export interface RefreshTokenRepository {
  save(token: RefreshToken): Promise<RefreshToken>;
  findActive(): Promise<RefreshToken[]>;
  findActiveBySessionId(sessionId: string): Promise<RefreshToken[]>;
  revoke(tokenId: string, revokedAt: Date, replacedByTokenId?: string | null): Promise<void>;
  revokeActiveBySessionId(sessionId: string, revokedAt: Date): Promise<void>;
  revokeActiveByUserId(userId: string, revokedAt: Date): Promise<void>;
}
