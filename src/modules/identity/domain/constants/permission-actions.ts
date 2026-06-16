export const PermissionAction = {
  Activate: 'activate',
  AssignRoles: 'assign_roles',
  Create: 'create',
  Delete: 'delete',
  PermissionsAssign: 'permissions.assign',
  Read: 'read',
  RolesAssign: 'roles.assign',
  Suspend: 'suspend',
  Update: 'update',
  View: 'view',
} as const;

export type PermissionAction = (typeof PermissionAction)[keyof typeof PermissionAction];
