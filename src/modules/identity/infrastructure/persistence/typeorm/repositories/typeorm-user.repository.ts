import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../../../../domain/entities/user.entity';
import { UserRepository } from '../../../../domain/repositories/user.repository.interface';
import { UserRoleOrmEntity } from '../entities/user-role.orm-entity';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { UserMapper } from './typeorm-mappers';

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
    @InjectRepository(UserRoleOrmEntity)
    private readonly userRoleRepository: Repository<UserRoleOrmEntity>,
  ) {}

  async save(user: User): Promise<User> {
    const saved = await this.repository.save(UserMapper.toOrm(user));
    return UserMapper.toDomain(saved);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.repository.findOne({ where: { id } });
    return user ? UserMapper.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.repository.findOne({ where: { email: email.toLowerCase() } });
    return user ? UserMapper.toDomain(user) : null;
  }

  async findRoleCodesByUserId(userId: string): Promise<string[]> {
    const rows = await this.userRoleRepository
      .createQueryBuilder('userRole')
      .innerJoin('userRole.role', 'role', 'role.deleted_at IS NULL')
      .select('role.code', 'code')
      .where('userRole.user_id = :userId', { userId })
      .orderBy('role.code', 'ASC')
      .getRawMany<{ code: string }>();

    return rows.map((row) => row.code);
  }

  async findPermissionCodesByUserId(userId: string): Promise<string[]> {
    const rows = await this.userRoleRepository
      .createQueryBuilder('userRole')
      .innerJoin('userRole.role', 'role', 'role.deleted_at IS NULL')
      .innerJoin('role_permissions', 'rolePermission', 'rolePermission.role_id = role.id')
      .innerJoin('permissions', 'permission', 'permission.id = rolePermission.permission_id AND permission.deleted_at IS NULL')
      .select('DISTINCT permission.code', 'code')
      .where('userRole.user_id = :userId', { userId })
      .orderBy('permission.code', 'ASC')
      .getRawMany<{ code: string }>();

    return rows.map((row) => row.code);
  }

  async findByCompanyId(companyId: string): Promise<User[]> {
    const users = await this.repository.find({ where: { companyId }, order: { createdAt: 'DESC' } });
    return users.map(UserMapper.toDomain);
  }

  async assignRoles(userId: string, companyId: string, roleIds: string[]): Promise<void> {
    await this.userRoleRepository.delete({ userId, companyId });
    if (roleIds.length === 0) {
      return;
    }
    await this.userRoleRepository.insert(roleIds.map((roleId) => ({ userId, companyId, roleId })));
  }
}
