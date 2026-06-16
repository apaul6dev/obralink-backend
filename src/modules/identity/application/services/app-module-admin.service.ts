import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { CreateAppModuleDto } from '../dto/app-module/create-app-module.dto';
import { UpdateAppModuleDto } from '../dto/app-module/update-app-module.dto';
import { Status } from '../../domain/enums/status.enum';
import { AppModuleOrmEntity } from '../../infrastructure/persistence/typeorm/entities/app-module.orm-entity';

@Injectable()
export class AppModuleAdminService {
  constructor(
    @InjectRepository(AppModuleOrmEntity)
    private readonly moduleRepository: Repository<AppModuleOrmEntity>,
  ) {}

  async findAll(): Promise<AppModuleOrmEntity[]> {
    return this.moduleRepository.find({ order: { displayOrder: 'ASC', name: 'ASC' } });
  }

  async create(payload: CreateAppModuleDto): Promise<AppModuleOrmEntity> {
    await this.assertCodeAvailable(payload.code);
    return this.moduleRepository.save(
      this.moduleRepository.create({
        id: randomUUID(),
        code: payload.code.trim(),
        name: payload.name.trim(),
        description: payload.description?.trim() || null,
        icon: payload.icon?.trim() || null,
        displayOrder: payload.displayOrder ?? 0,
        status: payload.status ?? Status.ACTIVE,
        isSystem: payload.isSystem ?? false,
      }),
    );
  }

  async update(moduleId: string, payload: UpdateAppModuleDto): Promise<AppModuleOrmEntity> {
    const module = await this.findExisting(moduleId);
    if (payload.code && payload.code.trim() !== module.code) {
      await this.assertCodeAvailable(payload.code, moduleId);
      module.code = payload.code.trim();
    }
    module.name = payload.name?.trim() ?? module.name;
    module.description = payload.description !== undefined ? payload.description?.trim() || null : module.description;
    module.icon = payload.icon !== undefined ? payload.icon?.trim() || null : module.icon;
    module.displayOrder = payload.displayOrder ?? module.displayOrder;
    module.status = payload.status ?? module.status;
    module.isSystem = payload.isSystem ?? module.isSystem;
    return this.moduleRepository.save(module);
  }

  async remove(moduleId: string): Promise<void> {
    const module = await this.findExisting(moduleId);
    const permissionCount = await this.moduleRepository.manager.query<Array<{ count: string }>>(
      `
        SELECT count(*)::int AS count
        FROM permissions
        WHERE module_id = $1
          AND deleted_at IS NULL
      `,
      [moduleId],
    );
    if (Number(permissionCount[0]?.count ?? 0) > 0) {
      throw new ConflictException('Module has active permissions.');
    }
    await this.moduleRepository.softRemove(module);
  }

  private async findExisting(moduleId: string): Promise<AppModuleOrmEntity> {
    const module = await this.moduleRepository.findOne({ where: { id: moduleId } });
    if (!module) {
      throw new NotFoundException('Module not found.');
    }
    return module;
  }

  private async assertCodeAvailable(code: string, excludeId?: string): Promise<void> {
    const existing = await this.moduleRepository.findOne({ where: { code: code.trim() } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('Module code already exists.');
    }
  }
}
