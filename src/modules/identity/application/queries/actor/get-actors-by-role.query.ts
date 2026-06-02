import { AuthenticatedIdentity } from '../../../domain/services/tenant-access-policy.service';

export class GetActorsByRoleQuery {
  constructor(public readonly currentUser: AuthenticatedIdentity, public readonly roleId: string, public readonly tenantId?: string) {}
}
