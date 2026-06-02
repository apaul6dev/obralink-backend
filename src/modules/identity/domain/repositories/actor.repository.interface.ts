import { Actor } from '../entities/actor.entity';

export interface ActorRepository {
  save(actor: Actor): Promise<Actor>;
  findById(id: string): Promise<Actor | null>;
  findByTenantId(tenantId: string): Promise<Actor[]>;
  findByRoleId(tenantId: string, roleId: string): Promise<Actor[]>;
  assignRoles(actorId: string, tenantId: string, roleIds: string[]): Promise<void>;
  removeRoles(actorId: string, tenantId: string, roleIds: string[]): Promise<void>;
}
