import { AuthenticatedIdentity } from '../../../domain/services/company-access-policy.service';
import { UpdateCompanyDto } from '../../dto/company/update-company.dto';

export class UpdateCompanyCommand {
  constructor(public readonly currentUser: AuthenticatedIdentity, public readonly companyId: string, public readonly payload: UpdateCompanyDto) {}
}
