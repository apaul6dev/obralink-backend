import { SetMetadata } from '@nestjs/common';
import { UserType } from '../../domain/enums/user-type.enum';

export const REQUIRED_ROLES_KEY = 'requiredRoles';
export const Roles = (...roles: UserType[]) => SetMetadata(REQUIRED_ROLES_KEY, roles);
