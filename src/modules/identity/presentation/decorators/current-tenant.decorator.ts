import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentTenant = createParamDecorator((_data: unknown, context: ExecutionContext): string | null => {
  const request = context.switchToHttp().getRequest<{ user?: { tenantId?: string | null } }>();
  return request.user?.tenantId ?? null;
});
