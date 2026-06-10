import { ForbiddenException, Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
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
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    if (command.currentUser.userType === UserType.SYSTEM_OWNER || command.payload.userType === UserType.SYSTEM_OWNER) {
      throw new ForbiddenException('Platform users cannot be created from company user management.');
    }
    const companyId = this.accessPolicy.resolveCompanyIdForCompanyOperation(command.currentUser, command.payload.companyId);

    const now = new Date();
    const user = await this.userRepository.save(
      new User(
        randomUUID(),
        companyId,
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
    });
    this.logger.log(`User created userId=${user.id} companyId=${user.companyId ?? 'global'} userType=${user.userType} status=${user.status}`);
    return user;
  }
}
