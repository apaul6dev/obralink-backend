import { ForbiddenException, Inject, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { User } from '../../../domain/entities/user.entity';
import { Status } from '../../../domain/enums/status.enum';
import { UserType } from '../../../domain/enums/user-type.enum';
import { USER_REPOSITORY } from '../../../domain/repositories/repository-tokens';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { CompanyAccessPolicyService } from '../../../domain/services/company-access-policy.service';
import { UpdateUserCommand } from '../../commands/user/update-user.command';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  private readonly logger = new Logger(UpdateUserHandler.name);

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly accessPolicy: CompanyAccessPolicyService,
    private readonly dataSource: DataSource,
  ) {}

  async execute(command: UpdateUserCommand): Promise<User> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    if (user.companyId) {
      this.accessPolicy.assertCompanyAccess(command.currentUser, user.companyId);
      this.accessPolicy.assertBranchAccess(command.currentUser, user.companyId, user.branchId);
    } else {
      this.accessPolicy.assertPlatformAccess(command.currentUser);
    }
    const requestedBranchId = command.payload.branchId !== undefined ? command.payload.branchId : user.branchId;
    const nextBranchId = this.resolveBranchId(command.currentUser, requestedBranchId ?? null);
    if (user.companyId) {
      await this.assertValidBranch(user.companyId, nextBranchId ?? null, user.userType);
    }
    user.firstName = command.payload.firstName ?? user.firstName;
    user.lastName = command.payload.lastName ?? user.lastName;
    user.branchId = nextBranchId ?? null;
    user.identificationNumber = command.payload.identificationNumber ?? user.identificationNumber;
    user.personalEmail = command.payload.personalEmail?.toLowerCase() ?? user.personalEmail;
    user.phoneNumber = command.payload.phoneNumber ?? user.phoneNumber;
    user.status = command.payload.status ?? user.status;
    const updatedUser = await this.userRepository.save(user);
    await this.dataSource.query(
      `
        UPDATE ba_user
        SET name = $2,
            branch_id = $3,
            updated_at = now()
        WHERE id = $1
      `,
      [updatedUser.id, `${updatedUser.firstName} ${updatedUser.lastName}`.trim(), updatedUser.branchId],
    );
    this.logger.log(`User updated userId=${updatedUser.id} companyId=${updatedUser.companyId ?? 'global'} status=${updatedUser.status}`);
    return updatedUser;
  }

  private resolveBranchId(currentUser: { userType: UserType; branchId: string | null }, requestedBranchId: string | null): string | null {
    if (currentUser.userType !== UserType.BRANCH_ADMIN) {
      return requestedBranchId;
    }
    if (!currentUser.branchId) {
      throw new ForbiddenException('Branch context is required.');
    }
    if (requestedBranchId && requestedBranchId !== currentUser.branchId) {
      throw new ForbiddenException('Cross-branch access is not allowed.');
    }
    return currentUser.branchId;
  }

  private async assertValidBranch(companyId: string, branchId: string | null, userType: UserType): Promise<void> {
    if ((userType === UserType.COMPANY_USER || userType === UserType.BRANCH_ADMIN) && !branchId) {
      throw new ForbiddenException('Branch is required for company users.');
    }
    if (!branchId) {
      return;
    }
    const rows = await this.dataSource.query<Array<{ id: string }>>(
      `
        SELECT id
        FROM company_branches
        WHERE id = $1
          AND company_id = $2
          AND status = $3
          AND deleted_at IS NULL
        LIMIT 1
      `,
      [branchId, companyId, Status.ACTIVE],
    );
    if (!rows[0]) {
      throw new NotFoundException('Branch not found in company.');
    }
  }
}
