export class PasswordResetToken {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public tokenHash: string,
    public expiresAt: Date,
    public usedAt: Date | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null = null,
  ) {}
}
