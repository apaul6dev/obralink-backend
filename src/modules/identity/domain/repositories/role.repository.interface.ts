import { Role } from '../entities/role.entity';

export interface RoleRepository {
  save(role: Role): Promise<Role>;
  findById(id: string): Promise<Role | null>;
  findByCompanyId(companyId: string): Promise<Role[]>;
  existsInCompany(roleId: string, companyId: string): Promise<boolean>;
}
