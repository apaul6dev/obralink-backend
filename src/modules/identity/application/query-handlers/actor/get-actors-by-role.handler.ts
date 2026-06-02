import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Actor } from '../../../domain/entities/actor.entity';
import { ACTOR_REPOSITORY } from '../../../domain/repositories/repository-tokens';
import { ActorRepository } from '../../../domain/repositories/actor.repository.interface';
import { TenantAccessPolicyService } from '../../../domain/services/tenant-access-policy.service';
import { GetActorsByRoleQuery } from '../../queries/actor/get-actors-by-role.query';

@QueryHandler(GetActorsByRoleQuery)
export class GetActorsByRoleHandler implements IQueryHandler<GetActorsByRoleQuery> {
  constructor(
    @Inject(ACTOR_REPOSITORY) private readonly actorRepository: ActorRepository,
    private readonly accessPolicy: TenantAccessPolicyService,
  ) {}

  async execute(query: GetActorsByRoleQuery): Promise<Actor[]> {
    const tenantId = this.accessPolicy.resolveTenantIdForTenantOperation(query.currentUser, query.tenantId);
    return this.actorRepository.findByRoleId(tenantId, query.roleId);
  }
}
