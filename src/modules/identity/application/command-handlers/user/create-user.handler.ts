import { ForbiddenException, Inject, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { User } from '../../../domain/entities/user.entity';
import { Status } from '../../../domain/enums/status.enum';
import { UserType } from '../../../domain/enums/user-type.enum';
import { USER_REPOSITORY } from '../../../domain/repositories/repository-tokens';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { CompanyAccessPolicyService } from '../../../domain/services/company-access-policy.service';
import { IdentityAuthSyncService } from '../../../infrastructure/security/identity-auth-sync.service';
import { CreateUserCommand } from '../../commands/user/create-user.command';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  private readonly logger = new Logger(CreateUserHandler.name);

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly accessPolicy: CompanyAccessPolicyService,
    private readonly identityAuthSync: IdentityAuthSyncService,
    private readonly dataSource: DataSource,
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    if (command.currentUser.userType === UserType.SYSTEM_OWNER || command.payload.userType === UserType.SYSTEM_OWNER) {
      throw new ForbiddenException('Platform users cannot be created from company user management.');
    }
    if (command.currentUser.userType === UserType.BRANCH_ADMIN && command.payload.userType === UserType.COMPANY_ADMIN) {
      throw new ForbiddenException('Branch admins cannot create company admins.');
    }
    const companyId = this.accessPolicy.resolveCompanyIdForCompanyOperation(command.currentUser, command.payload.companyId);
    const branchId = this.resolveBranchId(command.currentUser, command.payload.branchId ?? null);
    await this.assertValidBranch(companyId, branchId, command.payload.userType);

    const now = new Date();
    const user = await this.userRepository.save(
      new User(
        randomUUID(),
        companyId,
        branchId,
        command.payload.email.toLowerCase(),
        command.payload.firstName,
        command.payload.lastName,
        command.payload.userType,
        Status.ACTIVE,
        command.payload.identificationNumber ?? null,
        command.payload.personalEmail?.toLowerCase() ?? null,
        command.payload.phoneNumber ?? null,
        now,
        now,
      ),
    );
    await this.identityAuthSync.provisionUser({
      id: user.id,
      email: user.email,
      password: command.payload.password,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      companyId: user.companyId,
      branchId: user.branchId,
    });
    this.logger.log(`User created userId=${user.id} companyId=${user.companyId ?? 'global'} userType=${user.userType} status=${user.status}`);
    return user;
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
