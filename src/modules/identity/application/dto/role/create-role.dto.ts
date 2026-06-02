import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @ApiPropertyOptional({ example: '0f1f66b6-7e0d-4cb0-a04e-3c2ecdcf0205', description: 'Tenant id for platform operations. ID del tenant para operaciones de plataforma.' })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @ApiProperty({ example: 'Tenant Administrator', description: 'Role name. Nombre del rol.' })
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiProperty({ example: 'TENANT_ADMIN', description: 'Role code. Código del rol.' })
  @IsString()
  @MaxLength(120)
  code: string;
}
