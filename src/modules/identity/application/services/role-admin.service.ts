import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { AssignRolePermissionsDto } from '../dto/role/assign-role-permissions.dto';
import { CreateRoleDto } from '../dto/role/create-role.dto';
import { UpdateRoleDto } from '../dto/role/update-role.dto';
import { Status } from '../../domain/enums/status.enum';
import { UserType } from '../../domain/enums/user-type.enum';
import { AuthenticatedIdentity, CompanyAccessPolicyService } from '../../domain/services/company-access-policy.service';

export interface RoleAdminItem {
  id: string;
  companyId: string | null;
  name: string;
  code: string;
  status: Status;
  permissionIds: string[];
  permissionCodes: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface RoleRow {
  id: string;
  company_id: string | null;
  name: string;
  code: string;
  status: Status;
  permission_ids: string[];
  permission_codes: string[];
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

@Injectable()
export class RoleAdminService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly accessPolicy: CompanyAccessPolicyService,
  ) {}

  async findAll(currentUser: AuthenticatedIdentity, requestedCompanyId?: string): Promise<RoleAdminItem[]> {
    const params: unknown[] = [];
    let companyPredicate = '';

    if (currentUser.userType === UserType.SYSTEM_OWNER) {
      if (requestedCompanyId) {
        params.push(requestedCompanyId);
        companyPredicate = 'AND role.company_id = $1';
      }
    } else {
      const companyId = this.accessPolicy.resolveCompanyIdForCompanyOperation(currentUser, requestedCompanyId);
      params.push(companyId);
      companyPredicate = 'AND role.company_id = $1';
    }

    const rows = await this.dataSource.query<RoleRow[]>(
      `
        SELECT
          role.id,
          role.company_id,
          role.name,
          role.code,
          role.status,
          role.created_at,
          role.updated_at,
          role.deleted_at,
          COALESCE(array_remove(array_agg(permission.id ORDER BY permission.code), NULL), ARRAY[]::uuid[]) AS permission_ids,
          COALESCE(array_remove(array_agg(permission.code ORDER BY permission.code), NULL), ARRAY[]::varchar[]) AS permission_codes
        FROM roles role
        LEFT JOIN role_permissions role_permission ON role_permission.role_id = role.id
        LEFT JOIN permissions permission ON permission.id = role_permission.permission_id AND permission.deleted_at IS NULL
        WHERE role.deleted_at IS NULL
          ${companyPredicate}
        GROUP BY
          role.id,
          role.company_id,
          role.name,
          role.code,
          role.status,
          role.created_at,
          role.updated_at,
          role.deleted_at
        ORDER BY role.company_id NULLS FIRST, role.name
      `,
      params,
    );

    return rows.map((row) => this.toItem(row));
  }

  async create(currentUser: AuthenticatedIdentity, payload: CreateRoleDto): Promise<RoleAdminItem> {
    const roleId = randomUUID();
    const companyId = this.resolveWritableCompanyId(currentUser, payload.companyId ?? null);
    await this.assertCodeAvailable(payload.code, companyId);
    await this.assertPermissionsExist(payload.permissionIds ?? []);

    await this.dataSource.transaction(async (manager) => {
      await manager.query(
        `
          INSERT INTO roles (id, company_id, name, code, status, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, now(), now())
        `,
        [roleId, companyId, payload.name.trim(), payload.code.trim(), payload.status ?? Status.ACTIVE],
      );
      await this.replacePermissions(roleId, companyId, payload.permissionIds ?? [], manager);
    });

    return this.findById(roleId);
  }

  async update(currentUser: AuthenticatedIdentity, roleId: string, payload: UpdateRoleDto): Promise<RoleAdminItem> {
    const role = await this.findRoleRow(roleId);
    this.assertCanManageRole(currentUser, role.company_id);
    const requestedCompanyId = payload.companyId !== undefined ? payload.companyId ?? null : role.company_id;
    const companyId = this.resolveWritableCompanyId(currentUser, requestedCompanyId);
    if ((payload.code && payload.code.trim() !== role.code) || companyId !== role.company_id) {
      await this.assertCodeAvailable(payload.code?.trim() ?? role.code, companyId, roleId);
    }
    if (payload.permissionIds) {
      await this.assertPermissionsExist(payload.permissionIds);
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.query(
        `
          UPDATE roles
          SET company_id = $2,
              name = $3,
              code = $4,
              status = $5,
              updated_at = now()
          WHERE id = $1
            AND deleted_at IS NULL
        `,
        [
          roleId,
          companyId,
          payload.name?.trim() ?? role.name,
          payload.code?.trim() ?? role.code,
          payload.status ?? role.status,
        ],
      );
      if (payload.permissionIds) {
        await this.replacePermissions(roleId, companyId, payload.permissionIds, manager);
      }
    });

