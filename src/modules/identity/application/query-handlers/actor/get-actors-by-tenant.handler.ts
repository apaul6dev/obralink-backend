import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Actor } from '../../../domain/entities/actor.entity';
import { ACTOR_REPOSITORY } from '../../../domain/repositories/repository-tokens';
import { ActorRepository } from '../../../domain/repositories/actor.repository.interface';
import { TenantAccessPolicyService } from '../../../domain/services/tenant-access-policy.service';
import { GetActorsByTenantQuery } from '../../queries/actor/get-actors-by-tenant.query';

@QueryHandler(GetActorsByTenantQuery)
export class GetActorsByTenantHandler implements IQueryHandler<GetActorsByTenantQuery> {
  constructor(
    @Inject(ACTOR_REPOSITORY) private readonly actorRepository: ActorRepository,
    private readonly accessPolicy: TenantAccessPolicyService,
  ) {}

  async execute(query: GetActorsByTenantQuery): Promise<Actor[]> {
    const tenantId = this.accessPolicy.resolveTenantIdForTenantOperation(query.currentUser, query.tenantId);
    return this.actorRepository.findByTenantId(tenantId);
  }
}
