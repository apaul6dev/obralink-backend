export const AppModuleCode = {
  Dashboard: 'dashboard',
  Companies: 'companies',
  Branches: 'branches',
  Users: 'users',
  Roles: 'roles',
  Modules: 'modules',
  Permissions: 'permissions',
  Menu: 'menu',
  Profile: 'profile',
  Sessions: 'sessions',
} as const;

export type AppModuleCode = (typeof AppModuleCode)[keyof typeof AppModuleCode];
