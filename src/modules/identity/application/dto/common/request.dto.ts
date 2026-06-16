import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class CompanyQueryDto {
  @ApiPropertyOptional({ example: '0f1f66b6-7e0d-4cb0-a04e-3c2ecdcf0205', description: 'Company id. ID de la empresa.' })
  @IsOptional()
  @IsUUID()
  companyId?: string;
}

export class RoleIdParamDto {
  @ApiProperty({ example: '0f1f66b6-7e0d-4cb0-a04e-3c2ecdcf0205', description: 'Role id. ID del rol.' })
  @IsUUID()
  roleId: string;
}

export class PermissionIdParamDto {
  @ApiProperty({ example: '0f1f66b6-7e0d-4cb0-a04e-3c2ecdcf0205', description: 'Permission id. ID del permiso.' })
  @IsUUID()
  permissionId: string;
}

export class AppModuleIdParamDto {
  @ApiProperty({ example: '0f1f66b6-7e0d-4cb0-a04e-3c2ecdcf0205', description: 'Module id. ID del modulo.' })
  @IsUUID()
  moduleId: string;
}

export class MenuItemIdParamDto {
  @ApiProperty({ example: '0f1f66b6-7e0d-4cb0-a04e-3c2ecdcf0205', description: 'Menu item id. ID del item de menu.' })
  @IsUUID()
  menuItemId: string;
}

export class CompanyIdParamDto {
  @ApiProperty({ example: '0f1f66b6-7e0d-4cb0-a04e-3c2ecdcf0205', description: 'Company id. ID de la empresa.' })
  @IsUUID()
  companyId: string;
}

export class CompanyBranchIdParamDto extends CompanyIdParamDto {
  @ApiProperty({ example: '0f1f66b6-7e0d-4cb0-a04e-3c2ecdcf0205', description: 'Branch id. ID de sucursal.' })
  @IsUUID()
  branchId: string;
}

export class UserIdParamDto {
  @ApiProperty({ example: '0f1f66b6-7e0d-4cb0-a04e-3c2ecdcf0205', description: 'User id. ID del usuario.' })
  @IsUUID()
  userId: string;
}
