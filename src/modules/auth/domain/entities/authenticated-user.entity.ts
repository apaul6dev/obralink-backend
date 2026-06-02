import { Status } from '../../../identity/domain/enums/status.enum';
import { UserType } from '../../../identity/domain/enums/user-type.enum';

export class AuthenticatedUser {
  constructor(
    public readonly id: string,
    public readonly tenantId: string | null,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly userType: UserType,
    public readonly status: Status,
    public readonly tenantStatus: Status | null,
    public readonly roles: string[],
    public readonly permissions: string[],
    public readonly deletedAt: Date | null,
  ) {}

  get isActive(): boolean {
    return this.status === Status.ACTIVE && !this.deletedAt;
  }

  get isTenantActive(): boolean {
    return !this.tenantId || this.tenantStatus === Status.ACTIVE;
  }
}
