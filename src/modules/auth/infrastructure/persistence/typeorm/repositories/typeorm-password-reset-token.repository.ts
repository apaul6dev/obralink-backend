import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { PasswordResetToken } from '../../../../domain/entities/password-reset-token.entity';
import { PasswordResetTokenRepository } from '../../../../domain/repositories/password-reset-token.repository.interface';
import { PasswordResetTokenOrmEntity } from '../entities/password-reset-token.orm-entity';
import { PasswordResetTokenMapper } from './typeorm-mappers';

@Injectable()
export class TypeOrmPasswordResetTokenRepository implements PasswordResetTokenRepository {
  constructor(
    @InjectRepository(PasswordResetTokenOrmEntity)
    private readonly resetTokens: Repository<PasswordResetTokenOrmEntity>,
  ) {}

  async save(token: PasswordResetToken): Promise<PasswordResetToken> {
    const saved = await this.resetTokens.save(PasswordResetTokenMapper.toOrm(token));
    return PasswordResetTokenMapper.toDomain(saved);
  }

  async findActive(): Promise<PasswordResetToken[]> {
    const tokens = await this.resetTokens.find({
      where: { usedAt: IsNull(), expiresAt: MoreThan(new Date()) },
      order: { createdAt: 'DESC' },
    });
    return tokens.map(PasswordResetTokenMapper.toDomain);
  }

  async findActiveByUserId(userId: string): Promise<PasswordResetToken[]> {
    const tokens = await this.resetTokens.find({
      where: { userId, usedAt: IsNull(), expiresAt: MoreThan(new Date()) },
      order: { createdAt: 'DESC' },
    });
    return tokens.map(PasswordResetTokenMapper.toDomain);
  }

  async markUsed(tokenId: string, usedAt: Date): Promise<void> {
    await this.resetTokens.update({ id: tokenId }, { usedAt, updatedAt: usedAt });
  }
}
