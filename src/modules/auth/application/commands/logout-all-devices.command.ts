export class LogoutAllDevicesCommand {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string | null,
    public readonly sessionId: string,
    public readonly ipAddress: string | null,
    public readonly userAgent: string | null,
  ) {}
}
