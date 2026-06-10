import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @ApiPropertyOptional({ example: '0f1f66b6-7e0d-4cb0-a04e-3c2ecdcf0205', description: 'Company id for platform operations. ID de la empresa para operaciones de plataforma.' })
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @ApiProperty({ example: 'Company Administrator', description: 'Role name. Nombre del rol.' })
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiProperty({ example: 'COMPANY_ADMIN', description: 'Role code. Código del rol.' })
  @IsString()
  @MaxLength(120)
  code: string;
}
