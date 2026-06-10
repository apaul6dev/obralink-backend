import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UserType } from '../../domain/enums/user-type.enum';
import { AuthenticatedIdentity } from '../../domain/services/company-access-policy.service';

@Injectable()
export class CompanyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedIdentity }>();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('Authenticated user is required.');
    }
    if (user.userType === UserType.SYSTEM_OWNER) {
      return true;
    }
    if (!user.companyId) {
      throw new ForbiddenException('Company context is required.');
    }
    return true;
  }
}
