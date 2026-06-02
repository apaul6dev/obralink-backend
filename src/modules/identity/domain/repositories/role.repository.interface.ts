import { Role } from '../entities/role.entity';

export interface RoleRepository {
  save(role: Role): Promise<Role>;
  findById(id: string): Promise<Role | null>;
  findByTenantId(tenantId: string): Promise<Role[]>;
  existsInTenant(roleId: string, tenantId: string): Promise<boolean>;
}
