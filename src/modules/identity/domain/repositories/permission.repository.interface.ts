import { Permission } from '../entities/permission.entity';

export interface PermissionRepository {
  save(permission: Permission): Promise<Permission>;
  findById(id: string): Promise<Permission | null>;
  findByCode(code: string): Promise<Permission | null>;
}
