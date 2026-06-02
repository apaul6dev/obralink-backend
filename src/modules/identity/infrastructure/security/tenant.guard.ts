import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UserType } from '../../domain/enums/user-type.enum';
import { AuthenticatedIdentity } from '../../domain/services/tenant-access-policy.service';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedIdentity }>();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('Authenticated user is required.');
    }
    if (user.userType === UserType.GLOBAL_ADMIN) {
      return true;
    }
    if (!user.tenantId) {
      throw new ForbiddenException('Tenant context is required.');
    }
    return true;
  }
}
