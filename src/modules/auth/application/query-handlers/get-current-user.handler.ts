import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CurrentUserResponseDto } from '../dto/current-user-response.dto';
import { GetCurrentUserQuery } from '../queries/get-current-user.query';
import { buildUiAccess } from '../services/ui-access.mapper';

@QueryHandler(GetCurrentUserQuery)
export class GetCurrentUserHandler implements IQueryHandler<GetCurrentUserQuery> {
  async execute(query: GetCurrentUserQuery): Promise<CurrentUserResponseDto> {
    return {
      id: query.userId,
      email: query.email,
      tenantId: query.tenantId,
      userType: query.userType,
      sessionId: query.sessionId,
      roles: query.roles,
      permissions: query.permissions,
      ui: buildUiAccess(query.userType, query.permissions),
    };
  }
}
