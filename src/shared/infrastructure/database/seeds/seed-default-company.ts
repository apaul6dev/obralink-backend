import 'dotenv/config';
import dataSource from '../typeorm-data-source';
import { Status } from '../../../../modules/identity/domain/enums/status.enum';
import { CompanyOrmEntity } from '../../../../modules/identity/infrastructure/persistence/typeorm/entities/company.orm-entity';

function requiredEnv(name: string, fallback: string): string {
  const value = process.env[name]?.trim() || fallback;
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

function optionalEnv(name: string): string | null {
  return process.env[name]?.trim() || null;
}

async function seedDefaultCompany(): Promise<void> {
  await dataSource.initialize();

  const name = requiredEnv('DEFAULT_COMPANY_NAME', 'Obralink Demo Company');
  const taxId = requiredEnv('DEFAULT_COMPANY_TAX_ID', '12-3456789');
  const legalName = optionalEnv('DEFAULT_COMPANY_LEGAL_NAME') ?? name;

  const companies = dataSource.getRepository(CompanyOrmEntity);
  let company = await companies.findOne({
    where: { taxId },
    withDeleted: true,
  });

  if (!company) {
    company = companies.create({ taxId });
  }

  company.name = name;
  company.legalName = legalName;
  company.contactName = optionalEnv('DEFAULT_COMPANY_CONTACT_NAME');
  company.email = optionalEnv('DEFAULT_COMPANY_EMAIL');
  company.phone = optionalEnv('DEFAULT_COMPANY_PHONE');
  company.address = optionalEnv('DEFAULT_COMPANY_ADDRESS');
  company.city = optionalEnv('DEFAULT_COMPANY_CITY');
  company.state = optionalEnv('DEFAULT_COMPANY_STATE');
  company.customerType = optionalEnv('DEFAULT_COMPANY_CUSTOMER_TYPE');
  company.industry = optionalEnv('DEFAULT_COMPANY_INDUSTRY');
  company.billingEmail = optionalEnv('DEFAULT_COMPANY_BILLING_EMAIL');
  company.paymentTerms = optionalEnv('DEFAULT_COMPANY_PAYMENT_TERMS');
  company.customerStatus = process.env.DEFAULT_COMPANY_CUSTOMER_STATUS?.trim() || 'CUSTOMER';
  company.assignedAccountManager = optionalEnv('DEFAULT_COMPANY_ACCOUNT_MANAGER');
  company.status = Status.ACTIVE;
  company.deletedAt = null;

  const saved = await companies.save(company);
  await upsertBetterAuthOrganization(saved);
  console.log(`Default company seeded: ${saved.name} (${saved.id})`);
}

async function upsertBetterAuthOrganization(company: CompanyOrmEntity): Promise<void> {
  await dataSource.query(
    `
      INSERT INTO ba_organization (id, name, slug, created_at, updated_at)
      VALUES ($1, $2, $3, now(), now())
      ON CONFLICT (id) DO UPDATE
      SET name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          updated_at = now()
    `,
    [company.id, company.name, toSlug(company.taxId || company.name, company.id)],
  );
}

function toSlug(value: string, id: string): string {
  const slug = value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);

  return `${slug || 'company'}-${id.slice(0, 8)}`;
}

seedDefaultCompany()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Default company seed failed: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });
