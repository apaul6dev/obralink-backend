import { AuthenticatedIdentity } from '../../../domain/services/company-access-policy.service';
import { CreateUserDto } from '../../dto/user/create-user.dto';

export class CreateUserCommand {
  constructor(public readonly currentUser: AuthenticatedIdentity, public readonly payload: CreateUserDto) {}
}
