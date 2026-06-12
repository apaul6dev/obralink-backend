import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { CreateMenuItemDto } from '../dto/menu/create-menu-item.dto';
import { UpdateMenuItemDto } from '../dto/menu/update-menu-item.dto';
import { Status } from '../../domain/enums/status.enum';
import { UserType } from '../../domain/enums/user-type.enum';

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
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
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

  async create(payload: CreateMenuItemDto): Promise<MenuAdminItem> {
    const menuItemId = randomUUID();
    await this.assertCodeAvailable(payload.code);
    await this.assertParentExists(payload.parentId ?? null);
    await this.assertPermissionsExist(payload.permissionIds ?? []);

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
    if (payload.permissionIds) {
      await this.assertPermissionsExist(payload.permissionIds);
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
          COALESCE(array_remove(array_agg(permission.code ORDER BY permission.code), NULL), ARRAY[]::varchar[]) AS permission_codes
        FROM menu_items menu
        LEFT JOIN menu_items parent ON parent.id = menu.parent_id AND parent.deleted_at IS NULL
        LEFT JOIN menu_item_permissions menu_permission ON menu_permission.menu_item_id = menu.id
        LEFT JOIN permissions permission ON permission.id = menu_permission.permission_id AND permission.deleted_at IS NULL
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
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    };
  }
}
