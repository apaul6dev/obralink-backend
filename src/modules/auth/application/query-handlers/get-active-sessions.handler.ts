import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { USER_SESSION_REPOSITORY } from '../../domain/repositories/repository-tokens';
import { UserSessionRepository } from '../../domain/repositories/user-session.repository.interface';
import { UserSessionResponseDto } from '../dto/user-session-response.dto';
import { GetActiveSessionsQuery } from '../queries/get-active-sessions.query';

@QueryHandler(GetActiveSessionsQuery)
export class GetActiveSessionsHandler implements IQueryHandler<GetActiveSessionsQuery> {
  constructor(
    @Inject(USER_SESSION_REPOSITORY) private readonly sessions: UserSessionRepository,
  ) {}

  async execute(query: GetActiveSessionsQuery): Promise<UserSessionResponseDto[]> {
    const sessions = await this.sessions.findActiveByUserId(query.userId);
    return sessions.map((session) => ({
      id: session.id,
      status: session.status,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      loginAt: session.loginAt,
      logoutAt: session.logoutAt,
      expiresAt: session.expiresAt,
    }));
  }
}
