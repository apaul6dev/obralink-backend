import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { Status } from '../../../domain/enums/status.enum';
import { UserType } from '../../../domain/enums/user-type.enum';

export class CreateMenuItemDto {
  @ApiProperty({ example: 'system.permissions', description: 'Menu item code. Codigo del item de menu.' })
  @IsString()
  @MaxLength(120)
  code: string;

  @ApiProperty({ example: 'nav.permissions', description: 'Translation key or title. Clave de traduccion o titulo.' })
  @IsString()
  @MaxLength(160)
  titleKey: string;

  @ApiPropertyOptional({ example: '/permissions', description: 'Angular route. Ruta Angular.' })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  routerLink?: string | null;

  @ApiPropertyOptional({ example: 'https://example.com', description: 'External href. Enlace externo.' })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  href?: string | null;

  @ApiProperty({ example: 'security', description: 'Material icon name. Nombre de icono Material.' })
  @IsString()
  @MaxLength(80)
  icon: string;

  @ApiPropertyOptional({ example: '_blank', description: 'Link target. Target del enlace.' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  target?: string | null;

  @ApiPropertyOptional({ example: '0f1f66b6-7e0d-4cb0-a04e-3c2ecdcf0205', description: 'Parent menu item id. ID del item padre.' })
  @IsOptional()
  @IsUUID()
  parentId?: string | null;

  @ApiPropertyOptional({ example: 10, description: 'Display order. Orden visual.' })
  @IsOptional()
  @IsInt()
  displayOrder?: number;

  @ApiPropertyOptional({ enum: UserType, isArray: true, description: 'Allowed user types. Tipos de usuario permitidos.' })
  @IsOptional()
  @IsArray()
  @IsEnum(UserType, { each: true })
  allowedUserTypes?: UserType[] | null;

  @ApiPropertyOptional({ enum: Status, example: Status.ACTIVE, description: 'Menu item status. Estado del item.' })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @ApiPropertyOptional({ type: [String], description: 'Required permission ids. IDs de permisos requeridos.' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds?: string[];
}
