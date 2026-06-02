export class Permission {
  constructor(
    public readonly id: string,
    public code: string,
    public description: string | null,
    public createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null = null,
  ) {}
}
