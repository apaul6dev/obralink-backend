import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequestUser } from '../../infrastructure/security/jwt.strategy';

export const CurrentTenant = createParamDecorator((_data: unknown, context: ExecutionContext): string | null => {
  const request = context.switchToHttp().getRequest<{ user: AuthenticatedRequestUser }>();
  return request.user?.tenantId ?? null;
});
