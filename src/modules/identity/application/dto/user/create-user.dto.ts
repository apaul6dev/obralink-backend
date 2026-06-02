import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { UserType } from '../../../domain/enums/user-type.enum';

export class CreateUserDto {
  @ApiPropertyOptional({ example: '0f1f66b6-7e0d-4cb0-a04e-3c2ecdcf0205', description: 'Tenant id for platform operations only. Solo para operaciones de plataforma.' })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @ApiProperty({ example: 'admin@obralink.com', description: 'User email. Correo del usuario.' })
  @IsEmail()
  @MaxLength(180)
  email: string;

  @ApiProperty({ example: 'ChangeMe123!', description: 'Raw password, stored as hash. Contraseña sin cifrar, almacenada como hash.' })
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

  @ApiProperty({ enum: UserType, example: UserType.TENANT_ADMIN, description: 'User type. Tipo de usuario.' })
  @IsEnum(UserType)
  userType: UserType;

  @ApiPropertyOptional({ example: '0912345678', description: 'Identification number. Número de identificación.' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  identificationNumber?: string;
}
