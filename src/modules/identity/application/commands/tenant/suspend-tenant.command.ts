import { AuthenticatedIdentity } from '../../../domain/services/tenant-access-policy.service';

export class SuspendTenantCommand {
  constructor(public readonly currentUser: AuthenticatedIdentity, public readonly tenantId: string) {}
}
