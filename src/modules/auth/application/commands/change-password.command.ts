export class ChangePasswordCommand {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string | null,
    public readonly sessionId: string,
    public readonly currentPassword: string,
    public readonly newPassword: string,
    public readonly ipAddress: string | null,
    public readonly userAgent: string | null,
  ) {}
}
