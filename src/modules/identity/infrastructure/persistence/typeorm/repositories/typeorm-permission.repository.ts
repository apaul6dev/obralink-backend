import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../../../../domain/entities/permission.entity';
import { PermissionRepository } from '../../../../domain/repositories/permission.repository.interface';
import { PermissionOrmEntity } from '../entities/permission.orm-entity';
import { PermissionMapper } from './typeorm-mappers';

@Injectable()
export class TypeOrmPermissionRepository implements PermissionRepository {
  constructor(
    @InjectRepository(PermissionOrmEntity)
    private readonly repository: Repository<PermissionOrmEntity>,
  ) {}

  async save(permission: Permission): Promise<Permission> {
    const saved = await this.repository.save(PermissionMapper.toOrm(permission));
    return PermissionMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Permission | null> {
    const permission = await this.repository.findOne({ where: { id } });
    return permission ? PermissionMapper.toDomain(permission) : null;
  }

  async findByCode(code: string): Promise<Permission | null> {
    const permission = await this.repository.findOne({ where: { code } });
    return permission ? PermissionMapper.toDomain(permission) : null;
  }
}
