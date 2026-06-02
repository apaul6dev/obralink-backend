import { Actor } from '../../../../domain/entities/actor.entity';
import { Permission } from '../../../../domain/entities/permission.entity';
import { Role } from '../../../../domain/entities/role.entity';
import { Tenant } from '../../../../domain/entities/tenant.entity';
import { User } from '../../../../domain/entities/user.entity';
import { ActorOrmEntity } from '../entities/actor.orm-entity';
import { PermissionOrmEntity } from '../entities/permission.orm-entity';
import { RoleOrmEntity } from '../entities/role.orm-entity';
import { TenantOrmEntity } from '../entities/tenant.orm-entity';
import { UserOrmEntity } from '../entities/user.orm-entity';

export const TenantMapper = {
  toDomain(entity: TenantOrmEntity): Tenant {
    return new Tenant(entity.id, entity.name, entity.legalName, entity.identificationNumber, entity.status, entity.createdAt, entity.updatedAt, entity.deletedAt);
  },
  toOrm(domain: Tenant): TenantOrmEntity {
    return Object.assign(new TenantOrmEntity(), domain);
  },
};

export const UserMapper = {
  toDomain(entity: UserOrmEntity): User {
    return new User(entity.id, entity.tenantId, entity.email, entity.passwordHash, entity.firstName, entity.lastName, entity.userType, entity.status, entity.identificationNumber, entity.createdAt, entity.updatedAt, entity.deletedAt);
  },
  toOrm(domain: User): UserOrmEntity {
    return Object.assign(new UserOrmEntity(), domain);
  },
};

export const RoleMapper = {
  toDomain(entity: RoleOrmEntity): Role {
    return new Role(entity.id, entity.tenantId, entity.name, entity.code, entity.status, entity.createdAt, entity.updatedAt, entity.deletedAt);
  },
  toOrm(domain: Role): RoleOrmEntity {
    return Object.assign(new RoleOrmEntity(), domain);
  },
};

export const PermissionMapper = {
  toDomain(entity: PermissionOrmEntity): Permission {
    return new Permission(entity.id, entity.code, entity.description, entity.createdAt, entity.updatedAt, entity.deletedAt);
  },
  toOrm(domain: Permission): PermissionOrmEntity {
    return Object.assign(new PermissionOrmEntity(), domain);
  },
};

export const ActorMapper = {
  toDomain(entity: ActorOrmEntity): Actor {
    return new Actor(entity.id, entity.tenantId, entity.type, entity.name, entity.email, entity.identificationNumber, entity.phone, entity.status, entity.createdAt, entity.updatedAt, entity.deletedAt);
  },
  toOrm(domain: Actor): ActorOrmEntity {
    return Object.assign(new ActorOrmEntity(), domain);
  },
};
