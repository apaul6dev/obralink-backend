import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { RefreshToken } from '../../../../domain/entities/refresh-token.entity';
import { RefreshTokenRepository } from '../../../../domain/repositories/refresh-token.repository.interface';
import { RefreshTokenOrmEntity } from '../entities/refresh-token.orm-entity';
import { RefreshTokenMapper } from './typeorm-mappers';

@Injectable()
export class TypeOrmRefreshTokenRepository implements RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenOrmEntity)
    private readonly refreshTokens: Repository<RefreshTokenOrmEntity>,
  ) {}

  async save(token: RefreshToken): Promise<RefreshToken> {
    const saved = await this.refreshTokens.save(RefreshTokenMapper.toOrm(token));
    return RefreshTokenMapper.toDomain(saved);
  }

  async findActive(): Promise<RefreshToken[]> {
    const tokens = await this.refreshTokens.find({
      where: {
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
    });
    return tokens.map(RefreshTokenMapper.toDomain);
  }

  async findActiveBySessionId(sessionId: string): Promise<RefreshToken[]> {
    const tokens = await this.refreshTokens.find({
      where: {
        sessionId,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
    });
    return tokens.map(RefreshTokenMapper.toDomain);
  }

  async revoke(tokenId: string, revokedAt: Date, replacedByTokenId: string | null = null): Promise<void> {
    await this.refreshTokens.update({ id: tokenId }, { revokedAt, replacedByTokenId, updatedAt: revokedAt });
  }

  async revokeActiveBySessionId(sessionId: string, revokedAt: Date): Promise<void> {
    await this.refreshTokens.update({ sessionId, revokedAt: IsNull() }, { revokedAt, updatedAt: revokedAt });
  }

  async revokeActiveByUserId(userId: string, revokedAt: Date): Promise<void> {
    await this.refreshTokens.update({ userId, revokedAt: IsNull() }, { revokedAt, updatedAt: revokedAt });
  }
}
