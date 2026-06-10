import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Role } from '../../../../domain/entities/role.entity';
import { RoleRepository } from '../../../../domain/repositories/role.repository.interface';
import { RoleOrmEntity } from '../entities/role.orm-entity';
import { RoleMapper } from './typeorm-mappers';

@Injectable()
export class TypeOrmRoleRepository implements RoleRepository {
  constructor(
    @InjectRepository(RoleOrmEntity)
    private readonly repository: Repository<RoleOrmEntity>,
  ) {}

  async save(role: Role): Promise<Role> {
    const saved = await this.repository.save(RoleMapper.toOrm(role));
    return RoleMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Role | null> {
    const role = await this.repository.findOne({ where: { id } });
    return role ? RoleMapper.toDomain(role) : null;
  }

  async findByCompanyId(companyId: string): Promise<Role[]> {
    const roles = await this.repository.find({ where: { companyId }, order: { name: 'ASC' } });
    return roles.map(RoleMapper.toDomain);
  }

  async existsInCompany(roleId: string, companyId: string): Promise<boolean> {
    return this.repository.exists({ where: [{ id: roleId, companyId }, { id: roleId, companyId: IsNull() }] });
  }
}
