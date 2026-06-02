import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Tenant } from '../../../domain/entities/tenant.entity';
import { TENANT_REPOSITORY } from '../../../domain/repositories/repository-tokens';
import { TenantRepository } from '../../../domain/repositories/tenant.repository.interface';
import { TenantAccessPolicyService } from '../../../domain/services/tenant-access-policy.service';
import { GetTenantByIdQuery } from '../../queries/tenant/get-tenant-by-id.query';

@QueryHandler(GetTenantByIdQuery)
export class GetTenantByIdHandler implements IQueryHandler<GetTenantByIdQuery> {
  constructor(
    @Inject(TENANT_REPOSITORY) private readonly tenantRepository: TenantRepository,
    private readonly accessPolicy: TenantAccessPolicyService,
  ) {}

  async execute(query: GetTenantByIdQuery): Promise<Tenant> {
    this.accessPolicy.assertTenantAccess(query.currentUser, query.tenantId);
    const tenant = await this.tenantRepository.findById(query.tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found.');
    }
    return tenant;
  }
}
