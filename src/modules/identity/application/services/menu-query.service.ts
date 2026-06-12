import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Status } from '../../domain/enums/status.enum';
import { UserType } from '../../domain/enums/user-type.enum';
import { AuthenticatedIdentity } from '../../domain/services/company-access-policy.service';

export interface AuthorizedMenuItem {
  id: string;
  title: string;
  routerLink: string | null;
  href: string | null;
  icon: string;
  target: string | null;
  hasSubMenu: boolean;
  parentId: string | number;
}

interface MenuRow {
  code: string;
  title_key: string;
  router_link: string | null;
  href: string | null;
  icon: string;
  target: string | null;
  parent_code: string | null;
  display_order: number;
  allowed_user_types: string[] | null;
  permissions: string[] | null;
}

@Injectable()
export class MenuQueryService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findAuthorizedMenu(currentUser: AuthenticatedIdentity): Promise<AuthorizedMenuItem[]> {
    const effectivePermissions = await this.findEffectivePermissions(currentUser);
    const rows = await this.dataSource.query<MenuRow[]>(
      `
        SELECT
          menu.code,
          menu.title_key,
          menu.router_link,
          menu.href,
          menu.icon,
          menu.target,
          parent.code AS parent_code,
          menu.display_order,
          menu.allowed_user_types,
          COALESCE(array_remove(array_agg(permission.code ORDER BY permission.code), NULL), '{}') AS permissions
        FROM menu_items menu
        LEFT JOIN menu_items parent ON parent.id = menu.parent_id AND parent.deleted_at IS NULL
        LEFT JOIN menu_item_permissions menu_permission ON menu_permission.menu_item_id = menu.id
        LEFT JOIN permissions permission ON permission.id = menu_permission.permission_id AND permission.deleted_at IS NULL
        WHERE menu.deleted_at IS NULL
          AND menu.status = $1
        GROUP BY menu.id, parent.code, parent.display_order
        ORDER BY COALESCE(parent.display_order, menu.display_order), menu.parent_id NULLS FIRST, menu.display_order, menu.title_key
      `,
      [Status.ACTIVE],
    );

    const visibleCodes = new Set<string>();

    for (const row of rows) {
      if (this.canShowRow(row, currentUser, effectivePermissions)) {
        visibleCodes.add(row.code);
      }
    }

    let changed = true;
    while (changed) {
      changed = false;
      for (const row of rows) {
        if (!visibleCodes.has(row.code) && rows.some((child) => child.parent_code === row.code && visibleCodes.has(child.code))) {
          visibleCodes.add(row.code);
          changed = true;
        }
      }
    }

    return rows
      .filter((row) => visibleCodes.has(row.code))
      .map((row) => ({
        id: row.code,
        title: row.title_key,
        routerLink: row.router_link,
        href: row.href,
        icon: row.icon,
        target: row.target,
        hasSubMenu: rows.some((child) => child.parent_code === row.code && visibleCodes.has(child.code)),
        parentId: row.parent_code ?? 0,
      }));
  }

  private canShowRow(row: MenuRow, currentUser: AuthenticatedIdentity, effectivePermissions: string[]): boolean {
    const allowedUserTypes = row.allowed_user_types ?? [];
    if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(currentUser.userType)) {
      return false;
    }

    const requiredPermissions = row.permissions ?? [];
    if (requiredPermissions.length === 0) {
      return true;
    }
    if (currentUser.userType === UserType.SYSTEM_OWNER) {
      return true;
    }

    return requiredPermissions.every((permission) => effectivePermissions.includes(permission));
  }

  private async findEffectivePermissions(currentUser: AuthenticatedIdentity): Promise<string[]> {
    const rows = await this.dataSource.query<Array<{ code: string }>>(
      `
        SELECT DISTINCT permission.code AS code
        FROM user_roles user_role
        INNER JOIN roles role ON role.id = user_role.role_id AND role.deleted_at IS NULL
        INNER JOIN role_permissions role_permission ON role_permission.role_id = role.id
        INNER JOIN permissions permission ON permission.id = role_permission.permission_id AND permission.deleted_at IS NULL
        WHERE user_role.user_id = $1
        ORDER BY permission.code
      `,
      [currentUser.id],
    );

    return Array.from(new Set([...(currentUser.permissions ?? []), ...rows.map((row) => row.code)]));
  }
}
