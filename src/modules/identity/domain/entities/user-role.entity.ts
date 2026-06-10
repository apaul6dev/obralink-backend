export class UserRole {
  constructor(
    public readonly id: string,
    public userId: string,
    public roleId: string,
    public companyId: string,
    public createdAt: Date,
  ) {}
}
