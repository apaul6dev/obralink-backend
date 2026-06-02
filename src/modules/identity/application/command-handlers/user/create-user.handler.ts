import { ForbiddenException, Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { User } from '../../../domain/entities/user.entity';
import { Status } from '../../../domain/enums/status.enum';
import { UserType } from '../../../domain/enums/user-type.enum';
import { USER_REPOSITORY } from '../../../domain/repositories/repository-tokens';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { TenantAccessPolicyService } from '../../../domain/services/tenant-access-policy.service';
import { CreateUserCommand } from '../../commands/user/create-user.command';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  private readonly logger = new Logger(CreateUserHandler.name);

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly accessPolicy: TenantAccessPolicyService,
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const tenantId = command.payload.userType === UserType.GLOBAL_ADMIN
      ? null
      : this.accessPolicy.resolveTenantIdForTenantOperation(command.currentUser, command.payload.tenantId);

    if (command.currentUser.userType !== UserType.GLOBAL_ADMIN && command.payload.userType === UserType.GLOBAL_ADMIN) {
      throw new ForbiddenException('Tenant users cannot create platform users.');
    }

    const now = new Date();
    const passwordHash = await bcrypt.hash(command.payload.password, 12);
    const user = await this.userRepository.save(
      new User(
        randomUUID(),
        tenantId,
        command.payload.email.toLowerCase(),
        passwordHash,
        command.payload.firstName,
        command.payload.lastName,
        command.payload.userType,
        Status.ACTIVE,
        command.payload.identificationNumber ?? null,
        now,
        now,
      ),
    );
    this.logger.log(`User created userId=${user.id} tenantId=${user.tenantId ?? 'global'} userType=${user.userType} status=${user.status}`);
    return user;
  }
}
