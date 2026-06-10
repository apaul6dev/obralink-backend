import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { fromNodeHeaders } from 'better-auth/node';
import { Request } from 'express';
import { DataSource } from 'typeorm';
import { BetterAuthInstance } from '../../../better-auth/better-auth.config';
import { UserType } from '../../domain/enums/user-type.enum';
import { AuthenticatedIdentity } from '../../domain/services/company-access-policy.service';

type BetterAuthUser = {
  id: string;
  userType?: UserType;
  role?: string | string[];
  permissions?: string[];
};

type BetterAuthSession = {
  user: BetterAuthUser;
  session: {
    activeOrganizationId?: string | null;
  };
};

type IdentityRequest = Request & {
  authSession?: BetterAuthSession;
  user?: AuthenticatedIdentity;
};

@Injectable()
export class AuthenticatedIdentityGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService<BetterAuthInstance>,
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IdentityRequest>();
    const session = (await this.authService.api.getSession({
      headers: fromNodeHeaders(request.headers),
    })) as BetterAuthSession | null;

    if (!session) {
      throw new UnauthorizedException('Authentication is required.');
    }

    request.authSession = session;
    request.user = await this.toAuthenticatedIdentity(session);
    return true;
  }

  private async toAuthenticatedIdentity(session: BetterAuthSession): Promise<AuthenticatedIdentity> {
    const userType = Object.values(UserType).includes(session.user.userType as UserType) ? (session.user.userType as UserType) : UserType.COMPANY_USER;
    const companyId = session.session.activeOrganizationId ?? await this.findUserCompanyId(session.user.id);

    return {
      id: session.user.id,
      userType,
      companyId,
      roles: this.normalizeRoles(session.user.role),
      permissions: Array.isArray(session.user.permissions) ? session.user.permissions : [],
    };
  }

  private async findUserCompanyId(userId: string): Promise<string | null> {
    const rows = await this.dataSource.query<Array<{ company_id: string | null }>>(
      `
        SELECT company_id
        FROM users
        WHERE id = $1
          AND deleted_at IS NULL
        LIMIT 1
      `,
      [userId],
    );

    return rows[0]?.company_id ?? null;
  }

  private normalizeRoles(role?: string | string[]): string[] {
    if (!role) {
      return [];
    }

    if (Array.isArray(role)) {
      return role;
    }

    return role
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }
}
