import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { User } from '../../../domain/entities/user.entity';
import { USER_REPOSITORY } from '../../../domain/repositories/repository-tokens';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { CompanyAccessPolicyService } from '../../../domain/services/company-access-policy.service';
import { GetUserByIdQuery } from '../../queries/user/get-user-by-id.query';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly accessPolicy: CompanyAccessPolicyService,
  ) {}

  async execute(query: GetUserByIdQuery): Promise<User> {
    const user = await this.userRepository.findById(query.userId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    if (user.companyId) {
      this.accessPolicy.assertCompanyAccess(query.currentUser, user.companyId);
      this.accessPolicy.assertBranchAccess(query.currentUser, user.companyId, user.branchId);
    } else {
      this.accessPolicy.assertPlatformAccess(query.currentUser);
    }
    return user;
  }
}
