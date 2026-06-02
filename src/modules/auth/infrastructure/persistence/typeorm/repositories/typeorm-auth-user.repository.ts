import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Status } from '../../../../../identity/domain/enums/status.enum';
import { UserType } from '../../../../../identity/domain/enums/user-type.enum';
import { PermissionOrmEntity } from '../../../../../identity/infrastructure/persistence/typeorm/entities/permission.orm-entity';
import { RolePermissionOrmEntity } from '../../../../../identity/infrastructure/persistence/typeorm/entities/role-permission.orm-entity';
import { RoleOrmEntity } from '../../../../../identity/infrastructure/persistence/typeorm/entities/role.orm-entity';
import { TenantOrmEntity } from '../../../../../identity/infrastructure/persistence/typeorm/entities/tenant.orm-entity';
import { UserRoleOrmEntity } from '../../../../../identity/infrastructure/persistence/typeorm/entities/user-role.orm-entity';
import { UserOrmEntity } from '../../../../../identity/infrastructure/persistence/typeorm/entities/user.orm-entity';
import { AuthenticatedUser } from '../../../../domain/entities/authenticated-user.entity';
import { AuthUserRepository } from '../../../../domain/repositories/auth-user.repository.interface';

@Injectable()
export class TypeOrmAuthUserRepository implements AuthUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly users: Repository<UserOrmEntity>,
    @InjectRepository(TenantOrmEntity)
    private readonly tenants: Repository<TenantOrmEntity>,
    @InjectRepository(UserRoleOrmEntity)
    private readonly userRoles: Repository<UserRoleOrmEntity>,
  ) {}

  async findForLogin(email: string, tenantId?: string | null, companyIdentifier?: string | null): Promise<AuthenticatedUser | null> {
    const normalizedEmail = email.toLowerCase();

    if (tenantId || companyIdentifier) {
      const tenant = tenantId
        ? await this.tenants.findOne({ where: { id: tenantId } })
        : await this.tenants.findOne({ where: { identificationNumber: companyIdentifier ?? undefined } });

      if (!tenant) {
        return null;
      }

      const user = await this.users.findOne({ where: { email: normalizedEmail, tenantId: tenant.id } });
      return user ? this.toAuthenticatedUser(user, tenant) : null;
    }

    const user = await this.users.findOne({ where: { email: normalizedEmail, tenantId: IsNull(), userType: UserType.GLOBAL_ADMIN } });
    return user ? this.toAuthenticatedUser(user, null) : null;
  }

  async findById(id: string): Promise<AuthenticatedUser | null> {
    const user = await this.users.findOne({ where: { id } });
    if (!user) {
      return null;
    }

    const tenant = user.tenantId ? await this.tenants.findOne({ where: { id: user.tenantId } }) : null;
    return this.toAuthenticatedUser(user, tenant);
  }

  async updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
    await this.users.update({ id: userId }, { passwordHash });
  }

  private async toAuthenticatedUser(user: UserOrmEntity, tenant: TenantOrmEntity | null): Promise<AuthenticatedUser> {
    const [roles, permissions] = await Promise.all([
      this.findRoleCodes(user.id),
      this.findPermissionCodes(user.id),
    ]);

    return new AuthenticatedUser(
      user.id,
      user.tenantId,
      user.email,
      user.passwordHash,
      user.firstName,
      user.lastName,
      user.userType,
      user.status,
      tenant?.status ?? null,
      roles,
      permissions,
      user.deletedAt,
    );
  }

  private async findRoleCodes(userId: string): Promise<string[]> {
    const rows = await this.userRoles
      .createQueryBuilder('userRole')
      .innerJoin(RoleOrmEntity, 'role', 'role.id = userRole.role_id AND role.deleted_at IS NULL AND role.status = :status', { status: Status.ACTIVE })
      .select('role.code', 'code')
      .where('userRole.user_id = :userId', { userId })
      .orderBy('role.code', 'ASC')
      .getRawMany<{ code: string }>();

    return rows.map((row) => row.code);
  }

  private async findPermissionCodes(userId: string): Promise<string[]> {
    const rows = await this.userRoles
      .createQueryBuilder('userRole')
      .innerJoin(RoleOrmEntity, 'role', 'role.id = userRole.role_id AND role.deleted_at IS NULL AND role.status = :status', { status: Status.ACTIVE })
      .innerJoin(RolePermissionOrmEntity, 'rolePermission', 'rolePermission.role_id = role.id')
      .innerJoin(PermissionOrmEntity, 'permission', 'permission.id = rolePermission.permission_id AND permission.deleted_at IS NULL')
      .select('DISTINCT permission.code', 'code')
      .where('userRole.user_id = :userId', { userId })
      .orderBy('permission.code', 'ASC')
      .getRawMany<{ code: string }>();

    return rows.map((row) => row.code);
  }
}
