import 'dotenv/config';
import { hashPassword } from 'better-auth/crypto';
import dataSource from '../typeorm-data-source';
import { AppModuleCode, PermissionAction, PermissionCode, RoleCode } from '../../../../modules/identity/domain/constants';
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
  { code: AppModuleCode.Dashboard, name: 'Dashboard', description: 'General landing and summary screens.', icon: 'dashboard', displayOrder: 10 },
  { code: AppModuleCode.Companies, name: 'Companies', description: 'Platform company administration.', icon: 'business', displayOrder: 20 },
  { code: AppModuleCode.Branches, name: 'Branches', description: 'Company branch administration.', icon: 'account_tree', displayOrder: 30 },
  { code: AppModuleCode.Users, name: 'Users', description: 'User and access administration.', icon: 'group', displayOrder: 40 },
  { code: AppModuleCode.Roles, name: 'Roles', description: 'Role administration and permission assignment.', icon: 'verified_user', displayOrder: 50 },
  { code: AppModuleCode.Modules, name: 'Modules', description: 'Application module catalog administration.', icon: 'view_module', displayOrder: 60 },
  { code: AppModuleCode.Permissions, name: 'Permissions', description: 'Permission catalog administration.', icon: 'key', displayOrder: 70 },
  { code: AppModuleCode.Menu, name: 'Menu', description: 'Navigation menu administration.', icon: 'menu_open', displayOrder: 80 },
  { code: AppModuleCode.Profile, name: 'Profile', description: 'User profile screens.', icon: 'person', displayOrder: 80 },
  { code: AppModuleCode.Sessions, name: 'Sessions', description: 'Active session screens.', icon: 'devices', displayOrder: 90 },
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
  apiPermission(AppModuleCode.Branches, PermissionAction.Create, 'Create branches'),
  apiPermission(AppModuleCode.Branches, PermissionAction.Read, 'Read branches'),
  apiPermission(AppModuleCode.Branches, PermissionAction.Update, 'Update branches'),
  apiPermission(AppModuleCode.Branches, PermissionAction.Delete, 'Delete branches'),
  apiPermission(AppModuleCode.Users, PermissionAction.Create, 'Create users'),
  apiPermission(AppModuleCode.Users, PermissionAction.Read, 'Read users'),
  apiPermission(AppModuleCode.Users, PermissionAction.Update, 'Update users'),
  apiPermission(AppModuleCode.Users, PermissionAction.RolesAssign, 'Assign user roles'),
  apiPermission(AppModuleCode.Menu, PermissionAction.Create, 'Create menu items'),
  apiPermission(AppModuleCode.Menu, PermissionAction.Read, 'Read menu items'),
  apiPermission(AppModuleCode.Menu, PermissionAction.Update, 'Update menu items'),
  apiPermission(AppModuleCode.Menu, PermissionAction.Delete, 'Delete menu items'),
  apiPermission(AppModuleCode.Modules, PermissionAction.Create, 'Create modules'),
  apiPermission(AppModuleCode.Modules, PermissionAction.Read, 'Read modules'),
  apiPermission(AppModuleCode.Modules, PermissionAction.Update, 'Update modules'),
  apiPermission(AppModuleCode.Modules, PermissionAction.Delete, 'Delete modules'),
  apiPermission(AppModuleCode.Permissions, PermissionAction.Create, 'Create permissions'),
  apiPermission(AppModuleCode.Permissions, PermissionAction.Read, 'Read permissions'),
  apiPermission(AppModuleCode.Permissions, PermissionAction.Update, 'Update permissions'),
  apiPermission(AppModuleCode.Permissions, PermissionAction.Delete, 'Delete permissions'),
  apiPermission(AppModuleCode.Roles, PermissionAction.Create, 'Create roles'),
  apiPermission(AppModuleCode.Roles, PermissionAction.Read, 'Read roles'),
  apiPermission(AppModuleCode.Roles, PermissionAction.Update, 'Update roles'),
  apiPermission(AppModuleCode.Roles, PermissionAction.Delete, 'Delete roles'),
  apiPermission(AppModuleCode.Roles, PermissionAction.PermissionsAssign, 'Assign role permissions'),
];

