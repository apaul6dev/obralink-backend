export class UserRole {
  constructor(
    public readonly id: string,
    public userId: string,
    public roleId: string,
    public tenantId: string,
    public createdAt: Date,
  ) {}
}
