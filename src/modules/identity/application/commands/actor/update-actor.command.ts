import { AuthenticatedIdentity } from '../../../domain/services/tenant-access-policy.service';
import { UpdateActorDto } from '../../dto/actor/update-actor.dto';

export class UpdateActorCommand {
  constructor(public readonly currentUser: AuthenticatedIdentity, public readonly actorId: string, public readonly payload: UpdateActorDto) {}
}
