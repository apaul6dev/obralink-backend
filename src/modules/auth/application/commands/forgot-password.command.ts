export class ForgotPasswordCommand {
  constructor(
    public readonly email: string,
    public readonly tenantId: string | null,
    public readonly companyIdentifier: string | null,
    public readonly ipAddress: string | null,
    public readonly userAgent: string | null,
  ) {}
}
