import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { COMPANY_REPOSITORY } from '../../../domain/repositories/repository-tokens';
import { CompanyRepository } from '../../../domain/repositories/company.repository.interface';
import { CompanyAccessPolicyService } from '../../../domain/services/company-access-policy.service';
import { UpdateCompanyCommand } from '../../commands/company/update-company.command';
import { Company } from '../../../domain/entities/company.entity';

@CommandHandler(UpdateCompanyCommand)
export class UpdateCompanyHandler implements ICommandHandler<UpdateCompanyCommand> {
  private readonly logger = new Logger(UpdateCompanyHandler.name);

  constructor(
    @Inject(COMPANY_REPOSITORY) private readonly companyRepository: CompanyRepository,
    private readonly accessPolicy: CompanyAccessPolicyService,
  ) {}

  async execute(command: UpdateCompanyCommand): Promise<Company> {
    this.accessPolicy.assertPlatformAccess(command.currentUser);
    const company = await this.companyRepository.findById(command.companyId);
    if (!company) {
      throw new NotFoundException('Company not found.');
    }
    company.name = command.payload.name ?? company.name;
    company.legalName = command.payload.legalName ?? company.legalName;
    company.taxId = command.payload.taxId ?? company.taxId;
    company.contactName = command.payload.contactName ?? company.contactName;
    company.email = command.payload.email ?? company.email;
    company.phone = command.payload.phone ?? company.phone;
    company.address = command.payload.address ?? company.address;
    company.city = command.payload.city ?? company.city;
    company.state = command.payload.state ?? company.state;
    company.customerType = command.payload.customerType ?? company.customerType;
    company.industry = command.payload.industry ?? company.industry;
    company.billingEmail = command.payload.billingEmail ?? company.billingEmail;
    company.paymentTerms = command.payload.paymentTerms ?? company.paymentTerms;
    company.customerStatus = command.payload.customerStatus ?? company.customerStatus;
    company.assignedAccountManager = command.payload.assignedAccountManager ?? company.assignedAccountManager;
    const updatedCompany = await this.companyRepository.save(company);
    this.logger.log(`Company updated companyId=${updatedCompany.id} status=${updatedCompany.status}`);
    return updatedCompany;
  }
}
