import { AuthenticatedIdentity } from '../../../domain/services/company-access-policy.service';

export class GetUserByIdQuery {
  constructor(public readonly currentUser: AuthenticatedIdentity, public readonly userId: string) {}
}
