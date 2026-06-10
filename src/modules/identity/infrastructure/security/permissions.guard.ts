import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserType } from '../../domain/enums/user-type.enum';
import { AuthenticatedIdentity } from '../../domain/services/company-access-policy.service';
import { REQUIRED_PERMISSIONS_KEY } from '../../presentation/decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(REQUIRED_PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }
    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedIdentity }>();
    if (request.user?.userType === UserType.SYSTEM_OWNER || request.user?.userType === UserType.COMPANY_ADMIN) {
      return true;
    }
    const permissions = request.user?.permissions ?? [];
    return requiredPermissions.every((permission) => permissions.includes(permission));
  }
}
