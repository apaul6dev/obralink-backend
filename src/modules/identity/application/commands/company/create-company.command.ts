import { AuthenticatedIdentity } from '../../../domain/services/company-access-policy.service';
import { CreateCompanyDto } from '../../dto/company/create-company.dto';

export class CreateCompanyCommand {
  constructor(public readonly currentUser: AuthenticatedIdentity, public readonly payload: CreateCompanyDto) {}
}
