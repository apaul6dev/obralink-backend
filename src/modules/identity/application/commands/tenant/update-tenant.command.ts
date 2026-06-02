import { AuthenticatedIdentity } from '../../../domain/services/tenant-access-policy.service';
import { UpdateTenantDto } from '../../dto/tenant/update-tenant.dto';

export class UpdateTenantCommand {
  constructor(public readonly currentUser: AuthenticatedIdentity, public readonly tenantId: string, public readonly payload: UpdateTenantDto) {}
}
