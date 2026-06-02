import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthEvent } from '../../../../domain/entities/auth-event.entity';
import { AuthEventRepository } from '../../../../domain/repositories/auth-event.repository.interface';
import { AuthEventOrmEntity } from '../entities/auth-event.orm-entity';
import { AuthEventMapper } from './typeorm-mappers';

@Injectable()
export class TypeOrmAuthEventRepository implements AuthEventRepository {
  constructor(
    @InjectRepository(AuthEventOrmEntity)
    private readonly authEvents: Repository<AuthEventOrmEntity>,
  ) {}

  async save(event: AuthEvent): Promise<void> {
    await this.authEvents.save(AuthEventMapper.toOrm(event));
  }
}
