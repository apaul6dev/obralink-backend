import { AuthEventType } from '../enums/auth-event-type.enum';

export class AuthEvent {
  constructor(
    public readonly id: string,
    public readonly type: AuthEventType,
    public readonly userId: string | null,
    public readonly tenantId: string | null,
    public readonly sessionId: string | null,
    public readonly email: string | null,
    public readonly ipAddress: string | null,
    public readonly userAgent: string | null,
    public readonly metadata: Record<string, unknown> | null,
    public readonly createdAt: Date,
  ) {}
}
