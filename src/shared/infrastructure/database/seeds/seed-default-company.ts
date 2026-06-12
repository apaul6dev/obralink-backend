import 'dotenv/config';
import dataSource from '../typeorm-data-source';
import { Status } from '../../../../modules/identity/domain/enums/status.enum';
import { CompanyBranchOrmEntity } from '../../../../modules/identity/infrastructure/persistence/typeorm/entities/company-branch.orm-entity';
import { CompanyOrmEntity } from '../../../../modules/identity/infrastructure/persistence/typeorm/entities/company.orm-entity';

interface CompanySeed {
  name: string;
  legalName: string;
  taxId: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  customerType: string;
  industry: string;
  billingEmail: string;
  paymentTerms: string;
  customerStatus: 'LEAD' | 'CUSTOMER';
  assignedAccountManager: string;
  branches: BranchSeed[];
}

interface BranchSeed {
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
}

const companySeeds: CompanySeed[] = [
  {
    name: 'Obralink Norte',
    legalName: 'Obralink Norte S.A.',
    taxId: '1790010001001',
    contactName: 'Camila Torres',
    email: 'contacto.norte@obralink.local',
    phone: '+593 2 400 1001',
    address: 'Av. Amazonas N34-120',
    city: 'Quito',
    state: 'Pichincha',
    customerType: 'Constructora',
    industry: 'Construccion',
    billingEmail: 'facturacion.norte@obralink.local',
    paymentTerms: 'Net 30',
    customerStatus: 'CUSTOMER',
    assignedAccountManager: 'System Owner',
    branches: [
      { name: 'Quito Norte', code: 'UIO-NORTE', address: 'Av. Amazonas N34-120', city: 'Quito', state: 'Pichincha', phone: '+593 2 400 1101', email: 'quito.norte@obralink.local' },
      { name: 'Quito Valle', code: 'UIO-VALLE', address: 'Av. Interoceanica Km 12', city: 'Quito', state: 'Pichincha', phone: '+593 2 400 1102', email: 'quito.valle@obralink.local' },
    ],
  },
  {
    name: 'Obralink Costa',
    legalName: 'Obralink Costa S.A.',
    taxId: '0990010002001',
    contactName: 'Daniela Vera',
    email: 'contacto.costa@obralink.local',
    phone: '+593 4 400 2002',
    address: 'Av. Francisco de Orellana 210',
    city: 'Guayaquil',
    state: 'Guayas',
    customerType: 'Contratista general',
    industry: 'Infraestructura',
    billingEmail: 'facturacion.costa@obralink.local',
    paymentTerms: 'Net 15',
    customerStatus: 'CUSTOMER',
    assignedAccountManager: 'System Owner',
    branches: [
      { name: 'Guayaquil Centro', code: 'GYE-CENTRO', address: 'Malecon 1401', city: 'Guayaquil', state: 'Guayas', phone: '+593 4 400 2201', email: 'guayaquil.centro@obralink.local' },
      { name: 'Samborondon', code: 'GYE-SAMBORONDON', address: 'Av. Samborondon Km 4', city: 'Samborondon', state: 'Guayas', phone: '+593 4 400 2202', email: 'samborondon@obralink.local' },
    ],
  },
  {
    name: 'Obralink Austro',
    legalName: 'Obralink Austro S.A.',
    taxId: '0190010003001',
    contactName: 'Mateo Salazar',
    email: 'contacto.austro@obralink.local',
    phone: '+593 7 400 3003',
    address: 'Av. Solano 5-45',
    city: 'Cuenca',
    state: 'Azuay',
    customerType: 'Desarrollador inmobiliario',
    industry: 'Edificacion',
    billingEmail: 'facturacion.austro@obralink.local',
    paymentTerms: 'Net 30',
    customerStatus: 'LEAD',
    assignedAccountManager: 'System Owner',
    branches: [
      { name: 'Cuenca Centro', code: 'CUE-CENTRO', address: 'Av. Solano 5-45', city: 'Cuenca', state: 'Azuay', phone: '+593 7 400 3301', email: 'cuenca.centro@obralink.local' },
      { name: 'Cuenca Industrial', code: 'CUE-INDUSTRIAL', address: 'Parque Industrial Calle 2', city: 'Cuenca', state: 'Azuay', phone: '+593 7 400 3302', email: 'cuenca.industrial@obralink.local' },
    ],
  },
];

const legacyCompanyTaxIds = ['12-3456789'];

async function seedDefaultCompany(): Promise<void> {
  await dataSource.initialize();

  const companies = dataSource.getRepository(CompanyOrmEntity);
  const branches = dataSource.getRepository(CompanyBranchOrmEntity);
  await companies
    .createQueryBuilder()
    .update(CompanyOrmEntity)
    .set({ deletedAt: () => 'now()', status: Status.INACTIVE })
    .where('tax_id IN (:...taxIds)', { taxIds: legacyCompanyTaxIds })
    .execute();

  for (const seed of companySeeds) {
    let company = await companies.findOne({
      where: { taxId: seed.taxId },
      withDeleted: true,
    });

    if (!company) {
      company = companies.create({ taxId: seed.taxId });
    }

    company.name = seed.name;
    company.legalName = seed.legalName;
    company.contactName = seed.contactName;
    company.email = seed.email;
    company.phone = seed.phone;
    company.address = seed.address;
    company.city = seed.city;
    company.state = seed.state;
    company.customerType = seed.customerType;
    company.industry = seed.industry;
    company.billingEmail = seed.billingEmail;
    company.paymentTerms = seed.paymentTerms;
    company.customerStatus = seed.customerStatus;
    company.assignedAccountManager = seed.assignedAccountManager;
    company.status = Status.ACTIVE;
    company.deletedAt = null;

    const saved = await companies.save(company);
    for (const branchSeed of seed.branches) {
      let branch = await branches.findOne({
        where: { companyId: saved.id, code: branchSeed.code },
        withDeleted: true,
      });
      if (!branch) {
        branch = branches.create({ companyId: saved.id, code: branchSeed.code });
      }
      branch.name = branchSeed.name;
      branch.address = branchSeed.address;
      branch.city = branchSeed.city;
      branch.state = branchSeed.state;
      branch.phone = branchSeed.phone;
      branch.email = branchSeed.email;
      branch.status = Status.ACTIVE;
      branch.deletedAt = null;
      await branches.save(branch);
    }
    await upsertBetterAuthOrganization(saved);
    console.log(`Default company seeded: ${saved.name} (${saved.id})`);
  }
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