const uiPermissions: PermissionSeed[] = [
  uiPermission(AppModuleCode.Dashboard, PermissionAction.View, 'View dashboard'),
  uiPermission(AppModuleCode.Companies, PermissionAction.View, 'View companies'),
  uiPermission(AppModuleCode.Companies, PermissionAction.Create, 'Show create company action'),
  uiPermission(AppModuleCode.Companies, PermissionAction.Update, 'Show update company action'),
  uiPermission(AppModuleCode.Companies, PermissionAction.Activate, 'Show activate company action'),
  uiPermission(AppModuleCode.Companies, PermissionAction.Suspend, 'Show suspend company action'),
  uiPermission(AppModuleCode.Branches, PermissionAction.View, 'View branches'),
  uiPermission(AppModuleCode.Branches, PermissionAction.Create, 'Show create branch action'),
  uiPermission(AppModuleCode.Branches, PermissionAction.Update, 'Show update branch action'),
  uiPermission(AppModuleCode.Branches, PermissionAction.Delete, 'Show delete branch action'),
  uiPermission(AppModuleCode.Users, PermissionAction.View, 'View users'),
  uiPermission(AppModuleCode.Users, PermissionAction.Create, 'Show create user action'),
  uiPermission(AppModuleCode.Users, PermissionAction.Update, 'Show update user action'),
  uiPermission(AppModuleCode.Users, PermissionAction.AssignRoles, 'Show assign user roles action'),
  uiPermission(AppModuleCode.Roles, PermissionAction.View, 'View roles'),
  uiPermission(AppModuleCode.Roles, PermissionAction.Create, 'Show create role action'),
  uiPermission(AppModuleCode.Roles, PermissionAction.Update, 'Show update role action'),
  uiPermission(AppModuleCode.Roles, PermissionAction.Delete, 'Show delete role action'),
  uiPermission(AppModuleCode.Menu, PermissionAction.View, 'View menu management'),
  uiPermission(AppModuleCode.Menu, PermissionAction.Create, 'Show create menu action'),
  uiPermission(AppModuleCode.Menu, PermissionAction.Update, 'Show update menu action'),
  uiPermission(AppModuleCode.Menu, PermissionAction.Delete, 'Show delete menu action'),
  uiPermission(AppModuleCode.Modules, PermissionAction.View, 'View modules'),
  uiPermission(AppModuleCode.Modules, PermissionAction.Create, 'Show create module action'),
  uiPermission(AppModuleCode.Modules, PermissionAction.Update, 'Show update module action'),
  uiPermission(AppModuleCode.Modules, PermissionAction.Delete, 'Show delete module action'),
  uiPermission(AppModuleCode.Permissions, PermissionAction.View, 'View permissions'),
  uiPermission(AppModuleCode.Permissions, PermissionAction.Create, 'Show create permission action'),
  uiPermission(AppModuleCode.Permissions, PermissionAction.Update, 'Show update permission action'),
  uiPermission(AppModuleCode.Permissions, PermissionAction.Delete, 'Show delete permission action'),
  uiPermission(AppModuleCode.Profile, PermissionAction.View, 'View profile'),
  uiPermission(AppModuleCode.Sessions, PermissionAction.View, 'View active sessions'),
];

const permissions: PermissionSeed[] = [...apiPermissions, ...uiPermissions];

const sharedCompanyUiPermissions = [
  PermissionCode.UiDashboardView,
  PermissionCode.UiProfileView,
  PermissionCode.UiSessionsView,
];

const companyRoles: RoleSeed[] = [
  {
    code: RoleCode.CompanyAdmin,
    name: 'Company Admin',
    permissions: [
      ...apiPermissions.map((permission) => permission.code),
      ...sharedCompanyUiPermissions,
      PermissionCode.UiUsersView,
      PermissionCode.UiUsersCreate,
      PermissionCode.UiUsersUpdate,
      PermissionCode.UiUsersAssignRoles,
      PermissionCode.UiBranchesView,
      PermissionCode.UiBranchesCreate,
      PermissionCode.UiBranchesUpdate,
      PermissionCode.UiBranchesDelete,
      PermissionCode.UiRolesView,
      PermissionCode.UiRolesCreate,
      PermissionCode.UiRolesUpdate,
      PermissionCode.UiRolesDelete,
    ],
  },
  {
    code: RoleCode.CompanyUser,
    name: 'Company User',
    permissions: [
      PermissionCode.IdentityBranchesRead,
      PermissionCode.IdentityRolesRead,
      ...sharedCompanyUiPermissions,
      PermissionCode.UiBranchesView,
      PermissionCode.UiRolesView,
    ],
  },
  {
    code: RoleCode.BranchAdmin,
    name: 'Branch Admin',
    permissions: [
      PermissionCode.IdentityBranchesRead,
      PermissionCode.IdentityRolesRead,
      PermissionCode.IdentityUsersCreate,
      PermissionCode.IdentityUsersRead,
      PermissionCode.IdentityUsersUpdate,
      PermissionCode.IdentityUsersRolesAssign,
      ...sharedCompanyUiPermissions,
      PermissionCode.UiUsersView,
      PermissionCode.UiUsersCreate,
      PermissionCode.UiUsersUpdate,
      PermissionCode.UiUsersAssignRoles,
      PermissionCode.UiBranchesView,
      PermissionCode.UiRolesView,
    ],
  },
  {
    code: RoleCode.SalesRepresentative,
    name: 'Sales Representative',
    permissions: [
      PermissionCode.IdentityBranchesRead,
      PermissionCode.IdentityRolesRead,
      ...sharedCompanyUiPermissions,
      PermissionCode.UiBranchesView,
      PermissionCode.UiRolesView,
    ],
  },
  {
    code: RoleCode.EngineerTechnician,
    name: 'Engineer Technician',
    permissions: [
      PermissionCode.IdentityBranchesRead,
      PermissionCode.IdentityRolesRead,
      ...sharedCompanyUiPermissions,
      PermissionCode.UiBranchesView,
      PermissionCode.UiRolesView,
    ],
  },
  {
    code: RoleCode.AccountingFinance,
    name: 'Accounting Finance',
    permissions: [
      PermissionCode.IdentityBranchesRead,
      PermissionCode.IdentityRolesRead,
      ...sharedCompanyUiPermissions,
      PermissionCode.UiBranchesView,
      PermissionCode.UiRolesView,
    ],
  },
  {
    code: RoleCode.Management,
    name: 'Management',
    permissions: [
      PermissionCode.IdentityBranchesRead,
      PermissionCode.IdentityRolesRead,
      PermissionCode.IdentityUsersRead,
      ...sharedCompanyUiPermissions,
      PermissionCode.UiUsersView,
      PermissionCode.UiBranchesView,
      PermissionCode.UiRolesView,
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
      const branch = role.code === RoleCode.CompanyAdmin ? null : branches[(index - 1) % branches.length] ?? null;
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
  if (roleCode === RoleCode.CompanyAdmin) {
    return UserType.COMPANY_ADMIN;
  }
  if (roleCode === RoleCode.BranchAdmin) {
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
