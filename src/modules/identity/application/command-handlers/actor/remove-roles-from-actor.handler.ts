import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ACTOR_REPOSITORY } from '../../../domain/repositories/repository-tokens';
import { ActorRepository } from '../../../domain/repositories/actor.repository.interface';
import { TenantAccessPolicyService } from '../../../domain/services/tenant-access-policy.service';
import { RemoveRolesFromActorCommand } from '../../commands/actor/remove-roles-from-actor.command';

@CommandHandler(RemoveRolesFromActorCommand)
export class RemoveRolesFromActorHandler implements ICommandHandler<RemoveRolesFromActorCommand> {
  private readonly logger = new Logger(RemoveRolesFromActorHandler.name);

  constructor(
    @Inject(ACTOR_REPOSITORY) private readonly actorRepository: ActorRepository,
    private readonly accessPolicy: TenantAccessPolicyService,
  ) {}

  async execute(command: RemoveRolesFromActorCommand): Promise<void> {
    const actor = await this.actorRepository.findById(command.actorId);
    if (!actor) {
      throw new NotFoundException('Actor not found.');
    }
    this.accessPolicy.assertTenantAccess(command.currentUser, actor.tenantId);
    await this.actorRepository.removeRoles(actor.id, actor.tenantId, command.roleIds);
    this.logger.log(`Actor roles removed actorId=${actor.id} tenantId=${actor.tenantId} roleCount=${command.roleIds.length}`);
  }
}
