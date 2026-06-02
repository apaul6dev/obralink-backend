import { UserSession } from '../entities/user-session.entity';

export interface UserSessionRepository {
  save(session: UserSession): Promise<UserSession>;
  findById(id: string): Promise<UserSession | null>;
  findActiveByUserId(userId: string): Promise<UserSession[]>;
  revoke(sessionId: string, logoutAt: Date): Promise<void>;
  revokeAllActiveByUserId(userId: string, logoutAt: Date): Promise<void>;
}
