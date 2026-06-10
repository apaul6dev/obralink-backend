import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Company } from '../../../domain/entities/company.entity';
import { COMPANY_REPOSITORY } from '../../../domain/repositories/repository-tokens';
import { CompanyRepository } from '../../../domain/repositories/company.repository.interface';
import { CompanyAccessPolicyService } from '../../../domain/services/company-access-policy.service';
import { ActivateCompanyCommand } from '../../commands/company/activate-company.command';

@CommandHandler(ActivateCompanyCommand)
export class ActivateCompanyHandler implements ICommandHandler<ActivateCompanyCommand> {
  private readonly logger = new Logger(ActivateCompanyHandler.name);

  constructor(
    @Inject(COMPANY_REPOSITORY) private readonly companyRepository: CompanyRepository,
    private readonly accessPolicy: CompanyAccessPolicyService,
  ) {}

  async execute(command: ActivateCompanyCommand): Promise<Company> {
    this.accessPolicy.assertPlatformAccess(command.currentUser);
    const company = await this.companyRepository.findById(command.companyId);
    if (!company) {
      throw new NotFoundException('Company not found.');
    }
    company.activate();
    const activatedCompany = await this.companyRepository.save(company);
    this.logger.log(`Company activated companyId=${activatedCompany.id} status=${activatedCompany.status}`);
    return activatedCompany;
  }
}
