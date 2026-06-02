export class GetCurrentUserQuery {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly userType: string,
    public readonly tenantId: string | null,
    public readonly sessionId: string,
    public readonly roles: string[],
    public readonly permissions: string[],
  ) {}
}
