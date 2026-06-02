import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({ example: 'Obralink Construction', description: 'Tenant display name. Nombre visible del tenant.' })
  @IsString()
  @MaxLength(160)
  name: string;

  @ApiPropertyOptional({ example: 'Obralink Construction LLC', description: 'Legal company name. Razón social de la empresa.' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  legalName?: string;

  @ApiPropertyOptional({ example: '1799999999001', description: 'Company identification number. Número de identificación de la empresa.' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  identificationNumber?: string;
}
