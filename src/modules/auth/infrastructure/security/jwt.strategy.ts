import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserType } from '../../../identity/domain/enums/user-type.enum';
import { ValidateAccessTokenCommand } from '../../application/commands/validate-access-token.command';

export interface AuthenticatedRequestUser {
  id: string;
  email: string;
  userType: UserType;
  tenantId: string | null;
  roles: string[];
  permissions: string[];
  sessionId: string;
}

interface JwtPayload {
  sub: string;
  email: string;
  userType: UserType;
  tenantId?: string | null;
  roles?: string[];
  permissions?: string[];
  sessionId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly commandBus: CommandBus,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'change-me'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedRequestUser> {
    if (!payload.sub || !payload.sessionId) {
      throw new UnauthorizedException('Invalid access token.');
    }

    await this.commandBus.execute(new ValidateAccessTokenCommand(payload.sub, payload.tenantId ?? null, payload.sessionId));

    return {
      id: payload.sub,
      email: payload.email,
      userType: payload.userType,
      tenantId: payload.tenantId ?? null,
      roles: payload.roles ?? [],
      permissions: payload.permissions ?? [],
      sessionId: payload.sessionId,
    };
  }
}