    await this.syncUsersWithRole(roleId);
    return this.findById(roleId);
  }

  async assignPermissions(currentUser: AuthenticatedIdentity, roleId: string, payload: AssignRolePermissionsDto): Promise<RoleAdminItem> {
    const role = await this.findRoleRow(roleId);
    this.assertCanManageRole(currentUser, role.company_id);
    await this.assertPermissionsExist(payload.permissionIds);
    await this.dataSource.transaction(async (manager) => {
      await this.replacePermissions(roleId, role.company_id, payload.permissionIds, manager);
    });
    await this.syncUsersWithRole(roleId);
    return this.findById(roleId);
  }

  async remove(currentUser: AuthenticatedIdentity, roleId: string): Promise<void> {
    const role = await this.findRoleRow(roleId);
    this.assertCanManageRole(currentUser, role.company_id);
    await this.dataSource.query(
      `
        UPDATE roles
        SET deleted_at = now(),
            updated_at = now()
        WHERE id = $1
          AND deleted_at IS NULL
      `,
      [roleId],
    );
    await this.syncUsersWithRole(roleId);
  }

  private async findById(roleId: string): Promise<RoleAdminItem> {
    const role = await this.findRoleRow(roleId);
    return this.toItem(role);
  }

  private resolveWritableCompanyId(currentUser: AuthenticatedIdentity, requestedCompanyId: string | null): string | null {
    if (currentUser.userType === UserType.SYSTEM_OWNER) {
      return requestedCompanyId;
    }
    if (!currentUser.companyId) {
      throw new ForbiddenException('Company context is required.');
    }
    if (requestedCompanyId && requestedCompanyId !== currentUser.companyId) {
      throw new ForbiddenException('Cross-company role management is not allowed.');
    }
    return currentUser.companyId;
  }

  private assertCanManageRole(currentUser: AuthenticatedIdentity, roleCompanyId: string | null): void {
    if (currentUser.userType === UserType.SYSTEM_OWNER) {
      return;
    }
    if (!roleCompanyId) {
      throw new ForbiddenException('Global roles can only be managed by platform users.');
    }
    this.accessPolicy.assertCompanyAccess(currentUser, roleCompanyId);
  }

  private async findRoleRow(roleId: string): Promise<RoleRow> {
    const rows = await this.dataSource.query<RoleRow[]>(
      `
        SELECT
          role.id,
          role.company_id,
          role.name,
          role.code,
          role.status,
          role.created_at,
          role.updated_at,
          role.deleted_at,
          COALESCE(array_remove(array_agg(permission.id ORDER BY permission.code), NULL), ARRAY[]::uuid[]) AS permission_ids,
          COALESCE(array_remove(array_agg(permission.code ORDER BY permission.code), NULL), ARRAY[]::varchar[]) AS permission_codes
        FROM roles role
        LEFT JOIN role_permissions role_permission ON role_permission.role_id = role.id
        LEFT JOIN permissions permission ON permission.id = role_permission.permission_id AND permission.deleted_at IS NULL
        WHERE role.id = $1
          AND role.deleted_at IS NULL
        GROUP BY
          role.id,
          role.company_id,
          role.name,
          role.code,
          role.status,
          role.created_at,
          role.updated_at,
          role.deleted_at
        LIMIT 1
      `,
      [roleId],
    );
    if (!rows[0]) {
      throw new NotFoundException('Role not found.');
    }
    return rows[0];
  }

  private async assertCodeAvailable(code: string, companyId: string | null, excludeId?: string): Promise<void> {
    const rows = await this.dataSource.query<Array<{ id: string }>>(
      `
        SELECT id
        FROM roles
        WHERE code = $1
          AND deleted_at IS NULL
          AND ${companyId ? 'company_id = $2' : 'company_id IS NULL'}
      `,
      companyId ? [code.trim(), companyId] : [code.trim()],
    );
    if (rows.some((row) => row.id !== excludeId)) {
      throw new ConflictException('Role code already exists for this company scope.');
    }
  }

  private async assertPermissionsExist(permissionIds: string[]): Promise<void> {
    if (permissionIds.length === 0) {
      return;
    }
    const rows = await this.dataSource.query<Array<{ id: string }>>(
      `
        SELECT id
        FROM permissions
        WHERE id = ANY($1::uuid[])
          AND deleted_at IS NULL
      `,
      [permissionIds],
    );
    if (rows.length !== new Set(permissionIds).size) {
      throw new NotFoundException('One or more permissions were not found.');
    }
  }

  private async replacePermissions(roleId: string, companyId: string | null, permissionIds: string[], manager = this.dataSource.manager): Promise<void> {
    await manager.query(`DELETE FROM role_permissions WHERE role_id = $1`, [roleId]);
    for (const permissionId of Array.from(new Set(permissionIds))) {
      await manager.query(
        `
          INSERT INTO role_permissions (id, role_id, permission_id, company_id, created_at)
          VALUES ($1, $2, $3, $4, now())
        `,
        [randomUUID(), roleId, permissionId, companyId],
      );
    }
  }

  private async syncUsersWithRole(roleId: string): Promise<void> {
    const users = await this.dataSource.query<Array<{ user_id: string }>>(`SELECT DISTINCT user_id FROM user_roles WHERE role_id = $1`, [roleId]);
    for (const user of users) {
      const permissions = await this.dataSource.query<Array<{ code: string }>>(
        `
          SELECT DISTINCT permission.code AS code
          FROM user_roles user_role
          INNER JOIN roles role ON role.id = user_role.role_id AND role.deleted_at IS NULL
          INNER JOIN role_permissions role_permission ON role_permission.role_id = role.id
          INNER JOIN permissions permission ON permission.id = role_permission.permission_id AND permission.deleted_at IS NULL
          WHERE user_role.user_id = $1
          ORDER BY permission.code
        `,
        [user.user_id],
      );
      await this.dataSource.query(`UPDATE ba_user SET permissions = $2, updated_at = now() WHERE id = $1`, [
        user.user_id,
        permissions.map((permission) => permission.code),
      ]);
    }
  }

  private toItem(row: RoleRow): RoleAdminItem {
    return {
      id: row.id,
      companyId: row.company_id,
      name: row.name,
      code: row.code,
      status: row.status,
      permissionIds: row.permission_ids ?? [],
      permissionCodes: row.permission_codes ?? [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    };
  }
}
