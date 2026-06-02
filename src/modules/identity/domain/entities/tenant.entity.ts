import { Status } from '../enums/status.enum';

export class Tenant {
  constructor(
    public readonly id: string,
    public name: string,
    public legalName: string | null,
    public identificationNumber: string | null,
    public status: Status,
    public createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null = null,
  ) {}

  activate(): void {
    this.status = Status.ACTIVE;
  }

  suspend(): void {
    this.status = Status.SUSPENDED;
  }
}
