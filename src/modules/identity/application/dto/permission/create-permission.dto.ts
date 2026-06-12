import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

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
}
