import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTenantDto {
  @ApiPropertyOptional({ example: 'Obralink Construction', description: 'Tenant display name. Nombre visible del tenant.' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  name?: string;

  @ApiPropertyOptional({ example: 'Obralink Construction LLC', nullable: true, description: 'Legal company name. Razón social de la empresa.' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  legalName?: string | null;

  @ApiPropertyOptional({ example: '1799999999001', nullable: true, description: 'Company identification number. Número de identificación de la empresa.' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  identificationNumber?: string | null;
}
