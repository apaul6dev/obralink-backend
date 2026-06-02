import { AuthenticatedIdentity } from '../../../domain/services/tenant-access-policy.service';
import { CreateActorDto } from '../../dto/actor/create-actor.dto';

export class CreateActorCommand {
  constructor(public readonly currentUser: AuthenticatedIdentity, public readonly payload: CreateActorDto) {}
}
