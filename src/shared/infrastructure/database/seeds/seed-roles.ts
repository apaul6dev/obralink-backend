import 'dotenv/config';
import dataSource from '../typeorm-data-source';
import { Status } from '../../../../modules/identity/domain/enums/status.enum';
import { PermissionOrmEntity } from '../../../../modules/identity/infrastructure/persistence/typeorm/entities/permission.orm-entity';
import { RolePermissionOrmEntity } from '../../../../modules/identity/infrastructure/persistence/typeorm/entities/role-permission.orm-entity';
import { RoleOrmEntity } from '../../../../modules/identity/infrastructure/persistence/typeorm/entities/role.orm-entity';
import { CompanyOrmEntity } from '../../../../modules/identity/infrastructure/persistence/typeorm/entities/company.orm-entity';

interface PermissionSeed {
  code: string;
  description: string;
}

interface RoleSeed {
  code: string;
  name: string;
  permissions: string[];
}

const apiPermissions: PermissionSeed[] = [
  { code: 'identity.users.create', description: 'Create users.' },
  { code: 'identity.users.read', description: 'Read users.' },
  { code: 'identity.users.update', description: 'Update users.' },
  { code: 'identity.users.roles.assign', description: 'Assign roles to users.' },
  { code: 'identity.roles.read', description: 'Read roles.' },
];

const uiPermissions: PermissionSeed[] = [
  { code: 'ui.dashboard.view', description: 'View dashboard screen.' },
  { code: 'ui.companies.view', description: 'View companies screen.' },
  { code: 'ui.companies.create', description: 'Show create company action.' },
  { code: 'ui.companies.update', description: 'Show update company action.' },
  { code: 'ui.companies.activate', description: 'Show activate company action.' },
  { code: 'ui.companies.suspend', description: 'Show suspend company action.' },
  { code: 'ui.users.view', description: 'View users screen.' },
  { code: 'ui.users.create', description: 'Show create user action.' },
  { code: 'ui.users.update', description: 'Show update user action.' },
  { code: 'ui.users.assign_roles', description: 'Show assign user roles action.' },
  { code: 'ui.roles.view', description: 'View roles screen.' },
  { code: 'ui.profile.view', description: 'View profile screen.' },
  { code: 'ui.sessions.view', description: 'View active sessions screen.' },
];

const permissions: PermissionSeed[] = [...apiPermissions, ...uiPermissions];

const sharedCompanyUiPermissions = [
  'ui.dashboard.view',
  'ui.profile.view',
  'ui.sessions.view',
];

const companyRoles: RoleSeed[] = [
  {
    code: 'company.admin',
    name: 'Company Admin',
    permissions: [
      ...apiPermissions.map((permission) => permission.code),
      ...sharedCompanyUiPermissions,
      'ui.users.view',
      'ui.users.create',
      'ui.users.update',
      'ui.users.assign_roles',
      'ui.roles.view',
    ],
  },
  {
    code: 'company.user',
    name: 'Company User',
    permissions: [
      'identity.roles.read',
      ...sharedCompanyUiPermissions,
      'ui.roles.view',
    ],
  },
  {
    code: 'sales.representative',
    name: 'Sales Representative',
    permissions: [
      'identity.roles.read',
      ...sharedCompanyUiPermissions,
      'ui.roles.view',
    ],
  },
  {
    code: 'engineer.technician',
    name: 'Engineer Technician',
    permissions: [
      'identity.roles.read',
      ...sharedCompanyUiPermissions,
      'ui.roles.view',
    ],
  },
  {
    code: 'accounting.finance',
    name: 'Accounting Finance',
    permissions: [
      'identity.roles.read',
      ...sharedCompanyUiPermissions,
      'ui.roles.view',
    ],
  },
  {
    code: 'management',
    name: 'Management',
    permissions: [
      'identity.roles.read',
      'identity.users.read',
      ...sharedCompanyUiPermissions,
      'ui.users.view',
      'ui.roles.view',
    ],
  },
];

async function upsertPermissions(): Promise<Map<string, PermissionOrmEntity>> {
  const permissionRepository = dataSource.getRepository(PermissionOrmEntity);
  const permissionByCode = new Map<string, PermissionOrmEntity>();

  for (const seed of permissions) {
    let permission = await permissionRepository.findOne({
      where: { code: seed.code },
      withDeleted: true,
    });

    if (permission) {
      permission.description = seed.description;
      permission.deletedAt = null;
    } else {
      permission = permissionRepository.create(seed);
    }

    const saved = await permissionRepository.save(permission);
    permissionByCode.set(saved.code, saved);
  }

  return permissionByCode;
}

async function upsertRole(seed: RoleSeed, companyId: string | null): Promise<RoleOrmEntity> {
  const roleRepository = dataSource.getRepository(RoleOrmEntity);
  const role = await roleRepository
    .createQueryBuilder('role')
    .withDeleted()
    .where('role.code = :code', { code: seed.code })
    .andWhere(companyId ? 'role.company_id = :companyId' : 'role.company_id IS NULL', { companyId })
    .getOne();

  if (role) {
    role.name = seed.name;
    role.status = Status.ACTIVE;
    role.deletedAt = null;
    return roleRepository.save(role);
  }

  return roleRepository.save(
    roleRepository.create({
      companyId,
      name: seed.name,
      code: seed.code,
      status: Status.ACTIVE,
    }),
  );
}

async function syncRolePermissions(role: RoleOrmEntity, seed: RoleSeed, permissionByCode: Map<string, PermissionOrmEntity>): Promise<void> {
  const rolePermissionRepository = dataSource.getRepository(RolePermissionOrmEntity);

  for (const permissionCode of seed.permissions) {
    const permission = permissionByCode.get(permissionCode);
    if (!permission) {
      throw new Error(`Permission seed is missing: ${permissionCode}`);
    }

    const exists = await rolePermissionRepository
      .createQueryBuilder('rolePermission')
      .where('rolePermission.role_id = :roleId', { roleId: role.id })
      .andWhere('rolePermission.permission_id = :permissionId', { permissionId: permission.id })
      .andWhere(role.companyId ? 'rolePermission.company_id = :companyId' : 'rolePermission.company_id IS NULL', { companyId: role.companyId })
      .getExists();

    if (!exists) {
      await rolePermissionRepository.insert({
        roleId: role.id,
        permissionId: permission.id,
        companyId: role.companyId,
      });
    }
  }
}

async function seedRoleSet(companyId: string | null, permissionByCode: Map<string, PermissionOrmEntity>): Promise<void> {
  for (const roleSeed of companyRoles) {
    const role = await upsertRole(roleSeed, companyId);
    await syncRolePermissions(role, roleSeed, permissionByCode);
  }
}

async function seedRoles(): Promise<void> {
  await dataSource.initialize();

  const permissionByCode = await upsertPermissions();
  await seedRoleSet(null, permissionByCode);

  const companies = await dataSource.getRepository(CompanyOrmEntity).find({
    order: { createdAt: 'ASC' },
  });

  for (const company of companies) {
    await seedRoleSet(company.id, permissionByCode);
  }

  console.log(`Permissions seeded: ${permissionByCode.size}`);
  console.log(`Global role templates seeded: ${companyRoles.length}`);
  console.log(`Company role sets seeded: ${companies.length}`);
}

seedRoles()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Role seed failed: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });
