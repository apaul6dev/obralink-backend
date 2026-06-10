import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Company } from '../../../domain/entities/company.entity';
import { COMPANY_REPOSITORY } from '../../../domain/repositories/repository-tokens';
import { CompanyRepository } from '../../../domain/repositories/company.repository.interface';
import { CompanyAccessPolicyService } from '../../../domain/services/company-access-policy.service';
import { GetCompanyByIdQuery } from '../../queries/company/get-company-by-id.query';

@QueryHandler(GetCompanyByIdQuery)
export class GetCompanyByIdHandler implements IQueryHandler<GetCompanyByIdQuery> {
  constructor(
    @Inject(COMPANY_REPOSITORY) private readonly companyRepository: CompanyRepository,
    private readonly accessPolicy: CompanyAccessPolicyService,
  ) {}

  async execute(query: GetCompanyByIdQuery): Promise<Company> {
    this.accessPolicy.assertCompanyAccess(query.currentUser, query.companyId);
    const company = await this.companyRepository.findById(query.companyId);
    if (!company) {
      throw new NotFoundException('Company not found.');
    }
    return company;
  }
}
