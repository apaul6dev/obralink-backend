import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCompanyDto {
  @ApiPropertyOptional({ example: 'Obralink Construction', description: 'Company display name. Nombre visible de la empresa.' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  name?: string;

  @ApiPropertyOptional({ example: 'Obralink Construction LLC', nullable: true, description: 'Legal company name. Razón social de la empresa.' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  legalName?: string | null;

  @ApiPropertyOptional({ example: '1799999999001', nullable: true, description: 'Company tax identifier. Identificador fiscal de la empresa.' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  taxId?: string | null;

  @ApiPropertyOptional({ example: 'Jane Smith', nullable: true, description: 'Primary contact name.' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  contactName?: string | null;

  @ApiPropertyOptional({ example: 'contact@company.com', nullable: true, description: 'Primary contact email.' })
  @IsOptional()
  @IsEmail()
  @MaxLength(180)
  email?: string | null;

  @ApiPropertyOptional({ example: '+1 555 123 4567', nullable: true, description: 'Primary contact phone.' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string | null;

  @ApiPropertyOptional({ example: '100 Main St', nullable: true, description: 'Company address.' })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  address?: string | null;

  @ApiPropertyOptional({ example: 'Miami', nullable: true, description: 'Company city.' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string | null;

  @ApiPropertyOptional({ example: 'FL', nullable: true, description: 'Company state.' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  state?: string | null;

  @ApiPropertyOptional({ example: 'General Contractor', nullable: true, description: 'Customer type.' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  customerType?: string | null;

  @ApiPropertyOptional({ example: 'Construction', nullable: true, description: 'Industry.' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  industry?: string | null;

  @ApiPropertyOptional({ example: 'billing@company.com', nullable: true, description: 'Billing email.' })
  @IsOptional()
  @IsEmail()
  @MaxLength(180)
  billingEmail?: string | null;

  @ApiPropertyOptional({ example: 'Net 30', nullable: true, description: 'Payment terms.' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  paymentTerms?: string | null;

  @ApiPropertyOptional({ example: 'LEAD', enum: ['LEAD', 'CUSTOMER'], description: 'Commercial status.' })
  @IsOptional()
  @IsIn(['LEAD', 'CUSTOMER'])
  customerStatus?: 'LEAD' | 'CUSTOMER';

  @ApiPropertyOptional({ example: 'Alex Johnson', nullable: true, description: 'Assigned account manager.' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  assignedAccountManager?: string | null;
}
