import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { PermissionOrmEntity } from '../../../modules/identity/infrastructure/persistence/typeorm/entities/permission.orm-entity';
import { RoleOrmEntity } from '../../../modules/identity/infrastructure/persistence/typeorm/entities/role.orm-entity';
import { RolePermissionOrmEntity } from '../../../modules/identity/infrastructure/persistence/typeorm/entities/role-permission.orm-entity';
import { CompanyBranchOrmEntity } from '../../../modules/identity/infrastructure/persistence/typeorm/entities/company-branch.orm-entity';
import { CompanyOrmEntity } from '../../../modules/identity/infrastructure/persistence/typeorm/entities/company.orm-entity';
import { MenuItemOrmEntity } from '../../../modules/identity/infrastructure/persistence/typeorm/entities/menu-item.orm-entity';
import { MenuItemPermissionOrmEntity } from '../../../modules/identity/infrastructure/persistence/typeorm/entities/menu-item-permission.orm-entity';
import { UserOrmEntity } from '../../../modules/identity/infrastructure/persistence/typeorm/entities/user.orm-entity';
import { UserRoleOrmEntity } from '../../../modules/identity/infrastructure/persistence/typeorm/entities/user-role.orm-entity';

export const identityOrmEntities = [
  CompanyOrmEntity,
  CompanyBranchOrmEntity,
  UserOrmEntity,
  RoleOrmEntity,
  PermissionOrmEntity,
  UserRoleOrmEntity,
  RolePermissionOrmEntity,
  MenuItemOrmEntity,
  MenuItemPermissionOrmEntity,
];

export const appOrmEntities = [
  ...identityOrmEntities,
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
