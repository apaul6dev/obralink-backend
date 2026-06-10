import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCompanyAdminDto {
  @ApiProperty({ example: 'admin@company.com', description: 'Login email. Correo de acceso.' })
  @IsEmail()
  @MaxLength(180)
  email: string;

  @ApiProperty({ example: 'ChangeMe123!', description: 'Temporary password. Contraseña temporal.' })
  @IsString()
  @MinLength(8)
  @MaxLength(120)
  password: string;

  @ApiProperty({ example: 'Alice', description: 'First name. Nombre.' })
  @IsString()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Admin', description: 'Last name. Apellido.' })
  @IsString()
  @MaxLength(100)
  lastName: string;

  @ApiPropertyOptional({ example: '0912345678', description: 'Identification number. Número de identificación.' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  identificationNumber?: string;

  @ApiPropertyOptional({ example: 'alice.personal@example.com', description: 'Personal email. Correo personal.' })
  @IsOptional()
  @IsEmail()
  @MaxLength(180)
  personalEmail?: string;

  @ApiPropertyOptional({ example: '+1 555 123 4567', description: 'Phone number. Número de teléfono.' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phoneNumber?: string;
}
