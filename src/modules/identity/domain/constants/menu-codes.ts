export const MenuCode = {
  Home: 'home',
  Administration: 'administration',
  Companies: 'companies',
  Users: 'users',
  Branches: 'branches',
  Roles: 'roles',
  MenuManagement: 'menu-management',
  Modules: 'modules',
  Permissions: 'permissions',
} as const;

export type MenuCode = (typeof MenuCode)[keyof typeof MenuCode];
