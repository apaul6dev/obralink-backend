import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Actor } from '../../../domain/entities/actor.entity';
import { ACTOR_REPOSITORY } from '../../../domain/repositories/repository-tokens';
import { ActorRepository } from '../../../domain/repositories/actor.repository.interface';
import { TenantAccessPolicyService } from '../../../domain/services/tenant-access-policy.service';
import { UpdateActorCommand } from '../../commands/actor/update-actor.command';

@CommandHandler(UpdateActorCommand)
export class UpdateActorHandler implements ICommandHandler<UpdateActorCommand> {
  private readonly logger = new Logger(UpdateActorHandler.name);

  constructor(
    @Inject(ACTOR_REPOSITORY) private readonly actorRepository: ActorRepository,
    private readonly accessPolicy: TenantAccessPolicyService,
  ) {}

  async execute(command: UpdateActorCommand): Promise<Actor> {
    const actor = await this.actorRepository.findById(command.actorId);
    if (!actor) {
      throw new NotFoundException('Actor not found.');
    }
    this.accessPolicy.assertTenantAccess(command.currentUser, actor.tenantId);
    actor.type = command.payload.type ?? actor.type;
    actor.name = command.payload.name ?? actor.name;
    actor.email = command.payload.email?.toLowerCase() ?? actor.email;
    actor.identificationNumber = command.payload.identificationNumber ?? actor.identificationNumber;
    actor.phone = command.payload.phone ?? actor.phone;
    actor.status = command.payload.status ?? actor.status;
    const updatedActor = await this.actorRepository.save(actor);
    this.logger.log(`Actor updated actorId=${updatedActor.id} tenantId=${updatedActor.tenantId} status=${updatedActor.status}`);
    return updatedActor;
  }
}
