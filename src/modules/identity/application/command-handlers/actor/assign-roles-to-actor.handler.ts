import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ACTOR_REPOSITORY, ROLE_REPOSITORY } from '../../../domain/repositories/repository-tokens';
import { ActorRepository } from '../../../domain/repositories/actor.repository.interface';
import { RoleRepository } from '../../../domain/repositories/role.repository.interface';
import { TenantAccessPolicyService } from '../../../domain/services/tenant-access-policy.service';
import { AssignRolesToActorCommand } from '../../commands/actor/assign-roles-to-actor.command';

@CommandHandler(AssignRolesToActorCommand)
export class AssignRolesToActorHandler implements ICommandHandler<AssignRolesToActorCommand> {
  private readonly logger = new Logger(AssignRolesToActorHandler.name);

  constructor(
    @Inject(ACTOR_REPOSITORY) private readonly actorRepository: ActorRepository,
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: RoleRepository,
    private readonly accessPolicy: TenantAccessPolicyService,
  ) {}

  async execute(command: AssignRolesToActorCommand): Promise<void> {
    const actor = await this.actorRepository.findById(command.actorId);
    if (!actor) {
      throw new NotFoundException('Actor not found.');
    }
    this.accessPolicy.assertTenantAccess(command.currentUser, actor.tenantId);
    for (const roleId of command.roleIds) {
      if (!(await this.roleRepository.existsInTenant(roleId, actor.tenantId))) {
        throw new NotFoundException(`Role ${roleId} not found in tenant.`);
      }
    }
    await this.actorRepository.assignRoles(actor.id, actor.tenantId, command.roleIds);
    this.logger.log(`Actor roles assigned actorId=${actor.id} tenantId=${actor.tenantId} roleCount=${command.roleIds.length}`);
  }
}
