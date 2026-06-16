export class Permission {
  constructor(
    public readonly id: string,
    public code: string,
    public description: string | null,
    public category: string,
    public moduleId: string,
    public moduleCode: string,
    public moduleName: string,
    public moduleIcon: string | null,
    public action: string,
    public label: string,
    public isSystem: boolean,
    public createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null = null,
  ) {}
}
