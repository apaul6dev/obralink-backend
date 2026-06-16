import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { CreatePermissionDto } from '../dto/permission/create-permission.dto';
import { UpdatePermissionDto } from '../dto/permission/update-permission.dto';
import { AppModuleOrmEntity } from '../../infrastructure/persistence/typeorm/entities/app-module.orm-entity';
import { PermissionOrmEntity } from '../../infrastructure/persistence/typeorm/entities/permission.orm-entity';

export interface PermissionAdminItem {
  id: string;
  code: string;
  description: string | null;
  category: string;
  moduleId: string;
  moduleCode: string;
  moduleName: string;
  moduleIcon: string | null;
  action: string;
  label: string;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface PermissionCatalogGroup {
  category: string;
  moduleId: string;
  moduleCode: string;
  label: string;
  icon: string | null;
  permissions: PermissionAdminItem[];
}

@Injectable()
export class PermissionAdminService {
  constructor(
    @InjectRepository(PermissionOrmEntity)
    private readonly permissionRepository: Repository<PermissionOrmEntity>,
    @InjectRepository(AppModuleOrmEntity)
    private readonly moduleRepository: Repository<AppModuleOrmEntity>,
  ) {}

  async findAll(): Promise<PermissionAdminItem[]> {
    const permissions = await this.permissionRepository.find({
      relations: { module: true },
      order: { category: 'ASC', module: { displayOrder: 'ASC', name: 'ASC' }, action: 'ASC', code: 'ASC' },
    });
    return permissions.map((permission) => this.toItem(permission));
  }

  async findCatalog(category?: 'API' | 'UI'): Promise<PermissionCatalogGroup[]> {
    const permissions = await this.permissionRepository.find({
      where: category ? { category } : undefined,
      relations: { module: true },
      order: { category: 'ASC', module: { displayOrder: 'ASC', name: 'ASC' }, action: 'ASC', label: 'ASC' },
    });

    const groups = new Map<string, PermissionCatalogGroup>();
    for (const permission of permissions) {
      if (!permission.module) {
        continue;
      }
      const key = `${permission.category}:${permission.moduleId}`;
      if (!groups.has(key)) {
        groups.set(key, {
          category: permission.category,
          moduleId: permission.moduleId,
          moduleCode: permission.module.code,
          label: permission.module.name,
          icon: permission.module.icon,
          permissions: [],
        });
      }
      groups.get(key)?.permissions.push(this.toItem(permission));
    }

    return Array.from(groups.values());
  }

  async create(payload: CreatePermissionDto): Promise<PermissionAdminItem> {
    await this.assertCodeAvailable(payload.code);
    await this.assertModuleExists(payload.moduleId);
    const metadata = this.resolveMetadata(payload);
    const permission = await this.permissionRepository.save(
      this.permissionRepository.create({
        id: randomUUID(),
        code: payload.code.trim(),
        description: payload.description?.trim() || null,
        category: metadata.category,
        moduleId: payload.moduleId,
        action: metadata.action,
        label: metadata.label,
        isSystem: payload.isSystem ?? false,
      }),
    );
    return this.findById(permission.id);
  }

  async update(permissionId: string, payload: UpdatePermissionDto): Promise<PermissionAdminItem> {
    const permission = await this.findExisting(permissionId);
    const nextPayload = {
      code: payload.code ?? permission.code,
      category: payload.category ?? (permission.category as 'API' | 'UI'),
      action: payload.action ?? permission.action,
      label: payload.label ?? permission.label,
    };
    const moduleId = payload.moduleId ?? permission.moduleId;
    await this.assertModuleExists(moduleId);
    if (payload.code && payload.code.trim() !== permission.code) {
      await this.assertCodeAvailable(payload.code, permissionId);
      permission.code = payload.code.trim();
    }
    if (payload.description !== undefined) {
      permission.description = payload.description?.trim() || null;
    }
    const metadata = this.resolveMetadata(nextPayload);
    permission.category = metadata.category;
    permission.moduleId = moduleId;
    permission.action = metadata.action;
    permission.label = metadata.label;
    permission.isSystem = payload.isSystem ?? permission.isSystem;
    await this.permissionRepository.save(permission);
    return this.findById(permission.id);
  }

  async remove(permissionId: string): Promise<void> {
    const permission = await this.findExisting(permissionId);
    await this.permissionRepository.softRemove(permission);
  }

  private async findExisting(permissionId: string): Promise<PermissionOrmEntity> {
    const permission = await this.permissionRepository.findOne({ where: { id: permissionId } });
    if (!permission) {
      throw new NotFoundException('Permission not found.');
    }
    return permission;
  }

  private async findById(permissionId: string): Promise<PermissionAdminItem> {
    const permission = await this.permissionRepository.findOne({ where: { id: permissionId }, relations: { module: true } });
    if (!permission) {
      throw new NotFoundException('Permission not found.');
    }
    return this.toItem(permission);
  }

  private async assertCodeAvailable(code: string, excludeId?: string): Promise<void> {
    const existing = await this.permissionRepository.findOne({ where: { code: code.trim() } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('Permission code already exists.');
    }
  }

  private async assertModuleExists(moduleId: string): Promise<void> {
    const module = await this.moduleRepository.findOne({ where: { id: moduleId } });
    if (!module) {
      throw new NotFoundException('Module not found.');
    }
  }

  private resolveMetadata(payload: Pick<CreatePermissionDto, 'code' | 'category' | 'action' | 'label'>): {
    category: string;
    action: string;
    label: string;
  } {
    const code = payload.code.trim();
    const parts = code.split('.');
    const category = payload.category ?? (parts[0] === 'ui' ? 'UI' : 'API');
    const action = payload.action?.trim() || parts.slice(2).join('.') || parts[0] || 'access';
    const label = payload.label?.trim() || this.toTitle(action.replace(/\./g, ' '));
    return { category, action, label };
  }

  private toTitle(value: string): string {
    return value
      .replace(/[_-]/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private toItem(permission: PermissionOrmEntity): PermissionAdminItem {
    return {
      id: permission.id,
      code: permission.code,
      description: permission.description,
      category: permission.category,
      moduleId: permission.moduleId,
      moduleCode: permission.module?.code ?? '',
      moduleName: permission.module?.name ?? '',
      moduleIcon: permission.module?.icon ?? null,
      action: permission.action,
      label: permission.label,
      isSystem: permission.isSystem,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
      deletedAt: permission.deletedAt,
    };
  }
}
