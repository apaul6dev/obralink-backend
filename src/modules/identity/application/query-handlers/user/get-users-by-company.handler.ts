import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { User } from '../../../domain/entities/user.entity';
import { USER_REPOSITORY } from '../../../domain/repositories/repository-tokens';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { CompanyAccessPolicyService } from '../../../domain/services/company-access-policy.service';
import { GetUsersByCompanyQuery } from '../../queries/user/get-users-by-company.query';

@QueryHandler(GetUsersByCompanyQuery)
export class GetUsersByCompanyHandler implements IQueryHandler<GetUsersByCompanyQuery> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly accessPolicy: CompanyAccessPolicyService,
  ) {}

  async execute(query: GetUsersByCompanyQuery): Promise<User[]> {
    const companyId = this.accessPolicy.resolveCompanyIdForCompanyOperation(query.currentUser, query.companyId);
    const branchId = this.accessPolicy.resolveBranchIdForCompanyRead(query.currentUser);
    return this.userRepository.findByCompanyId(companyId, branchId);
  }
}
