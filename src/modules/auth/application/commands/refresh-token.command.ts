export class RefreshTokenCommand {
  constructor(
    public readonly refreshToken: string,
    public readonly ipAddress: string | null,
    public readonly userAgent: string | null,
  ) {}
}
