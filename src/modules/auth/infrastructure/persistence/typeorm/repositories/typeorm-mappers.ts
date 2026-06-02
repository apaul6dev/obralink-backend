import { AuthEvent } from '../../../../domain/entities/auth-event.entity';
import { PasswordResetToken } from '../../../../domain/entities/password-reset-token.entity';
import { RefreshToken } from '../../../../domain/entities/refresh-token.entity';
import { UserSession } from '../../../../domain/entities/user-session.entity';
import { AuthEventOrmEntity } from '../entities/auth-event.orm-entity';
import { PasswordResetTokenOrmEntity } from '../entities/password-reset-token.orm-entity';
import { RefreshTokenOrmEntity } from '../entities/refresh-token.orm-entity';
import { UserSessionOrmEntity } from '../entities/user-session.orm-entity';

export const UserSessionMapper = {
  toDomain(entity: UserSessionOrmEntity): UserSession {
    return new UserSession(entity.id, entity.userId, entity.tenantId, entity.status, entity.ipAddress, entity.userAgent, entity.loginAt, entity.logoutAt, entity.expiresAt, entity.createdAt, entity.updatedAt, entity.deletedAt);
  },
  toOrm(domain: UserSession): UserSessionOrmEntity {
    return Object.assign(new UserSessionOrmEntity(), domain);
  },
};

export const RefreshTokenMapper = {
  toDomain(entity: RefreshTokenOrmEntity): RefreshToken {
    return new RefreshToken(entity.id, entity.userId, entity.sessionId, entity.tokenHash, entity.expiresAt, entity.revokedAt, entity.replacedByTokenId, entity.createdAt, entity.updatedAt, entity.deletedAt);
  },
  toOrm(domain: RefreshToken): RefreshTokenOrmEntity {
    return Object.assign(new RefreshTokenOrmEntity(), domain);
  },
};

export const PasswordResetTokenMapper = {
  toDomain(entity: PasswordResetTokenOrmEntity): PasswordResetToken {
    return new PasswordResetToken(entity.id, entity.userId, entity.tokenHash, entity.expiresAt, entity.usedAt, entity.createdAt, entity.updatedAt, entity.deletedAt);
  },
  toOrm(domain: PasswordResetToken): PasswordResetTokenOrmEntity {
    return Object.assign(new PasswordResetTokenOrmEntity(), domain);
  },
};

export const AuthEventMapper = {
  toOrm(domain: AuthEvent): AuthEventOrmEntity {
    return Object.assign(new AuthEventOrmEntity(), domain);
  },
};
