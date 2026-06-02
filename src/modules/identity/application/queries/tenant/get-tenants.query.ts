import { AuthenticatedIdentity } from '../../../domain/services/tenant-access-policy.service';

export class GetTenantsQuery {
  constructor(public readonly currentUser: AuthenticatedIdentity) {}
}
