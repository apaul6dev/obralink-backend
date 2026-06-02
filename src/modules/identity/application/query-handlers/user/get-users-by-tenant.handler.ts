import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { User } from '../../../domain/entities/user.entity';
import { USER_REPOSITORY } from '../../../domain/repositories/repository-tokens';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { TenantAccessPolicyService } from '../../../domain/services/tenant-access-policy.service';
import { GetUsersByTenantQuery } from '../../queries/user/get-users-by-tenant.query';

@QueryHandler(GetUsersByTenantQuery)
export class GetUsersByTenantHandler implements IQueryHandler<GetUsersByTenantQuery> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly accessPolicy: TenantAccessPolicyService,
  ) {}

  async execute(query: GetUsersByTenantQuery): Promise<User[]> {
    const tenantId = this.accessPolicy.resolveTenantIdForTenantOperation(query.currentUser, query.tenantId);
    return this.userRepository.findByTenantId(tenantId);
  }
}
