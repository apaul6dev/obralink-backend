import { AuthenticatedIdentity } from '../../../domain/services/company-access-policy.service';

export class SuspendCompanyCommand {
  constructor(public readonly currentUser: AuthenticatedIdentity, public readonly companyId: string) {}
}
