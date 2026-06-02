import { AuthenticatedIdentity } from '../../../domain/services/tenant-access-policy.service';

export class AssignRolesToUserCommand {
  constructor(public readonly currentUser: AuthenticatedIdentity, public readonly userId: string, public readonly roleIds: string[]) {}
}
