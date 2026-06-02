import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserType } from '../enums/user-type.enum';

export interface AuthenticatedIdentity {
  id: string;
  userType: UserType;
  tenantId: string | null;
  roles?: string[];
  permissions?: string[];
}

@Injectable()
export class TenantAccessPolicyService {
  assertPlatformAccess(user: AuthenticatedIdentity): void {
    if (user.userType !== UserType.GLOBAL_ADMIN) {
      throw new ForbiddenException('Platform access is required.');
    }
  }

  assertTenantAccess(user: AuthenticatedIdentity, tenantId: string): void {
    if (user.userType === UserType.GLOBAL_ADMIN) {
      return;
    }

    if (!user.tenantId || user.tenantId !== tenantId) {
      throw new ForbiddenException('Cross-tenant access is not allowed.');
    }
  }

  resolveTenantIdForTenantOperation(user: AuthenticatedIdentity, requestedTenantId?: string): string {
    if (user.userType === UserType.GLOBAL_ADMIN) {
      if (!requestedTenantId) {
        throw new ForbiddenException('Tenant id is required for this platform operation.');
      }
      return requestedTenantId;
    }

    if (!user.tenantId) {
      throw new ForbiddenException('Tenant context is required.');
    }

    return user.tenantId;
  }
}
