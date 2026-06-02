import { Status } from '../enums/status.enum';
import { UserType } from '../enums/user-type.enum';

export class User {
  constructor(
    public readonly id: string,
    public tenantId: string | null,
    public email: string,
    public passwordHash: string,
    public firstName: string,
    public lastName: string,
    public userType: UserType,
    public status: Status,
    public identificationNumber: string | null,
    public createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null = null,
  ) {}

  belongsToTenant(tenantId: string): boolean {
    return this.tenantId === tenantId;
  }
}
