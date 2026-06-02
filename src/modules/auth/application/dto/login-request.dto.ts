import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class LoginRequestDto {
  @ApiProperty({ example: 'admin@obralink.local', description: 'User email. Correo del usuario.' })
  @IsEmail()
  @MaxLength(180)
  email: string;

  @ApiProperty({ example: 'Admin123!', description: 'User password. Contraseña del usuario.' })
  @IsString()
  @MinLength(8)
  @MaxLength(120)
  password: string;

  @ApiPropertyOptional({ example: '0f1f66b6-7e0d-4cb0-a04e-3c2ecdcf0205', description: 'Tenant id for tenant users. ID del tenant para usuarios tenant.' })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @ApiPropertyOptional({ example: '1799999999001', description: 'Company identifier for tenant users. Identificador de empresa para usuarios tenant.' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  companyIdentifier?: string;
}
