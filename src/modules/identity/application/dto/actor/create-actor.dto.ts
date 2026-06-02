import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ActorType } from '../../../domain/enums/actor-type.enum';

export class CreateActorDto {
  @ApiProperty({ enum: ActorType, example: ActorType.CLIENT, description: 'Business actor type. Tipo de actor de negocio.' })
  @IsEnum(ActorType)
  type: ActorType;

  @ApiProperty({ example: 'Acme Client', description: 'Actor name. Nombre del actor.' })
  @IsString()
  @MaxLength(180)
  name: string;

  @ApiPropertyOptional({ example: 'client@acme.com', description: 'Actor email. Correo del actor.' })
  @IsOptional()
  @IsEmail()
  @MaxLength(180)
  email?: string;

  @ApiPropertyOptional({ example: '0999999999', description: 'Identification number. Número de identificación.' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  identificationNumber?: string;

  @ApiPropertyOptional({ example: '+593999999999', description: 'Phone number. Número telefónico.' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;
}
