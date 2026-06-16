import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { Status } from '../../../domain/enums/status.enum';

export class CreateAppModuleDto {
  @ApiProperty({ example: 'users', description: 'Stable module code. Codigo estable del modulo.' })
  @IsString()
  @MaxLength(80)
  code: string;

  @ApiProperty({ example: 'Users', description: 'Readable module name. Nombre visible del modulo.' })
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional({ example: 'User and access administration.', description: 'Module description. Descripcion del modulo.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string | null;

  @ApiPropertyOptional({ example: 'group', description: 'Material icon. Icono Material.' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  icon?: string | null;

  @ApiPropertyOptional({ example: 20, description: 'Display order. Orden visual.' })
  @IsOptional()
  @IsInt()
  displayOrder?: number;

  @ApiPropertyOptional({ enum: Status, example: Status.ACTIVE, description: 'Module status. Estado del modulo.' })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @ApiPropertyOptional({ example: true, description: 'System seeded module. Modulo del sistema.' })
  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;
}
