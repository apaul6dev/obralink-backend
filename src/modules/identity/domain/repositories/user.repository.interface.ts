import { User } from '../entities/user.entity';

export interface UserRepository {
  save(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findRoleCodesByUserId(userId: string): Promise<string[]>;
  findPermissionCodesByUserId(userId: string): Promise<string[]>;
  findByCompanyId(companyId: string): Promise<User[]>;
  assignRoles(userId: string, companyId: string, roleIds: string[]): Promise<void>;
}
