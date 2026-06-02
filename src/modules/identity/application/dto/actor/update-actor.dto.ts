import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ActorType } from '../../../domain/enums/actor-type.enum';
import { Status } from '../../../domain/enums/status.enum';

export class UpdateActorDto {
  @ApiPropertyOptional({ enum: ActorType, example: ActorType.CLIENT, description: 'Business actor type. Tipo de actor de negocio.' })
  @IsOptional()
  @IsEnum(ActorType)
  type?: ActorType;

  @ApiPropertyOptional({ example: 'Acme Client', description: 'Actor name. Nombre del actor.' })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  name?: string;

  @ApiPropertyOptional({ example: 'client@acme.com', nullable: true, description: 'Actor email. Correo del actor.' })
  @IsOptional()
  @IsEmail()
  @MaxLength(180)
  email?: string | null;

  @ApiPropertyOptional({ example: '0999999999', nullable: true, description: 'Identification number. Número de identificación.' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  identificationNumber?: string | null;

  @ApiPropertyOptional({ example: '+593999999999', nullable: true, description: 'Phone number. Número telefónico.' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string | null;

  @ApiPropertyOptional({ enum: Status, example: Status.ACTIVE, description: 'Actor status. Estado del actor.' })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
