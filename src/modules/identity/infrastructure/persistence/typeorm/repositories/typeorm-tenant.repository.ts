import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../../../../domain/entities/tenant.entity';
import { TenantRepository } from '../../../../domain/repositories/tenant.repository.interface';
import { TenantOrmEntity } from '../entities/tenant.orm-entity';
import { TenantMapper } from './typeorm-mappers';

@Injectable()
export class TypeOrmTenantRepository implements TenantRepository {
  constructor(
    @InjectRepository(TenantOrmEntity)
    private readonly repository: Repository<TenantOrmEntity>,
  ) {}

  async save(tenant: Tenant): Promise<Tenant> {
    const saved = await this.repository.save(TenantMapper.toOrm(tenant));
    return TenantMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Tenant | null> {
    const tenant = await this.repository.findOne({ where: { id } });
    return tenant ? TenantMapper.toDomain(tenant) : null;
  }

  async findAll(): Promise<Tenant[]> {
    const tenants = await this.repository.find({ order: { createdAt: 'DESC' } });
    return tenants.map(TenantMapper.toDomain);
  }
}
