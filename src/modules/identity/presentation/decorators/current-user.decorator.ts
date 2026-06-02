import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedIdentity } from '../../domain/services/tenant-access-policy.service';

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): AuthenticatedIdentity => {
  const request = context.switchToHttp().getRequest<{ user: AuthenticatedIdentity }>();
  return request.user;
});
