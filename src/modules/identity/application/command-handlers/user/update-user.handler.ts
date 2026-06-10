import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { User } from '../../../domain/entities/user.entity';
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
  ) {}

  async execute(command: UpdateUserCommand): Promise<User> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    if (user.companyId) {
      this.accessPolicy.assertCompanyAccess(command.currentUser, user.companyId);
    } else {
      this.accessPolicy.assertPlatformAccess(command.currentUser);
    }
    user.firstName = command.payload.firstName ?? user.firstName;
    user.lastName = command.payload.lastName ?? user.lastName;
    user.identificationNumber = command.payload.identificationNumber ?? user.identificationNumber;
    user.personalEmail = command.payload.personalEmail?.toLowerCase() ?? user.personalEmail;
    user.phoneNumber = command.payload.phoneNumber ?? user.phoneNumber;
    user.status = command.payload.status ?? user.status;
    const updatedUser = await this.userRepository.save(user);
    this.logger.log(`User updated userId=${updatedUser.id} companyId=${updatedUser.companyId ?? 'global'} status=${updatedUser.status}`);
    return updatedUser;
  }
}
