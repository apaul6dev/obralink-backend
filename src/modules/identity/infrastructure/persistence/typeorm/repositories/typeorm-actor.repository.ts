import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Actor } from '../../../../domain/entities/actor.entity';
import { ActorRepository } from '../../../../domain/repositories/actor.repository.interface';
import { ActorRoleOrmEntity } from '../entities/actor-role.orm-entity';
import { ActorOrmEntity } from '../entities/actor.orm-entity';
import { ActorMapper } from './typeorm-mappers';

@Injectable()
export class TypeOrmActorRepository implements ActorRepository {
  constructor(
    @InjectRepository(ActorOrmEntity)
    private readonly repository: Repository<ActorOrmEntity>,
    @InjectRepository(ActorRoleOrmEntity)
    private readonly actorRoleRepository: Repository<ActorRoleOrmEntity>,
  ) {}

  async save(actor: Actor): Promise<Actor> {
    const saved = await this.repository.save(ActorMapper.toOrm(actor));
    return ActorMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Actor | null> {
    const actor = await this.repository.findOne({ where: { id } });
    return actor ? ActorMapper.toDomain(actor) : null;
  }

  async findByTenantId(tenantId: string): Promise<Actor[]> {
    const actors = await this.repository.find({ where: { tenantId }, order: { createdAt: 'DESC' } });
    return actors.map(ActorMapper.toDomain);
  }

  async findByRoleId(tenantId: string, roleId: string): Promise<Actor[]> {
    const rows = await this.actorRoleRepository.find({ where: { tenantId, roleId } });
    if (rows.length === 0) {
      return [];
    }
    const actors = await this.repository.find({ where: { tenantId, id: In(rows.map((row) => row.actorId)) } });
    return actors.map(ActorMapper.toDomain);
  }

  async assignRoles(actorId: string, tenantId: string, roleIds: string[]): Promise<void> {
    await this.actorRoleRepository.delete({ actorId, tenantId });
    if (roleIds.length === 0) {
      return;
    }
    await this.actorRoleRepository.insert(roleIds.map((roleId) => ({ actorId, tenantId, roleId })));
  }

  async removeRoles(actorId: string, tenantId: string, roleIds: string[]): Promise<void> {
    if (roleIds.length === 0) {
      return;
    }
    await this.actorRoleRepository.delete({ actorId, tenantId, roleId: In(roleIds) });
  }
}
