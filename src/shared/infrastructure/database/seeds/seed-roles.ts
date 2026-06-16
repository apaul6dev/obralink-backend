import 'dotenv/config';
import { hashPassword } from 'better-auth/crypto';
import dataSource from '../typeorm-data-source';
import { Status } from '../../../../modules/identity/domain/enums/status.enum';
import { UserType } from '../../../../modules/identity/domain/enums/user-type.enum';
import { AppModuleOrmEntity } from '../../../../modules/identity/infrastructure/persistence/typeorm/entities/app-module.orm-entity';
import { PermissionOrmEntity } from '../../../../modules/identity/infrastructure/persistence/typeorm/entities/permission.orm-entity';
import { RolePermissionOrmEntity } from '../../../../modules/identity/infrastructure/persistence/typeorm/entities/role-permission.orm-entity';
import { RoleOrmEntity } from '../../../../modules/identity/infrastructure/persistence/typeorm/entities/role.orm-entity';
import { CompanyBranchOrmEntity } from '../../../../modules/identity/infrastructure/persistence/typeorm/entities/company-branch.orm-entity';
import { CompanyOrmEntity } from '../../../../modules/identity/infrastructure/persistence/typeorm/entities/company.orm-entity';
import { UserOrmEntity } from '../../../../modules/identity/infrastructure/persistence/typeorm/entities/user.orm-entity';
import { UserRoleOrmEntity } from '../../../../modules/identity/infrastructure/persistence/typeorm/entities/user-role.orm-entity';

interface PermissionSeed {
  code: string;
  description: string;
  category: 'API' | 'UI';
  moduleCode: string;
  action: string;
  label: string;
  isSystem: boolean;
}

interface AppModuleSeed {
  code: string;
  name: string;
  description: string;
  icon: string;
  displayOrder: number;
}

interface RoleSeed {
  code: string;
  name: string;
  permissions: string[];
}

const appModules: AppModuleSeed[] = [
  { code: 'dashboard', name: 'Dashboard', description: 'General landing and summary screens.', icon: 'dashboard', displayOrder: 10 },
  { code: 'companies', name: 'Companies', description: 'Platform company administration.', icon: 'business', displayOrder: 20 },
  { code: 'branches', name: 'Branches', description: 'Company branch administration.', icon: 'account_tree', displayOrder: 30 },
  { code: 'users', name: 'Users', description: 'User and access administration.', icon: 'group', displayOrder: 40 },
  { code: 'roles', name: 'Roles', description: 'Role administration and permission assignment.', icon: 'verified_user', displayOrder: 50 },
  { code: 'modules', name: 'Modules', description: 'Application module catalog administration.', icon: 'view_module', displayOrder: 60 },
  { code: 'permissions', name: 'Permissions', description: 'Permission catalog administration.', icon: 'key', displayOrder: 70 },
  { code: 'menu', name: 'Menu', description: 'Navigation menu administration.', icon: 'menu_open', displayOrder: 80 },
  { code: 'profile', name: 'Profile', description: 'User profile screens.', icon: 'person', displayOrder: 80 },
  { code: 'sessions', name: 'Sessions', description: 'Active session screens.', icon: 'devices', displayOrder: 90 },
];

function apiPermission(moduleCode: string, action: string, label: string, description = `${label}.`): PermissionSeed {
  return {
    code: `identity.${moduleCode}.${action}`,
    description,
    category: 'API',
    moduleCode,
    action,
    label,
    isSystem: true,
  };
}

function uiPermission(moduleCode: string, action: string, label: string, description = `${label}.`): PermissionSeed {
  return {
    code: `ui.${moduleCode}.${action}`,
    description,
    category: 'UI',
    moduleCode,
    action,
    label,
    isSystem: true,
  };
}

