export class RolePermission {
  constructor(
    public readonly id: string,
    public roleId: string,
    public permissionId: string,
    public companyId: string | null,
    public createdAt: Date,
  ) {}
}
