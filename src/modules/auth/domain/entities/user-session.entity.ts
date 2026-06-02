import { SessionStatus } from '../enums/session-status.enum';

export class UserSession {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly tenantId: string | null,
    public status: SessionStatus,
    public readonly ipAddress: string | null,
    public readonly userAgent: string | null,
    public readonly loginAt: Date,
    public logoutAt: Date | null,
    public expiresAt: Date,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null = null,
  ) {}

  revoke(now: Date): void {
    this.status = SessionStatus.REVOKED;
    this.logoutAt = now;
    this.updatedAt = now;
  }
}