const apiPermissions: PermissionSeed[] = [
  apiPermission('users', 'create', 'Create users'),
  apiPermission('users', 'read', 'Read users'),
  apiPermission('users', 'update', 'Update users'),
  apiPermission('users', 'roles.assign', 'Assign user roles'),
  apiPermission('menu', 'create', 'Create menu items'),
  apiPermission('menu', 'read', 'Read menu items'),
  apiPermission('menu', 'update', 'Update menu items'),
  apiPermission('menu', 'delete', 'Delete menu items'),
  apiPermission('modules', 'create', 'Create modules'),
  apiPermission('modules', 'read', 'Read modules'),
  apiPermission('modules', 'update', 'Update modules'),
  apiPermission('modules', 'delete', 'Delete modules'),
  apiPermission('permissions', 'create', 'Create permissions'),
  apiPermission('permissions', 'read', 'Read permissions'),
  apiPermission('permissions', 'update', 'Update permissions'),
  apiPermission('permissions', 'delete', 'Delete permissions'),
  apiPermission('roles', 'create', 'Create roles'),
  apiPermission('roles', 'read', 'Read roles'),
  apiPermission('roles', 'update', 'Update roles'),
  apiPermission('roles', 'delete', 'Delete roles'),
  apiPermission('roles', 'permissions.assign', 'Assign role permissions'),
];

const uiPermissions: PermissionSeed[] = [
  uiPermission('dashboard', 'view', 'View dashboard'),
  uiPermission('companies', 'view', 'View companies'),
  uiPermission('companies', 'create', 'Show create company action'),
  uiPermission('companies', 'update', 'Show update company action'),
  uiPermission('companies', 'activate', 'Show activate company action'),
  uiPermission('companies', 'suspend', 'Show suspend company action'),
  uiPermission('branches', 'view', 'View branches'),
  uiPermission('branches', 'create', 'Show create branch action'),
  uiPermission('branches', 'update', 'Show update branch action'),
  uiPermission('branches', 'delete', 'Show delete branch action'),
  uiPermission('users', 'view', 'View users'),
  uiPermission('users', 'create', 'Show create user action'),
  uiPermission('users', 'update', 'Show update user action'),
  uiPermission('users', 'assign_roles', 'Show assign user roles action'),
  uiPermission('roles', 'view', 'View roles'),
  uiPermission('roles', 'create', 'Show create role action'),
  uiPermission('roles', 'update', 'Show update role action'),
  uiPermission('roles', 'delete', 'Show delete role action'),
  uiPermission('menu', 'view', 'View menu management'),
  uiPermission('menu', 'create', 'Show create menu action'),
  uiPermission('menu', 'update', 'Show update menu action'),
  uiPermission('menu', 'delete', 'Show delete menu action'),
  uiPermission('modules', 'view', 'View modules'),
  uiPermission('modules', 'create', 'Show create module action'),
  uiPermission('modules', 'update', 'Show update module action'),
  uiPermission('modules', 'delete', 'Show delete module action'),
  uiPermission('permissions', 'view', 'View permissions'),
  uiPermission('permissions', 'create', 'Show create permission action'),
  uiPermission('permissions', 'update', 'Show update permission action'),
  uiPermission('permissions', 'delete', 'Show delete permission action'),
  uiPermission('profile', 'view', 'View profile'),
  uiPermission('sessions', 'view', 'View active sessions'),
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
      'ui.branches.view',
      'ui.branches.create',
      'ui.branches.update',
      'ui.branches.delete',
      'ui.roles.view',
    ],
  },
  {
    code: 'company.user',
    name: 'Company User',
    permissions: [
      'identity.roles.read',
      ...sharedCompanyUiPermissions,
      'ui.branches.view',
      'ui.roles.view',
    ],
  },
  {
    code: 'branch.admin',
    name: 'Branch Admin',
    permissions: [
      'identity.roles.read',
      'identity.users.create',
      'identity.users.read',
      'identity.users.update',
      'identity.users.roles.assign',
      ...sharedCompanyUiPermissions,
      'ui.users.view',
      'ui.users.create',
      'ui.users.update',
      'ui.users.assign_roles',
      'ui.branches.view',
      'ui.roles.view',
    ],
  },
  {
    code: 'sales.representative',
    name: 'Sales Representative',
    permissions: [
      'identity.roles.read',
      ...sharedCompanyUiPermissions,
      'ui.branches.view',
      'ui.roles.view',
    ],
  },
  {
    code: 'engineer.technician',
    name: 'Engineer Technician',
    permissions: [
      'identity.roles.read',
      ...sharedCompanyUiPermissions,
      'ui.branches.view',
      'ui.roles.view',
    ],
  },
  {
    code: 'accounting.finance',
    name: 'Accounting Finance',
    permissions: [
      'identity.roles.read',
      ...sharedCompanyUiPermissions,
      'ui.branches.view',
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
      'ui.branches.view',
      'ui.roles.view',
    ],
  },
];

