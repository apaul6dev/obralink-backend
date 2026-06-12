import 'dotenv/config';
import dataSource from '../typeorm-data-source';
import { UserType } from '../../../../modules/identity/domain/enums/user-type.enum';
import { Status } from '../../../../modules/identity/domain/enums/status.enum';
import { MenuItemPermissionOrmEntity } from '../../../../modules/identity/infrastructure/persistence/typeorm/entities/menu-item-permission.orm-entity';
import { MenuItemOrmEntity } from '../../../../modules/identity/infrastructure/persistence/typeorm/entities/menu-item.orm-entity';
import { PermissionOrmEntity } from '../../../../modules/identity/infrastructure/persistence/typeorm/entities/permission.orm-entity';

interface MenuSeed {
  code: string;
  titleKey: string;
  routerLink: string | null;
  href?: string | null;
  icon: string;
  target?: string | null;
  parentCode?: string | null;
  displayOrder: number;
  allowedUserTypes?: UserType[] | null;
  permissions?: string[];
}

const menuSeeds: MenuSeed[] = [
  {
    code: 'home',
    titleKey: 'nav.home',
    routerLink: '/',
    icon: 'dashboard',
    displayOrder: 10,
  },
  {
    code: 'administration',
    titleKey: 'nav.administration',
    routerLink: null,
    icon: 'admin_panel_settings',
    displayOrder: 20,
  },
  {
    code: 'companies',
    titleKey: 'nav.companies',
    routerLink: '/companies',
    icon: 'business',
    parentCode: 'administration',
    displayOrder: 10,
    allowedUserTypes: [UserType.SYSTEM_OWNER],
  },
  {
    code: 'users',
    titleKey: 'nav.users',
    routerLink: '/users',
    icon: 'group',
    parentCode: 'administration',
    displayOrder: 20,
    allowedUserTypes: [UserType.COMPANY_ADMIN],
    permissions: ['ui.users.view'],
  },
  {
    code: 'roles',
    titleKey: 'nav.roles',
    routerLink: '/roles',
    icon: 'verified_user',
    parentCode: 'administration',
    displayOrder: 30,
    allowedUserTypes: [UserType.SYSTEM_OWNER, UserType.COMPANY_ADMIN, UserType.COMPANY_USER],
    permissions: ['ui.roles.view'],
  },
  {
    code: 'menu-management',
    titleKey: 'nav.menuManagement',
    routerLink: '/menu-management',
    icon: 'menu_open',
    parentCode: 'administration',
    displayOrder: 40,
    allowedUserTypes: [UserType.SYSTEM_OWNER],
  },
  {
    code: 'permissions',
    titleKey: 'nav.permissions',
    routerLink: '/permissions',
    icon: 'key',
    parentCode: 'administration',
    displayOrder: 50,
    allowedUserTypes: [UserType.SYSTEM_OWNER],
  },
];

async function upsertMenuItem(seed: MenuSeed, parentId: string | null): Promise<MenuItemOrmEntity> {
  const repository = dataSource.getRepository(MenuItemOrmEntity);
  const existing = await repository.findOne({ where: { code: seed.code }, withDeleted: true });

  const values: Partial<MenuItemOrmEntity> = {
    code: seed.code,
    titleKey: seed.titleKey,
    routerLink: seed.routerLink,
    href: seed.href ?? null,
    icon: seed.icon,
    target: seed.target ?? null,
    parentId,
    displayOrder: seed.displayOrder,
    allowedUserTypes: seed.allowedUserTypes ?? null,
    status: Status.ACTIVE,
    deletedAt: null,
  };

  if (existing) {
    Object.assign(existing, values);
    return repository.save(existing);
  }

  return repository.save(repository.create(values));
}

async function syncMenuPermissions(menuItem: MenuItemOrmEntity, permissionCodes: string[]): Promise<void> {
  const menuPermissionRepository = dataSource.getRepository(MenuItemPermissionOrmEntity);
  const permissionRepository = dataSource.getRepository(PermissionOrmEntity);
  await menuPermissionRepository.delete({ menuItemId: menuItem.id });

  for (const code of permissionCodes) {
    const permission = await permissionRepository.findOne({ where: { code } });
    if (!permission) {
      throw new Error(`Menu permission seed is missing: ${code}`);
    }

    await menuPermissionRepository.insert({
      menuItemId: menuItem.id,
      permissionId: permission.id,
    });
  }
}

async function seedMenu(): Promise<void> {
  await dataSource.initialize();

  const menuByCode = new Map<string, MenuItemOrmEntity>();

  for (const seed of menuSeeds.filter((item) => !item.parentCode)) {
    const menuItem = await upsertMenuItem(seed, null);
    menuByCode.set(seed.code, menuItem);
    await syncMenuPermissions(menuItem, seed.permissions ?? []);
  }

  for (const seed of menuSeeds.filter((item) => item.parentCode)) {
    const parent = menuByCode.get(seed.parentCode ?? '');
    if (!parent) {
      throw new Error(`Menu parent seed is missing: ${seed.parentCode}`);
    }

    const menuItem = await upsertMenuItem(seed, parent.id);
    menuByCode.set(seed.code, menuItem);
    await syncMenuPermissions(menuItem, seed.permissions ?? []);
  }

  console.log(`Menu items seeded: ${menuByCode.size}`);
}

seedMenu()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Menu seed failed: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });
