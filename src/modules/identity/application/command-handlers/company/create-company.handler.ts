import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { Company } from '../../../domain/entities/company.entity';
import { Status } from '../../../domain/enums/status.enum';
import { COMPANY_REPOSITORY } from '../../../domain/repositories/repository-tokens';
import { CompanyRepository } from '../../../domain/repositories/company.repository.interface';
import { CompanyAccessPolicyService } from '../../../domain/services/company-access-policy.service';
import { IdentityAuthSyncService } from '../../../infrastructure/security/identity-auth-sync.service';
import { CreateCompanyCommand } from '../../commands/company/create-company.command';

@CommandHandler(CreateCompanyCommand)
export class CreateCompanyHandler implements ICommandHandler<CreateCompanyCommand> {
  private readonly logger = new Logger(CreateCompanyHandler.name);

  constructor(
    @Inject(COMPANY_REPOSITORY) private readonly companyRepository: CompanyRepository,
    private readonly accessPolicy: CompanyAccessPolicyService,
    private readonly identityAuthSync: IdentityAuthSyncService,
    private readonly dataSource: DataSource,
  ) {}

  async execute(command: CreateCompanyCommand): Promise<Company> {
    this.accessPolicy.assertPlatformAccess(command.currentUser);
    const now = new Date();
    const company = await this.companyRepository.save(
      new Company(
        randomUUID(),
        command.payload.name,
        command.payload.legalName ?? null,
        command.payload.taxId ?? null,
        command.payload.contactName ?? null,
        command.payload.email ?? null,
        command.payload.phone ?? null,
        command.payload.address ?? null,
        command.payload.city ?? null,
        command.payload.state ?? null,
        command.payload.customerType ?? null,
        command.payload.industry ?? null,
        command.payload.billingEmail ?? null,
        command.payload.paymentTerms ?? null,
        command.payload.customerStatus ?? 'LEAD',
        command.payload.assignedAccountManager ?? null,
        Status.INACTIVE,
        now,
        now,
      ),
    );
    await this.identityAuthSync.provisionOrganization({
      id: company.id,
      name: company.name,
      slug: company.taxId,
    });
    await this.provisionCompanyRoles(company.id);
    this.logger.log(`Company created companyId=${company.id} status=${company.status}`);
    return company;
  }

  private async provisionCompanyRoles(companyId: string): Promise<void> {
    const globalRoles = await this.dataSource.query<Array<{ id: string; name: string; code: string; status: string }>>(
      `
        SELECT id, name, code, status
        FROM roles
        WHERE company_id IS NULL
          AND deleted_at IS NULL
        ORDER BY code
      `,
    );

    for (const globalRole of globalRoles) {
      const existing = await this.dataSource.query<Array<{ id: string }>>(
        `
          SELECT id
          FROM roles
          WHERE company_id = $1
            AND code = $2
            AND deleted_at IS NULL
          LIMIT 1
        `,
        [companyId, globalRole.code],
      );

      const roleId = existing[0]?.id ?? randomUUID();
      if (existing.length === 0) {
        await this.dataSource.query(
          `
            INSERT INTO roles (id, company_id, name, code, status, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, now(), now())
          `,
          [roleId, companyId, globalRole.name, globalRole.code, globalRole.status],
        );
      }

      await this.dataSource.query(
        `
          INSERT INTO role_permissions (role_id, permission_id, company_id)
          SELECT $1, permission_id, $2
          FROM role_permissions
          WHERE role_id = $3
          ON CONFLICT (role_id, permission_id, company_id) DO NOTHING
        `,
        [roleId, companyId, globalRole.id],
      );
    }
  }
}
