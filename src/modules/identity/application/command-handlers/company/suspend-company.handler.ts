import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Company } from '../../../domain/entities/company.entity';
import { COMPANY_REPOSITORY } from '../../../domain/repositories/repository-tokens';
import { CompanyRepository } from '../../../domain/repositories/company.repository.interface';
import { CompanyAccessPolicyService } from '../../../domain/services/company-access-policy.service';
import { SuspendCompanyCommand } from '../../commands/company/suspend-company.command';

@CommandHandler(SuspendCompanyCommand)
export class SuspendCompanyHandler implements ICommandHandler<SuspendCompanyCommand> {
  private readonly logger = new Logger(SuspendCompanyHandler.name);

  constructor(
    @Inject(COMPANY_REPOSITORY) private readonly companyRepository: CompanyRepository,
    private readonly accessPolicy: CompanyAccessPolicyService,
  ) {}

  async execute(command: SuspendCompanyCommand): Promise<Company> {
    this.accessPolicy.assertPlatformAccess(command.currentUser);
    const company = await this.companyRepository.findById(command.companyId);
    if (!company) {
      throw new NotFoundException('Company not found.');
    }
    company.suspend();
    const suspendedCompany = await this.companyRepository.save(company);
    this.logger.log(`Company suspended companyId=${suspendedCompany.id} status=${suspendedCompany.status}`);
    return suspendedCompany;
  }
}
