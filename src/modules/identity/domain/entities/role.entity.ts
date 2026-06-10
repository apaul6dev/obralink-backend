import { Status } from '../enums/status.enum';

export class Role {
  constructor(
    public readonly id: string,
    public companyId: string | null,
    public name: string,
    public code: string,
    public status: Status,
    public createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null = null,
  ) {}
}
