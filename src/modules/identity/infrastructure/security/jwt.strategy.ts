import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserType } from '../../domain/enums/user-type.enum';
import { AuthenticatedIdentity } from '../../domain/services/tenant-access-policy.service';

interface JwtPayload {
  sub: string;
  userType: UserType;
  tenantId?: string | null;
  roles?: string[];
  permissions?: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'change-me'),
    });
  }

  validate(payload: JwtPayload): AuthenticatedIdentity {
    return {
      id: payload.sub,
      userType: payload.userType,
      tenantId: payload.tenantId ?? null,
      roles: payload.roles ?? [],
      permissions: payload.permissions ?? [],
    };
  }
}
