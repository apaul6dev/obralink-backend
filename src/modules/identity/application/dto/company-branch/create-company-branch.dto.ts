import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Status } from '../../../domain/enums/status.enum';

export class CreateCompanyBranchDto {
  @ApiProperty({ example: 'Quito Norte', description: 'Branch name. Nombre de sucursal.' })
  @IsString()
  @MaxLength(160)
  name: string;

  @ApiProperty({ example: 'UIO-NORTE', description: 'Branch code. Codigo de sucursal.' })
  @IsString()
  @MaxLength(80)
  code: string;

  @ApiPropertyOptional({ example: 'Av. Amazonas N34-120', description: 'Branch address. Direccion.' })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  address?: string | null;

  @ApiPropertyOptional({ example: 'Quito', description: 'Branch city. Ciudad.' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string | null;

  @ApiPropertyOptional({ example: 'Pichincha', description: 'Branch state. Provincia/estado.' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  state?: string | null;

  @ApiPropertyOptional({ example: '+593 2 400 1001', description: 'Branch phone. Telefono.' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string | null;

  @ApiPropertyOptional({ example: 'quito@obralink.local', description: 'Branch email. Email.' })
  @IsOptional()
  @IsEmail()
  @MaxLength(180)
  email?: string | null;

  @ApiPropertyOptional({ enum: Status, example: Status.ACTIVE, description: 'Branch status. Estado.' })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
