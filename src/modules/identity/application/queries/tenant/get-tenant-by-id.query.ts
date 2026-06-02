import { AuthenticatedIdentity } from '../../../domain/services/tenant-access-policy.service';

export class GetTenantByIdQuery {
  constructor(public readonly currentUser: AuthenticatedIdentity, public readonly tenantId: string) {}
}
