import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserType } from '../enums/user-type.enum';

export interface AuthenticatedIdentity {
  id: string;
  userType: UserType;
  companyId: string | null;
  roles?: string[];
  permissions?: string[];
}

@Injectable()
export class CompanyAccessPolicyService {
  assertPlatformAccess(user: AuthenticatedIdentity): void {
    if (user.userType !== UserType.SYSTEM_OWNER) {
      throw new ForbiddenException('Platform access is required.');
    }
  }

  assertCompanyAccess(user: AuthenticatedIdentity, companyId: string): void {
    if (user.userType === UserType.SYSTEM_OWNER) {
      return;
    }

    if (!user.companyId || user.companyId !== companyId) {
      throw new ForbiddenException('Cross-company access is not allowed.');
    }
  }

  resolveCompanyIdForCompanyOperation(user: AuthenticatedIdentity, requestedCompanyId?: string): string {
    if (user.userType === UserType.SYSTEM_OWNER) {
      if (!requestedCompanyId) {
        throw new ForbiddenException('Company id is required for this platform operation.');
      }
      return requestedCompanyId;
    }

    if (!user.companyId) {
      throw new ForbiddenException('Company context is required.');
    }

    return user.companyId;
  }
}
