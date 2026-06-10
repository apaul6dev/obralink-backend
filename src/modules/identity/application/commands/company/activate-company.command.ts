import { AuthenticatedIdentity } from '../../../domain/services/company-access-policy.service';

export class ActivateCompanyCommand {
  constructor(public readonly currentUser: AuthenticatedIdentity, public readonly companyId: string) {}
}
