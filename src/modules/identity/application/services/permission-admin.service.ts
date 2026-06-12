import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { CreatePermissionDto } from '../dto/permission/create-permission.dto';
import { UpdatePermissionDto } from '../dto/permission/update-permission.dto';
import { PermissionOrmEntity } from '../../infrastructure/persistence/typeorm/entities/permission.orm-entity';

export interface PermissionAdminItem {
  id: string;
  code: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

@Injectable()
export class PermissionAdminService {
  constructor(
    @InjectRepository(PermissionOrmEntity)
    private readonly permissionRepository: Repository<PermissionOrmEntity>,
  ) {}

  async findAll(): Promise<PermissionAdminItem[]> {
    return this.permissionRepository.find({ order: { code: 'ASC' } });
  }

  async create(payload: CreatePermissionDto): Promise<PermissionAdminItem> {
    await this.assertCodeAvailable(payload.code);
    return this.permissionRepository.save(
      this.permissionRepository.create({
        id: randomUUID(),
        code: payload.code.trim(),
        description: payload.description?.trim() || null,
      }),
    );
  }

  async update(permissionId: string, payload: UpdatePermissionDto): Promise<PermissionAdminItem> {
    const permission = await this.findExisting(permissionId);
    if (payload.code && payload.code.trim() !== permission.code) {
      await this.assertCodeAvailable(payload.code, permissionId);
      permission.code = payload.code.trim();
    }
    if (payload.description !== undefined) {
      permission.description = payload.description?.trim() || null;
    }
    return this.permissionRepository.save(permission);
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

  private async assertCodeAvailable(code: string, excludeId?: string): Promise<void> {
    const existing = await this.permissionRepository.findOne({ where: { code: code.trim() } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('Permission code already exists.');
    }
  }
}
