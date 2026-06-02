import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ROLE_REPOSITORY, USER_REPOSITORY } from '../../../domain/repositories/repository-tokens';
import { RoleRepository } from '../../../domain/repositories/role.repository.interface';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { TenantAccessPolicyService } from '../../../domain/services/tenant-access-policy.service';
import { AssignRolesToUserCommand } from '../../commands/user/assign-roles-to-user.command';

@CommandHandler(AssignRolesToUserCommand)
export class AssignRolesToUserHandler implements ICommandHandler<AssignRolesToUserCommand> {
  private readonly logger = new Logger(AssignRolesToUserHandler.name);

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: RoleRepository,
    private readonly accessPolicy: TenantAccessPolicyService,
  ) {}

  async execute(command: AssignRolesToUserCommand): Promise<void> {
    const user = await this.userRepository.findById(command.userId);
    if (!user || !user.tenantId) {
      throw new NotFoundException('Tenant user not found.');
    }
    this.accessPolicy.assertTenantAccess(command.currentUser, user.tenantId);
    for (const roleId of command.roleIds) {
      if (!(await this.roleRepository.existsInTenant(roleId, user.tenantId))) {
        throw new NotFoundException(`Role ${roleId} not found in tenant.`);
      }
    }
    await this.userRepository.assignRoles(user.id, user.tenantId, command.roleIds);
    this.logger.log(`User roles assigned userId=${user.id} tenantId=${user.tenantId} roleCount=${command.roleIds.length}`);
  }
}
