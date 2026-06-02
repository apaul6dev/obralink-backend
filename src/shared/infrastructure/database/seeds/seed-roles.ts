import 'dotenv/config';
import dataSource from '../typeorm-data-source';
import { Status } from '../../../../modules/identity/domain/enums/status.enum';
import { PermissionOrmEntity } from '../../../../modules/identity/infrastructure/persistence/typeorm/entities/permission.orm-entity';
import { RolePermissionOrmEntity } from '../../../../modules/identity/infrastructure/persistence/typeorm/entities/role-permission.orm-entity';
import { RoleOrmEntity } from '../../../../modules/identity/infrastructure/persistence/typeorm/entities/role.orm-entity';
import { TenantOrmEntity } from '../../../../modules/identity/infrastructure/persistence/typeorm/entities/tenant.orm-entity';

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
  { code: 'identity.actors.create', description: 'Create business actors.' },
  { code: 'identity.actors.read', description: 'Read business actors.' },
  { code: 'identity.actors.update', description: 'Update business actors.' },
  { code: 'identity.actors.roles.assign', description: 'Assign roles to business actors.' },
  { code: 'identity.actors.roles.remove', description: 'Remove roles from business actors.' },
];

const uiPermissions: PermissionSeed[] = [
  { code: 'ui.dashboard.view', description: 'View dashboard screen.' },
  { code: 'ui.tenants.view', description: 'View tenants screen.' },
  { code: 'ui.tenants.create', description: 'Show create tenant action.' },
  { code: 'ui.tenants.update', description: 'Show update tenant action.' },
  { code: 'ui.tenants.activate', description: 'Show activate tenant action.' },
  { code: 'ui.tenants.suspend', description: 'Show suspend tenant action.' },
  { code: 'ui.users.view', description: 'View users screen.' },
  { code: 'ui.users.create', description: 'Show create user action.' },
  { code: 'ui.users.update', description: 'Show update user action.' },
  { code: 'ui.users.assign_roles', description: 'Show assign user roles action.' },
  { code: 'ui.roles.view', description: 'View roles screen.' },
  { code: 'ui.actors.view', description: 'View actors screen.' },
  { code: 'ui.actors.create', description: 'Show create actor action.' },
  { code: 'ui.actors.update', description: 'Show update actor action.' },
  { code: 'ui.actors.assign_roles', description: 'Show assign actor roles action.' },
  { code: 'ui.actors.remove_roles', description: 'Show remove actor roles action.' },
  { code: 'ui.profile.view', description: 'View profile screen.' },
  { code: 'ui.sessions.view', description: 'View active sessions screen.' },
];

const permissions: PermissionSeed[] = [...apiPermissions, ...uiPermissions];

const sharedTenantUiPermissions = [
  'ui.dashboard.view',
  'ui.profile.view',
  'ui.sessions.view',
];

const actorWriteUiPermissions = [
  'ui.roles.view',
  'ui.actors.view',
  'ui.actors.create',
  'ui.actors.update',
];

const actorReadUiPermissions = [
  'ui.roles.view',
  'ui.actors.view',
];

const tenantRoles: RoleSeed[] = [
  {
    code: 'tenant.admin',
    name: 'Tenant Admin',
    permissions: [
      ...apiPermissions.map((permission) => permission.code),
      ...sharedTenantUiPermissions,
      'ui.users.view',
      'ui.users.create',
      'ui.users.update',
      'ui.users.assign_roles',
      'ui.roles.view',
      'ui.actors.view',
      'ui.actors.create',
      'ui.actors.update',
      'ui.actors.assign_roles',
      'ui.actors.remove_roles',
    ],
  },
  {
    code: 'tenant.user',
    name: 'Tenant User',
    permissions: [
      'identity.roles.read',
      'identity.actors.create',
      'identity.actors.read',
      'identity.actors.update',
      ...sharedTenantUiPermissions,
      ...actorWriteUiPermissions,
    ],
  },
  {
    code: 'sales.representative',
    name: 'Sales Representative',
    permissions: [
      'identity.roles.read',
      'identity.actors.create',
      'identity.actors.read',
      'identity.actors.update',
      ...sharedTenantUiPermissions,
      ...actorWriteUiPermissions,
    ],
  },
  {
    code: 'engineer.technician',
    name: 'Engineer Technician',
    permissions: [
      'identity.roles.read',
      'identity.actors.read',
      ...sharedTenantUiPermissions,
      ...actorReadUiPermissions,
    ],
  },
  {
    code: 'accounting.finance',
    name: 'Accounting Finance',
    permissions: [
      'identity.roles.read',
      'identity.actors.read',
      ...sharedTenantUiPermissions,
      ...actorReadUiPermissions,
    ],
  },
  {
    code: 'management',
    name: 'Management',
    permissions: [
      'identity.roles.read',
      'identity.users.read',
      'identity.actors.read',
      ...sharedTenantUiPermissions,
      'ui.users.view',
      ...actorReadUiPermissions,
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

async function upsertRole(seed: RoleSeed, tenantId: string | null): Promise<RoleOrmEntity> {
  const roleRepository = dataSource.getRepository(RoleOrmEntity);
  const role = await roleRepository
    .createQueryBuilder('role')
    .withDeleted()
    .where('role.code = :code', { code: seed.code })
    .andWhere(tenantId ? 'role.tenant_id = :tenantId' : 'role.tenant_id IS NULL', { tenantId })
    .getOne();

  if (role) {
    role.name = seed.name;
    role.status = Status.ACTIVE;
    role.deletedAt = null;
    return roleRepository.save(role);
  }

  return roleRepository.save(
    roleRepository.create({
      tenantId,
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
      .andWhere(role.tenantId ? 'rolePermission.tenant_id = :tenantId' : 'rolePermission.tenant_id IS NULL', { tenantId: role.tenantId })
      .getExists();

    if (!exists) {
      await rolePermissionRepository.insert({
        roleId: role.id,
        permissionId: permission.id,
        tenantId: role.tenantId,
      });
    }
  }
}

async function seedRoleSet(tenantId: string | null, permissionByCode: Map<string, PermissionOrmEntity>): Promise<void> {
  for (const roleSeed of tenantRoles) {
    const role = await upsertRole(roleSeed, tenantId);
    await syncRolePermissions(role, roleSeed, permissionByCode);
  }
}

async function seedRoles(): Promise<void> {
  await dataSource.initialize();

  const permissionByCode = await upsertPermissions();
  await seedRoleSet(null, permissionByCode);

  const tenants = await dataSource.getRepository(TenantOrmEntity).find({
    order: { createdAt: 'ASC' },
  });

  for (const tenant of tenants) {
    await seedRoleSet(tenant.id, permissionByCode);
  }

  console.log(`Permissions seeded: ${permissionByCode.size}`);
  console.log(`Global role templates seeded: ${tenantRoles.length}`);
  console.log(`Tenant role sets seeded: ${tenants.length}`);
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
