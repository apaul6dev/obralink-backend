import { AuthenticatedIdentity } from '../../../domain/services/company-access-policy.service';
import { UpdateUserDto } from '../../dto/user/update-user.dto';

export class UpdateUserCommand {
  constructor(public readonly currentUser: AuthenticatedIdentity, public readonly userId: string, public readonly payload: UpdateUserDto) {}
}
