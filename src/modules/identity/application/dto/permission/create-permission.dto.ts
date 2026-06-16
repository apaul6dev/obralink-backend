import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ example: 'identity.roles.create', description: 'Permission code. Codigo del permiso.' })
  @IsString()
  @MaxLength(160)
  code: string;

  @ApiPropertyOptional({ example: 'Create roles.', description: 'Permission description. Descripcion del permiso.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({ example: 'UI', enum: ['API', 'UI'], description: 'Permission category. Categoria del permiso.' })
  @IsOptional()
  @IsIn(['API', 'UI'])
  category?: 'API' | 'UI';

  @ApiProperty({ example: '0f1f66b6-7e0d-4cb0-a04e-3c2ecdcf0205', description: 'Functional module id. ID del modulo funcional.' })
  @IsUUID()
  moduleId: string;

  @ApiPropertyOptional({ example: 'view', description: 'Permission action. Accion del permiso.' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  action?: string;

  @ApiPropertyOptional({ example: 'View users', description: 'Readable label. Etiqueta visible.' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  label?: string;

  @ApiPropertyOptional({ example: true, description: 'System seeded permission. Permiso del sistema.' })
  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;
}
