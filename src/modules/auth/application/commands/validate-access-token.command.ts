export class ValidateAccessTokenCommand {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string | null,
    public readonly sessionId: string,
  ) {}
}
