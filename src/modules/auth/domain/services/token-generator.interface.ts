import { UserType } from '../../../identity/domain/enums/user-type.enum';

export const TOKEN_GENERATOR = Symbol('TOKEN_GENERATOR');

export interface AccessTokenPayload {
  sub: string;
  email: string;
  userType: UserType;
  tenantId: string | null;
  roles: string[];
  permissions: string[];
  sessionId: string;
}

export interface TokenGenerator {
  signAccessToken(payload: AccessTokenPayload): Promise<string>;
  generateOpaqueToken(): string;
}
