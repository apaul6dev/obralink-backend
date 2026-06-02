import { Tenant } from '../../domain/entities/tenant.entity';

export class TenantPresenter {
  static toHttp(tenant: Tenant) {
    return tenant;
  }
}
