import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserType } from '../enums/user-type.enum';

export interface AuthenticatedIdentity {
  id: string;
  userType: UserType;
  companyId: string | null;
  branchId: string | null;
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

  assertBranchAccess(user: AuthenticatedIdentity, companyId: string, branchId: string | null): void {
    this.assertCompanyAccess(user, companyId);
    if (user.userType === UserType.SYSTEM_OWNER || user.userType === UserType.COMPANY_ADMIN) {
      return;
    }
    if (!branchId || !user.branchId || user.branchId !== branchId) {
      throw new ForbiddenException('Cross-branch access is not allowed.');
    }
  }

  resolveBranchIdForCompanyRead(user: AuthenticatedIdentity): string | null {
    if (user.userType === UserType.SYSTEM_OWNER || user.userType === UserType.COMPANY_ADMIN) {
      return null;
    }
    if (!user.branchId) {
      throw new ForbiddenException('Branch context is required.');
    }
    return user.branchId;
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
