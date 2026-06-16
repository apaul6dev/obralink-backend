import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { CreateMenuItemDto } from '../dto/menu/create-menu-item.dto';
import { UpdateMenuItemDto } from '../dto/menu/update-menu-item.dto';
import { Status } from '../../domain/enums/status.enum';
import { UserType } from '../../domain/enums/user-type.enum';

export interface MenuPermissionSummary {
  id: string;
  code: string;
  label: string;
  moduleId: string;
  moduleCode: string;
  moduleName: string;
  moduleIcon: string | null;
  action: string;
  category: string;
}

export interface MenuAdminItem {
  id: string;
  code: string;
  titleKey: string;
  routerLink: string | null;
  href: string | null;
  icon: string;
  target: string | null;
  parentId: string | null;
  parentCode: string | null;
  displayOrder: number;
  allowedUserTypes: UserType[] | null;
  status: Status;
  permissionIds: string[];
  permissionCodes: string[];
  permissions: MenuPermissionSummary[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface MenuAdminTreeNode extends MenuAdminItem {
  children: MenuAdminTreeNode[];
}

export interface MenuAdminOptions {
  statuses: Status[];
  userTypes: UserType[];
  parentItems: Array<Pick<MenuAdminItem, 'id' | 'code' | 'titleKey' | 'parentId'>>;
  permissionGroups: Array<{
    moduleId: string;
    moduleCode: string;
    label: string;
    icon: string | null;
    permissions: MenuPermissionSummary[];
  }>;
}

interface MenuAdminRow {
  id: string;
  code: string;
  title_key: string;
  router_link: string | null;
  href: string | null;
  icon: string;
  target: string | null;
  parent_id: string | null;
  parent_code: string | null;
  display_order: number;
  allowed_user_types: UserType[] | null;
  status: Status;
  permission_ids: string[];
  permission_codes: string[];
  permissions: MenuPermissionSummary[] | string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

@Injectable()
export class MenuAdminService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findAll(): Promise<MenuAdminItem[]> {
    const rows = await this.findRows();
    return rows.map((row) => this.toItem(row));
  }

  async findTree(): Promise<MenuAdminTreeNode[]> {
    const items = await this.findAll();
    const nodes = new Map<string, MenuAdminTreeNode>();
    for (const item of items) {
      nodes.set(item.id, { ...item, children: [] });
    }

    const roots: MenuAdminTreeNode[] = [];
    for (const node of nodes.values()) {
      if (node.parentId && nodes.has(node.parentId)) {
        nodes.get(node.parentId)?.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  async findOptions(): Promise<MenuAdminOptions> {
    const [items, permissionGroups] = await Promise.all([this.findAll(), this.findUiPermissionGroups()]);
    return {
      statuses: Object.values(Status),
      userTypes: Object.values(UserType),
      parentItems: items.map((item) => ({
        id: item.id,
        code: item.code,
        titleKey: item.titleKey,
        parentId: item.parentId,
      })),
      permissionGroups,
    };
  }

  async create(payload: CreateMenuItemDto): Promise<MenuAdminItem> {
    const menuItemId = randomUUID();
    await this.assertCodeAvailable(payload.code);
    await this.assertParentExists(payload.parentId ?? null);
    await this.assertUiPermissionsExist(payload.permissionIds ?? []);

    await this.dataSource.transaction(async (manager) => {
      await manager.query(
        `
          INSERT INTO menu_items (
            id, code, title_key, router_link, href, icon, target, parent_id,
            display_order, allowed_user_types, status, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, now(), now())
        `,
        [
          menuItemId,
          payload.code.trim(),
          payload.titleKey.trim(),
          payload.routerLink || null,
          payload.href || null,
          payload.icon.trim(),
          payload.target || null,
          payload.parentId ?? null,
          payload.displayOrder ?? 0,
          payload.allowedUserTypes ?? null,
          payload.status ?? Status.ACTIVE,
        ],
      );
      await this.replacePermissions(menuItemId, payload.permissionIds ?? [], manager);
    });

    return this.findById(menuItemId);
  }

  async update(menuItemId: string, payload: UpdateMenuItemDto): Promise<MenuAdminItem> {
    const menuItem = await this.findRow(menuItemId);
    const parentId = payload.parentId !== undefined ? payload.parentId : menuItem.parent_id;
    if (parentId === menuItemId) {
      throw new ConflictException('Menu item cannot be its own parent.');
    }
    if (payload.code && payload.code.trim() !== menuItem.code) {
      await this.assertCodeAvailable(payload.code, menuItemId);
    }
    await this.assertParentExists(parentId ?? null);
    await this.assertNoParentCycle(menuItemId, parentId ?? null);
    if (payload.permissionIds) {
      await this.assertUiPermissionsExist(payload.permissionIds);
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.query(
        `
          UPDATE menu_items
          SET code = $2,
              title_key = $3,
              router_link = $4,
              href = $5,
              icon = $6,
              target = $7,
              parent_id = $8,
              display_order = $9,
              allowed_user_types = $10,
              status = $11,
              updated_at = now()
          WHERE id = $1
            AND deleted_at IS NULL
        `,
        [
          menuItemId,
          payload.code?.trim() ?? menuItem.code,
          payload.titleKey?.trim() ?? menuItem.title_key,
          payload.routerLink !== undefined ? payload.routerLink || null : menuItem.router_link,
          payload.href !== undefined ? payload.href || null : menuItem.href,
          payload.icon?.trim() ?? menuItem.icon,
          payload.target !== undefined ? payload.target || null : menuItem.target,
          parentId ?? null,
          payload.displayOrder ?? menuItem.display_order,
          payload.allowedUserTypes !== undefined ? payload.allowedUserTypes : menuItem.allowed_user_types,
          payload.status ?? menuItem.status,
        ],
      );
      if (payload.permissionIds) {
        await this.replacePermissions(menuItemId, payload.permissionIds, manager);
      }
    });

    return this.findById(menuItemId);
  }

  async remove(menuItemId: string): Promise<void> {
    await this.findRow(menuItemId);
    await this.dataSource.query(
      `
        UPDATE menu_items
        SET deleted_at = now(),
            updated_at = now()
        WHERE id = $1
          AND deleted_at IS NULL
      `,
      [menuItemId],
    );
  }

  private async findById(menuItemId: string): Promise<MenuAdminItem> {
    return this.toItem(await this.findRow(menuItemId));
  }

  private async findRow(menuItemId: string): Promise<MenuAdminRow> {
    const rows = await this.findRows('menu.id = $1', [menuItemId]);
    if (!rows[0]) {
      throw new NotFoundException('Menu item not found.');
    }
    return rows[0];
  }

  private async findRows(extraPredicate = 'TRUE', params: unknown[] = []): Promise<MenuAdminRow[]> {
    return this.dataSource.query<MenuAdminRow[]>(
      `
        SELECT
          menu.id,
          menu.code,
          menu.title_key,
          menu.router_link,
          menu.href,
          menu.icon,
          menu.target,
          menu.parent_id,
          parent.code AS parent_code,
          menu.display_order,
          menu.allowed_user_types,
          menu.status,
          menu.created_at,
          menu.updated_at,
          menu.deleted_at,
          COALESCE(array_remove(array_agg(permission.id ORDER BY permission.code), NULL), ARRAY[]::uuid[]) AS permission_ids,
          COALESCE(array_remove(array_agg(permission.code ORDER BY permission.code), NULL), ARRAY[]::varchar[]) AS permission_codes,
          COALESCE(
            jsonb_agg(
              DISTINCT jsonb_build_object(
                'id', permission.id,
                'code', permission.code,
                'label', permission.label,
                'moduleId', app_module.id,
                'moduleCode', app_module.code,
                'moduleName', app_module.name,
                'moduleIcon', app_module.icon,
                'action', permission.action,
                'category', permission.category
              )
            ) FILTER (WHERE permission.id IS NOT NULL),
            '[]'::jsonb
          ) AS permissions
        FROM menu_items menu
        LEFT JOIN menu_items parent ON parent.id = menu.parent_id AND parent.deleted_at IS NULL
        LEFT JOIN menu_item_permissions menu_permission ON menu_permission.menu_item_id = menu.id
        LEFT JOIN permissions permission ON permission.id = menu_permission.permission_id AND permission.deleted_at IS NULL
        LEFT JOIN app_modules app_module ON app_module.id = permission.module_id AND app_module.deleted_at IS NULL
        WHERE menu.deleted_at IS NULL
          AND ${extraPredicate}
        GROUP BY
          menu.id,
          menu.code,
          menu.title_key,
          menu.router_link,
          menu.href,
          menu.icon,
          menu.target,
          menu.parent_id,
          parent.code,
          parent.display_order,
          menu.display_order,
          menu.allowed_user_types,
          menu.status,
          menu.created_at,
          menu.updated_at,
          menu.deleted_at
        ORDER BY COALESCE(parent.display_order, menu.display_order), menu.parent_id NULLS FIRST, menu.display_order, menu.title_key
      `,
      params,
    );
  }

  private async assertCodeAvailable(code: string, excludeId?: string): Promise<void> {
    const rows = await this.dataSource.query<Array<{ id: string }>>(
      `
        SELECT id
        FROM menu_items
        WHERE code = $1
          AND deleted_at IS NULL
      `,
      [code.trim()],
    );
    if (rows.some((row) => row.id !== excludeId)) {
      throw new ConflictException('Menu item code already exists.');
    }
  }

  private async assertParentExists(parentId: string | null): Promise<void> {
    if (!parentId) {
      return;
    }
    const rows = await this.dataSource.query<Array<{ id: string }>>(
      `SELECT id FROM menu_items WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
      [parentId],
    );
    if (!rows[0]) {
      throw new NotFoundException('Parent menu item not found.');
    }
  }

  private async assertUiPermissionsExist(permissionIds: string[]): Promise<void> {
    if (permissionIds.length === 0) {
      return;
    }
    const rows = await this.dataSource.query<Array<{ id: string; category: string }>>(
      `
        SELECT id, category
        FROM permissions
        WHERE id = ANY($1::uuid[])
          AND deleted_at IS NULL
      `,
      [permissionIds],
    );
    if (rows.length !== new Set(permissionIds).size) {
      throw new NotFoundException('One or more permissions were not found.');
    }
    if (rows.some((row) => row.category !== 'UI')) {
      throw new ConflictException('Menu visibility can only use UI permissions.');
    }
  }

  private async assertNoParentCycle(menuItemId: string, parentId: string | null): Promise<void> {
    if (!parentId) {
      return;
    }
    const rows = await this.dataSource.query<Array<{ id: string }>>(
      `
        WITH RECURSIVE ancestors AS (
          SELECT id, parent_id
          FROM menu_items
          WHERE id = $1
            AND deleted_at IS NULL
          UNION ALL
          SELECT menu.id, menu.parent_id
          FROM menu_items menu
          INNER JOIN ancestors ON ancestors.parent_id = menu.id
          WHERE menu.deleted_at IS NULL
        )
        SELECT id
        FROM ancestors
        WHERE id = $2
        LIMIT 1
      `,
      [parentId, menuItemId],
    );
    if (rows[0]) {
      throw new ConflictException('Menu parent cannot create a hierarchy cycle.');
    }
  }

  private async findUiPermissionGroups(): Promise<MenuAdminOptions['permissionGroups']> {
    const rows = await this.dataSource.query<MenuPermissionSummary[]>(
      `
        SELECT
          permission.id,
          permission.code,
          permission.label,
          permission.module_id AS "moduleId",
          app_module.code AS "moduleCode",
          app_module.name AS "moduleName",
          app_module.icon AS "moduleIcon",
          permission.action,
          permission.category
        FROM permissions permission
        INNER JOIN app_modules app_module ON app_module.id = permission.module_id AND app_module.deleted_at IS NULL
        WHERE permission.deleted_at IS NULL
          AND permission.category = 'UI'
        ORDER BY app_module.display_order, app_module.name, permission.action, permission.label
      `,
    );

    const groups = new Map<string, MenuAdminOptions['permissionGroups'][number]>();
    for (const permission of rows) {
      if (!groups.has(permission.moduleId)) {
        groups.set(permission.moduleId, {
          moduleId: permission.moduleId,
          moduleCode: permission.moduleCode,
          label: permission.moduleName,
          icon: permission.moduleIcon,
          permissions: [],
        });
      }
      groups.get(permission.moduleId)?.permissions.push(permission);
    }

    return Array.from(groups.values());
  }

  private async replacePermissions(menuItemId: string, permissionIds: string[], manager = this.dataSource.manager): Promise<void> {
    await manager.query(`DELETE FROM menu_item_permissions WHERE menu_item_id = $1`, [menuItemId]);
    for (const permissionId of Array.from(new Set(permissionIds))) {
      await manager.query(
        `
          INSERT INTO menu_item_permissions (id, menu_item_id, permission_id, created_at)
          VALUES ($1, $2, $3, now())
        `,
        [randomUUID(), menuItemId, permissionId],
      );
    }
  }

  private toItem(row: MenuAdminRow): MenuAdminItem {
    return {
      id: row.id,
      code: row.code,
      titleKey: row.title_key,
      routerLink: row.router_link,
      href: row.href,
      icon: row.icon,
      target: row.target,
      parentId: row.parent_id,
      parentCode: row.parent_code,
      displayOrder: row.display_order,
      allowedUserTypes: row.allowed_user_types,
      status: row.status,
      permissionIds: row.permission_ids ?? [],
      permissionCodes: row.permission_codes ?? [],
      permissions: this.parsePermissions(row.permissions),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    };
  }

  private parsePermissions(value: MenuAdminRow['permissions']): MenuPermissionSummary[] {
    if (!value) {
      return [];
    }
    if (typeof value === 'string') {
      return JSON.parse(value) as MenuPermissionSummary[];
    }
    return value;
  }
}
