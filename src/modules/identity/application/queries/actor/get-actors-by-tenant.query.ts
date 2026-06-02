import { AuthenticatedIdentity } from '../../../domain/services/tenant-access-policy.service';

export class GetActorsByTenantQuery {
  constructor(public readonly currentUser: AuthenticatedIdentity, public readonly tenantId?: string) {}
}
