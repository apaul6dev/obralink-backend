import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Status } from '../../../domain/enums/status.enum';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Alice', description: 'First name. Nombre.' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Admin', description: 'Last name. Apellido.' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({ example: '0912345678', nullable: true, description: 'Identification number. Número de identificación.' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  identificationNumber?: string | null;

  @ApiPropertyOptional({ example: 'alice.personal@example.com', nullable: true, description: 'Personal email. Correo personal.' })
  @IsOptional()
  @IsEmail()
  @MaxLength(180)
  personalEmail?: string | null;

  @ApiPropertyOptional({ example: '+1 555 123 4567', nullable: true, description: 'Phone number. Número de teléfono.' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phoneNumber?: string | null;

  @ApiPropertyOptional({ enum: Status, example: Status.ACTIVE, description: 'User status. Estado del usuario.' })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
