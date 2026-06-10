import { Permission } from '../../../../domain/entities/permission.entity';
import { Role } from '../../../../domain/entities/role.entity';
import { Company } from '../../../../domain/entities/company.entity';
import { User } from '../../../../domain/entities/user.entity';
import { PermissionOrmEntity } from '../entities/permission.orm-entity';
import { RoleOrmEntity } from '../entities/role.orm-entity';
import { CompanyOrmEntity } from '../entities/company.orm-entity';
import { UserOrmEntity } from '../entities/user.orm-entity';

export const CompanyMapper = {
  toDomain(entity: CompanyOrmEntity): Company {
    return new Company(
      entity.id,
      entity.name,
      entity.legalName,
      entity.taxId,
      entity.contactName,
      entity.email,
      entity.phone,
      entity.address,
      entity.city,
      entity.state,
      entity.customerType,
      entity.industry,
      entity.billingEmail,
      entity.paymentTerms,
      entity.customerStatus,
      entity.assignedAccountManager,
      entity.status,
      entity.createdAt,
      entity.updatedAt,
      entity.deletedAt,
    );
  },
  toOrm(domain: Company): CompanyOrmEntity {
    return Object.assign(new CompanyOrmEntity(), domain);
  },
};

export const UserMapper = {
  toDomain(entity: UserOrmEntity): User {
    return new User(
      entity.id,
      entity.companyId,
      entity.email,
      entity.firstName,
      entity.lastName,
      entity.userType,
      entity.status,
      entity.identificationNumber,
      entity.personalEmail,
      entity.phoneNumber,
      entity.createdAt,
      entity.updatedAt,
      entity.deletedAt,
    );
  },
  toOrm(domain: User): UserOrmEntity {
    return Object.assign(new UserOrmEntity(), domain);
  },
};

export const RoleMapper = {
  toDomain(entity: RoleOrmEntity): Role {
    return new Role(entity.id, entity.companyId, entity.name, entity.code, entity.status, entity.createdAt, entity.updatedAt, entity.deletedAt);
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
