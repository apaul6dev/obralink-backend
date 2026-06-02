import { Tenant } from '../entities/tenant.entity';

export interface TenantRepository {
  save(tenant: Tenant): Promise<Tenant>;
  findById(id: string): Promise<Tenant | null>;
  findAll(): Promise<Tenant[]>;
}
