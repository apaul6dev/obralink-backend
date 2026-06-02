import { ActorType } from '../enums/actor-type.enum';
import { Status } from '../enums/status.enum';

export class Actor {
  constructor(
    public readonly id: string,
    public tenantId: string,
    public type: ActorType,
    public name: string,
    public email: string | null,
    public identificationNumber: string | null,
    public phone: string | null,
    public status: Status,
    public createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null = null,
  ) {}
}
