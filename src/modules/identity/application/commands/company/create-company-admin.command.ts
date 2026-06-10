import { AuthenticatedIdentity } from '../../../domain/services/company-access-policy.service';
import { CreateCompanyAdminDto } from '../../dto/company/create-company-admin.dto';

export class CreateCompanyAdminCommand {
  constructor(
    public readonly currentUser: AuthenticatedIdentity,
    public readonly companyId: string,
    public readonly payload: CreateCompanyAdminDto,
  ) {}
}
