import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { Actor } from '../../../domain/entities/actor.entity';
import { Status } from '../../../domain/enums/status.enum';
import { ACTOR_REPOSITORY } from '../../../domain/repositories/repository-tokens';
import { ActorRepository } from '../../../domain/repositories/actor.repository.interface';
import { TenantAccessPolicyService } from '../../../domain/services/tenant-access-policy.service';
import { CreateActorCommand } from '../../commands/actor/create-actor.command';

@CommandHandler(CreateActorCommand)
export class CreateActorHandler implements ICommandHandler<CreateActorCommand> {
  private readonly logger = new Logger(CreateActorHandler.name);

  constructor(
    @Inject(ACTOR_REPOSITORY) private readonly actorRepository: ActorRepository,
    private readonly accessPolicy: TenantAccessPolicyService,
  ) {}

  async execute(command: CreateActorCommand): Promise<Actor> {
    const tenantId = this.accessPolicy.resolveTenantIdForTenantOperation(command.currentUser);
    const now = new Date();
    const actor = await this.actorRepository.save(
      new Actor(
        randomUUID(),
        tenantId,
        command.payload.type,
        command.payload.name,
        command.payload.email?.toLowerCase() ?? null,
        command.payload.identificationNumber ?? null,
        command.payload.phone ?? null,
        Status.ACTIVE,
        now,
        now,
      ),
    );
    this.logger.log(`Actor created actorId=${actor.id} tenantId=${actor.tenantId} type=${actor.type} status=${actor.status}`);
    return actor;
  }
}