const localUserPassword = 'Admin123!';
const localCompanyTaxIds = ['1790010001001', '0990010002001', '0190010003001'];

async function upsertAppModules(): Promise<Map<string, AppModuleOrmEntity>> {
  const moduleRepository = dataSource.getRepository(AppModuleOrmEntity);
  const moduleByCode = new Map<string, AppModuleOrmEntity>();

  for (const seed of appModules) {
    let appModule = await moduleRepository.findOne({
      where: { code: seed.code },
      withDeleted: true,
    });

    if (!appModule) {
      appModule = moduleRepository.create({ code: seed.code });
    }

    appModule.name = seed.name;
    appModule.description = seed.description;
    appModule.icon = seed.icon;
    appModule.displayOrder = seed.displayOrder;
    appModule.status = Status.ACTIVE;
    appModule.isSystem = true;
    appModule.deletedAt = null;

    const saved = await moduleRepository.save(appModule);
    moduleByCode.set(saved.code, saved);
  }

  return moduleByCode;
}

async function upsertPermissions(moduleByCode: Map<string, AppModuleOrmEntity>): Promise<Map<string, PermissionOrmEntity>> {
  const permissionRepository = dataSource.getRepository(PermissionOrmEntity);
  const permissionByCode = new Map<string, PermissionOrmEntity>();

  for (const seed of permissions) {
    const appModule = moduleByCode.get(seed.moduleCode);
    if (!appModule) {
      throw new Error(`App module seed is missing: ${seed.moduleCode}`);
    }

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

    permission.category = seed.category;
    permission.moduleId = appModule.id;
    permission.action = seed.action;
    permission.label = seed.label;
    permission.isSystem = seed.isSystem;

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

  const moduleByCode = await upsertAppModules();
  const permissionByCode = await upsertPermissions(moduleByCode);
  await seedRoleSet(null, permissionByCode);

  const companies = await dataSource.getRepository(CompanyOrmEntity).find({
    where: localCompanyTaxIds.map((taxId) => ({ taxId })),
    order: { createdAt: 'ASC' },
  });

  for (const company of companies) {
    await seedRoleSet(company.id, permissionByCode);
    await seedUsersForCompanyRoles(company);
  }

  console.log(`Modules seeded: ${moduleByCode.size}`);
  console.log(`Permissions seeded: ${permissionByCode.size}`);
  console.log(`Global role templates seeded: ${companyRoles.length}`);
  console.log(`Company role sets seeded: ${companies.length}`);
}

async function seedUsersForCompanyRoles(company: CompanyOrmEntity): Promise<void> {
  const roleRepository = dataSource.getRepository(RoleOrmEntity);
  const branchRepository = dataSource.getRepository(CompanyBranchOrmEntity);
  const userRepository = dataSource.getRepository(UserOrmEntity);
  const userRoleRepository = dataSource.getRepository(UserRoleOrmEntity);
  const passwordHash = await hashPassword(localUserPassword);
  const companySlug = toSlug(company.name);

  const roles = await roleRepository.find({
    where: { companyId: company.id },
    order: { code: 'ASC' },
  });
  const branches = await branchRepository.find({
    where: { companyId: company.id },
    order: { code: 'ASC' },
  });

  for (const role of roles) {
    for (const index of [1, 2]) {
      const branch = role.code === 'company.admin' ? null : branches[(index - 1) % branches.length] ?? null;
      const roleSlug = toSlug(role.code);
      const email = `${companySlug}.${roleSlug}.${index}@obralink.local`;
      let user = await userRepository.findOne({
        where: {
          companyId: company.id,
          email,
        },
        withDeleted: true,
      });

      if (!user) {
        user = userRepository.create({
          companyId: company.id,
          email,
        });
      }

      user.firstName = toDisplayName(role.code);
      user.lastName = `${index} ${company.name}`;
      user.branchId = branch?.id ?? null;
      user.userType = toUserTypeForRole(role.code);
      user.status = Status.ACTIVE;
      user.identificationNumber = null;
      user.personalEmail = null;
      user.phoneNumber = null;
      user.deletedAt = null;

      const savedUser = await userRepository.save(user);
      await userRoleRepository.delete({ userId: savedUser.id, companyId: company.id });
      await userRoleRepository.insert({
        userId: savedUser.id,
        roleId: role.id,
        companyId: company.id,
      });

      const permissions = await findPermissionCodesByRole(role.id);
      await upsertBetterAuthCompanyUser(savedUser, company, passwordHash, permissions);
      console.log(`Company role user seeded: ${email} role=${role.code} branch=${branch?.code ?? 'ALL'} password=${localUserPassword}`);
    }
  }
}

async function findPermissionCodesByRole(roleId: string): Promise<string[]> {
  const rows = await dataSource.query<Array<{ code: string }>>(
    `
      SELECT DISTINCT permission.code AS code
      FROM role_permissions role_permission
      INNER JOIN permissions permission ON permission.id = role_permission.permission_id AND permission.deleted_at IS NULL
      WHERE role_permission.role_id = $1
      ORDER BY permission.code
    `,
    [roleId],
  );

  return rows.map((row) => row.code);
}

async function upsertBetterAuthCompanyUser(user: UserOrmEntity, company: CompanyOrmEntity, passwordHash: string, permissions: string[]): Promise<void> {
  await dataSource.transaction(async (manager) => {
    await manager.query(
      `
        INSERT INTO ba_user (id, name, email, email_verified, image, user_type, permissions, company_id, branch_id, created_at, updated_at)
        VALUES ($1, $2, $3, true, null, $4, $5, $6, $7, now(), now())
        ON CONFLICT (id) DO UPDATE
        SET name = EXCLUDED.name,
            email = EXCLUDED.email,
            email_verified = true,
            user_type = EXCLUDED.user_type,
            permissions = EXCLUDED.permissions,
            company_id = EXCLUDED.company_id,
            branch_id = EXCLUDED.branch_id,
            updated_at = now()
      `,
      [user.id, `${user.firstName} ${user.lastName}`.trim(), user.email, user.userType, permissions, company.id, user.branchId],
    );

    const existingAccount = await manager.query<{ id: string }[]>(
      `
        SELECT id
        FROM ba_account
        WHERE user_id = $1 AND provider_id = 'credential'
        LIMIT 1
      `,
      [user.id],
    );

    if (existingAccount.length > 0) {
      await manager.query(
        `
          UPDATE ba_account
          SET account_id = $1,
              password = $2,
              updated_at = now()
          WHERE id = $3
        `,
        [user.id, passwordHash, existingAccount[0].id],
      );
    } else {
      await manager.query(
        `
          INSERT INTO ba_account (id, account_id, provider_id, user_id, password, created_at, updated_at)
          VALUES (gen_random_uuid()::text, $1, 'credential', $1, $2, now(), now())
        `,
        [user.id, passwordHash],
      );
    }

    await manager.query(
      `
        INSERT INTO ba_member (id, organization_id, user_id, role, created_at)
        VALUES (gen_random_uuid()::text, $1, $2, $3, now())
        ON CONFLICT (organization_id, user_id) DO UPDATE
        SET role = EXCLUDED.role
      `,
      [company.id, user.id, user.userType === UserType.COMPANY_ADMIN ? 'admin' : 'member'],
    );
  });
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s.-]/g, '')
    .trim()
    .replace(/[\s.]+/g, '.')
    .replace(/-+/g, '-')
    .replace(/^\.+|\.+$/g, '')
    .slice(0, 80);
}

function toDisplayName(value: string): string {
  return value
    .split('.')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function toUserTypeForRole(roleCode: string): UserType {
  if (roleCode === 'company.admin') {
    return UserType.COMPANY_ADMIN;
  }
  if (roleCode === 'branch.admin') {
    return UserType.BRANCH_ADMIN;
  }
  return UserType.COMPANY_USER;
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
