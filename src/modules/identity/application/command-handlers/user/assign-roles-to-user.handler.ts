import { ForbiddenException, Inject, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ROLE_REPOSITORY, USER_REPOSITORY } from '../../../domain/repositories/repository-tokens';
import { RoleRepository } from '../../../domain/repositories/role.repository.interface';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { CompanyAccessPolicyService } from '../../../domain/services/company-access-policy.service';
import { UserType } from '../../../domain/enums/user-type.enum';
import { IdentityAuthSyncService } from '../../../infrastructure/security/identity-auth-sync.service';
import { AssignRolesToUserCommand } from '../../commands/user/assign-roles-to-user.command';

@CommandHandler(AssignRolesToUserCommand)
export class AssignRolesToUserHandler implements ICommandHandler<AssignRolesToUserCommand> {
  private readonly logger = new Logger(AssignRolesToUserHandler.name);

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: RoleRepository,
    private readonly accessPolicy: CompanyAccessPolicyService,
    private readonly identityAuthSync: IdentityAuthSyncService,
  ) {}

  async execute(command: AssignRolesToUserCommand): Promise<void> {
    const user = await this.userRepository.findById(command.userId);
    if (!user || !user.companyId) {
      throw new NotFoundException('Company user not found.');
    }
    this.accessPolicy.assertCompanyAccess(command.currentUser, user.companyId);
    this.accessPolicy.assertBranchAccess(command.currentUser, user.companyId, user.branchId);
    for (const roleId of command.roleIds) {
      if (!(await this.roleRepository.existsInCompany(roleId, user.companyId))) {
        throw new NotFoundException(`Role ${roleId} not found in company.`);
      }
      const role = await this.roleRepository.findById(roleId);
      if (command.currentUser.userType === UserType.BRANCH_ADMIN && role?.code === 'company.admin') {
        throw new ForbiddenException('Branch admins cannot assign company admin role.');
      }
    }
    await this.userRepository.assignRoles(user.id, user.companyId, command.roleIds);
    await this.identityAuthSync.syncUserPermissions(user.id);
    this.logger.log(`User roles assigned userId=${user.id} companyId=${user.companyId} roleCount=${command.roleIds.length}`);
  }
}
