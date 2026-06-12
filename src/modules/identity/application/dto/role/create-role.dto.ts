import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { Status } from '../../../domain/enums/status.enum';

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

  @ApiPropertyOptional({ enum: Status, example: Status.ACTIVE, description: 'Role status. Estado del rol.' })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @ApiPropertyOptional({ type: [String], description: 'Permission ids assigned to this role. IDs de permisos asignados al rol.' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds?: string[];
}
