export const PermissionCode = {
  IdentityBranchesCreate: 'identity.branches.create',
  IdentityBranchesRead: 'identity.branches.read',
  IdentityBranchesUpdate: 'identity.branches.update',
  IdentityBranchesDelete: 'identity.branches.delete',

  IdentityUsersCreate: 'identity.users.create',
  IdentityUsersRead: 'identity.users.read',
  IdentityUsersUpdate: 'identity.users.update',
  IdentityUsersRolesAssign: 'identity.users.roles.assign',

  IdentityMenuCreate: 'identity.menu.create',
  IdentityMenuRead: 'identity.menu.read',
  IdentityMenuUpdate: 'identity.menu.update',
  IdentityMenuDelete: 'identity.menu.delete',

  IdentityModulesCreate: 'identity.modules.create',
  IdentityModulesRead: 'identity.modules.read',
  IdentityModulesUpdate: 'identity.modules.update',
  IdentityModulesDelete: 'identity.modules.delete',

  IdentityPermissionsCreate: 'identity.permissions.create',
  IdentityPermissionsRead: 'identity.permissions.read',
  IdentityPermissionsUpdate: 'identity.permissions.update',
  IdentityPermissionsDelete: 'identity.permissions.delete',

  IdentityRolesCreate: 'identity.roles.create',
  IdentityRolesRead: 'identity.roles.read',
  IdentityRolesUpdate: 'identity.roles.update',
  IdentityRolesDelete: 'identity.roles.delete',
  IdentityRolesPermissionsAssign: 'identity.roles.permissions.assign',

  UiDashboardView: 'ui.dashboard.view',
  UiCompaniesView: 'ui.companies.view',
  UiCompaniesCreate: 'ui.companies.create',
  UiCompaniesUpdate: 'ui.companies.update',
  UiCompaniesActivate: 'ui.companies.activate',
  UiCompaniesSuspend: 'ui.companies.suspend',

  UiBranchesView: 'ui.branches.view',
  UiBranchesCreate: 'ui.branches.create',
  UiBranchesUpdate: 'ui.branches.update',
  UiBranchesDelete: 'ui.branches.delete',

  UiUsersView: 'ui.users.view',
  UiUsersCreate: 'ui.users.create',
  UiUsersUpdate: 'ui.users.update',
  UiUsersAssignRoles: 'ui.users.assign_roles',

  UiRolesView: 'ui.roles.view',
  UiRolesCreate: 'ui.roles.create',
  UiRolesUpdate: 'ui.roles.update',
  UiRolesDelete: 'ui.roles.delete',

  UiMenuView: 'ui.menu.view',
  UiMenuCreate: 'ui.menu.create',
  UiMenuUpdate: 'ui.menu.update',
  UiMenuDelete: 'ui.menu.delete',

  UiModulesView: 'ui.modules.view',
  UiModulesCreate: 'ui.modules.create',
  UiModulesUpdate: 'ui.modules.update',
  UiModulesDelete: 'ui.modules.delete',

  UiPermissionsView: 'ui.permissions.view',
  UiPermissionsCreate: 'ui.permissions.create',
  UiPermissionsUpdate: 'ui.permissions.update',
  UiPermissionsDelete: 'ui.permissions.delete',

  UiProfileView: 'ui.profile.view',
  UiSessionsView: 'ui.sessions.view',
} as const;

export type PermissionCode = (typeof PermissionCode)[keyof typeof PermissionCode];
