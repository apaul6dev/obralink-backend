import { AuthenticatedIdentity } from '../../../domain/services/company-access-policy.service';

export class GetCompaniesQuery {
  constructor(public readonly currentUser: AuthenticatedIdentity) {}
}
