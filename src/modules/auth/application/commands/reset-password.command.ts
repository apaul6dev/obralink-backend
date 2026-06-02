export class ResetPasswordCommand {
  constructor(
    public readonly token: string,
    public readonly newPassword: string,
    public readonly ipAddress: string | null,
    public readonly userAgent: string | null,
  ) {}
}
