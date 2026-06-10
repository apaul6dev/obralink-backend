import { Status } from '../enums/status.enum';
import { UserType } from '../enums/user-type.enum';

export class User {
  constructor(
    public readonly id: string,
    public companyId: string | null,
    public email: string,
    public firstName: string,
    public lastName: string,
    public userType: UserType,
    public status: Status,
    public identificationNumber: string | null,
    public personalEmail: string | null,
    public phoneNumber: string | null,
    public createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null = null,
  ) {}

  belongsToCompany(companyId: string): boolean {
    return this.companyId === companyId;
  }
}
