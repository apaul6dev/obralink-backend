export class RefreshToken {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly sessionId: string,
    public tokenHash: string,
    public expiresAt: Date,
    public revokedAt: Date | null,
    public replacedByTokenId: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null = null,
  ) {}

  revoke(now: Date, replacedByTokenId: string | null = null): void {
    this.revokedAt = now;
    this.replacedByTokenId = replacedByTokenId;
    this.updatedAt = now;
  }

  get isActive(): boolean {
    return !this.revokedAt && !this.deletedAt && this.expiresAt.getTime() > Date.now();
  }
}
