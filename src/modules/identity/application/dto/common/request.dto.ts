import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class TenantQueryDto {
  @ApiPropertyOptional({ example: '0f1f66b6-7e0d-4cb0-a04e-3c2ecdcf0205', description: 'Tenant id. ID del tenant.' })
  @IsOptional()
  @IsUUID()
  tenantId?: string;
}

export class ActorIdParamDto {
  @ApiProperty({ example: '0f1f66b6-7e0d-4cb0-a04e-3c2ecdcf0205', description: 'Actor id. ID del actor.' })
  @IsUUID()
  actorId: string;
}

export class RoleIdParamDto {
  @ApiProperty({ example: '0f1f66b6-7e0d-4cb0-a04e-3c2ecdcf0205', description: 'Role id. ID del rol.' })
  @IsUUID()
  roleId: string;
}

export class TenantIdParamDto {
  @ApiProperty({ example: '0f1f66b6-7e0d-4cb0-a04e-3c2ecdcf0205', description: 'Tenant id. ID del tenant.' })
  @IsUUID()
  tenantId: string;
}

export class UserIdParamDto {
  @ApiProperty({ example: '0f1f66b6-7e0d-4cb0-a04e-3c2ecdcf0205', description: 'User id. ID del usuario.' })
  @IsUUID()
  userId: string;
}
