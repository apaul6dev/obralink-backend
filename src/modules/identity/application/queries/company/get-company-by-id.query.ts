import { AuthenticatedIdentity } from '../../../domain/services/company-access-policy.service';

export class GetCompanyByIdQuery {
  constructor(public readonly currentUser: AuthenticatedIdentity, public readonly companyId: string) {}
}
