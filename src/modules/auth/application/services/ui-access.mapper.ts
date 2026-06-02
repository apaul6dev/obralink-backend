import { UserType } from '../../../identity/domain/enums/user-type.enum';
import { UiAccessResponseDto } from '../dto/ui-access-response.dto';

const globalAdminUiPermissions = [
  'ui.dashboard.view',
  'ui.tenants.view',
  'ui.tenants.create',
  'ui.tenants.update',
  'ui.tenants.activate',
  'ui.tenants.suspend',
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
  'ui.profile.view',
  'ui.sessions.view',
];

export function buildUiAccess(userType: string, permissions: string[]): UiAccessResponseDto {
  const uiPermissions = userType === UserType.GLOBAL_ADMIN
    ? globalAdminUiPermissions
    : permissions.filter((permission) => permission.startsWith('ui.'));

  const screens = new Set<string>();
  const actions = new Set<string>();

  for (const permission of uiPermissions) {
    const uiKey = permission.replace(/^ui\./, '');
    if (uiKey.endsWith('.view')) {
      screens.add(uiKey.replace(/\.view$/, ''));
      continue;
    }
    actions.add(uiKey);
  }

  return {
    screens: Array.from(screens).sort(),
    actions: Array.from(actions).sort(),
  };
}
