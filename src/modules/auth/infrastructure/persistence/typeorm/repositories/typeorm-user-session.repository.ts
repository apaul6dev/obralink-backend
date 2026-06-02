import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionStatus } from '../../../../domain/enums/session-status.enum';
import { UserSession } from '../../../../domain/entities/user-session.entity';
import { UserSessionRepository } from '../../../../domain/repositories/user-session.repository.interface';
import { UserSessionOrmEntity } from '../entities/user-session.orm-entity';
import { UserSessionMapper } from './typeorm-mappers';

@Injectable()
export class TypeOrmUserSessionRepository implements UserSessionRepository {
  constructor(
    @InjectRepository(UserSessionOrmEntity)
    private readonly sessions: Repository<UserSessionOrmEntity>,
  ) {}

  async save(session: UserSession): Promise<UserSession> {
    const saved = await this.sessions.save(UserSessionMapper.toOrm(session));
    return UserSessionMapper.toDomain(saved);
  }

  async findById(id: string): Promise<UserSession | null> {
    const session = await this.sessions.findOne({ where: { id } });
    return session ? UserSessionMapper.toDomain(session) : null;
  }

  async findActiveByUserId(userId: string): Promise<UserSession[]> {
    const sessions = await this.sessions.find({
      where: { userId, status: SessionStatus.ACTIVE },
      order: { loginAt: 'DESC' },
    });
    return sessions.map(UserSessionMapper.toDomain);
  }

  async revoke(sessionId: string, logoutAt: Date): Promise<void> {
    await this.sessions.update({ id: sessionId }, { status: SessionStatus.REVOKED, logoutAt, updatedAt: logoutAt });
  }

  async revokeAllActiveByUserId(userId: string, logoutAt: Date): Promise<void> {
    await this.sessions.update({ userId, status: SessionStatus.ACTIVE }, { status: SessionStatus.REVOKED, logoutAt, updatedAt: logoutAt });
  }
}
