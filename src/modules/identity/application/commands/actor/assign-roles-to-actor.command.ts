import { AuthenticatedIdentity } from '../../../domain/services/tenant-access-policy.service';

export class AssignRolesToActorCommand {
  constructor(public readonly currentUser: AuthenticatedIdentity, public readonly actorId: string, public readonly roleIds: string[]) {}
}
