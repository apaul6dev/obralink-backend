import { AuthenticatedIdentity } from '../../../domain/services/tenant-access-policy.service';
import { CreateTenantDto } from '../../dto/tenant/create-tenant.dto';

export class CreateTenantCommand {
  constructor(public readonly currentUser: AuthenticatedIdentity, public readonly payload: CreateTenantDto) {}
}
