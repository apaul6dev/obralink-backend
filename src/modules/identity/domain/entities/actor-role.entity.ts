export class ActorRole {
  constructor(
    public readonly id: string,
    public actorId: string,
    public roleId: string,
    public tenantId: string,
    public createdAt: Date,
  ) {}
}
