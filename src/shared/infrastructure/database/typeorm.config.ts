import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthEventOrmEntity } from '../../../modules/auth/infrastructure/persistence/typeorm/entities/auth-event.orm-entity';
import { PasswordResetTokenOrmEntity } from '../../../modules/auth/infrastructure/persistence/typeorm/entities/password-reset-token.orm-entity';
import { RefreshTokenOrmEntity } from '../../../modules/auth/infrastructure/persistence/typeorm/entities/refresh-token.orm-entity';
import { UserSessionOrmEntity } from '../../../modules/auth/infrastructure/persistence/typeorm/entities/user-session.orm-entity';
import { ActorOrmEntity } from '../../../modules/identity/infrastructure/persistence/typeorm/entities/actor.orm-entity';
import { ActorRoleOrmEntity } from '../../../modules/identity/infrastructure/persistence/typeorm/entities/actor-role.orm-entity';
import { PermissionOrmEntity } from '../../../modules/identity/infrastructure/persistence/typeorm/entities/permission.orm-entity';
import { RoleOrmEntity } from '../../../modules/identity/infrastructure/persistence/typeorm/entities/role.orm-entity';
import { RolePermissionOrmEntity } from '../../../modules/identity/infrastructure/persistence/typeorm/entities/role-permission.orm-entity';
import { TenantOrmEntity } from '../../../modules/identity/infrastructure/persistence/typeorm/entities/tenant.orm-entity';
import { UserOrmEntity } from '../../../modules/identity/infrastructure/persistence/typeorm/entities/user.orm-entity';
import { UserRoleOrmEntity } from '../../../modules/identity/infrastructure/persistence/typeorm/entities/user-role.orm-entity';

export const identityOrmEntities = [
  TenantOrmEntity,
  UserOrmEntity,
  RoleOrmEntity,
  PermissionOrmEntity,
  UserRoleOrmEntity,
  RolePermissionOrmEntity,
  ActorOrmEntity,
  ActorRoleOrmEntity,
];

export const authOrmEntities = [
  UserSessionOrmEntity,
  RefreshTokenOrmEntity,
  PasswordResetTokenOrmEntity,
  AuthEventOrmEntity,
];

export const appOrmEntities = [
  ...identityOrmEntities,
  ...authOrmEntities,
];

export function typeOrmConfigFactory(configService: ConfigService): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME', 'postgres'),
    password: configService.get<string>('DB_PASSWORD', 'postgres'),
    database: configService.get<string>('DB_DATABASE', 'obralink'),
    entities: appOrmEntities,
    synchronize: false,
    migrationsRun: false,
    logging: configService.get<string>('DB_LOGGING', 'false') === 'true',
  };
}
