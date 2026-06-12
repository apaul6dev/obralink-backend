import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class AssignRolePermissionsDto {
  @ApiProperty({ type: [String], description: 'Permission ids assigned to this role. IDs de permisos asignados al rol.' })
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds: string[];
}
