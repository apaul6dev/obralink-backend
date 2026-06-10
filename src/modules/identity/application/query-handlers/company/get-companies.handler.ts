import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Company } from '../../../domain/entities/company.entity';
import { COMPANY_REPOSITORY } from '../../../domain/repositories/repository-tokens';
import { CompanyRepository } from '../../../domain/repositories/company.repository.interface';
import { CompanyAccessPolicyService } from '../../../domain/services/company-access-policy.service';
import { GetCompaniesQuery } from '../../queries/company/get-companies.query';

@QueryHandler(GetCompaniesQuery)
export class GetCompaniesHandler implements IQueryHandler<GetCompaniesQuery> {
  constructor(
    @Inject(COMPANY_REPOSITORY) private readonly companyRepository: CompanyRepository,
    private readonly accessPolicy: CompanyAccessPolicyService,
  ) {}

  async execute(query: GetCompaniesQuery): Promise<Company[]> {
    this.accessPolicy.assertPlatformAccess(query.currentUser);
    return this.companyRepository.findAll();
  }
}
