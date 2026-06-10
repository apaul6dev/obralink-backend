import { Status } from '../enums/status.enum';

export class Company {
  constructor(
    public readonly id: string,
    public name: string,
    public legalName: string | null,
    public taxId: string | null,
    public contactName: string | null,
    public email: string | null,
    public phone: string | null,
    public address: string | null,
    public city: string | null,
    public state: string | null,
    public customerType: string | null,
    public industry: string | null,
    public billingEmail: string | null,
    public paymentTerms: string | null,
    public customerStatus: string,
    public assignedAccountManager: string | null,
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
