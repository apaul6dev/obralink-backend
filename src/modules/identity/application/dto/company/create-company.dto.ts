import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Obralink Construction', description: 'Company display name. Nombre visible de la empresa.' })
  @IsString()
  @MaxLength(160)
  name: string;

  @ApiPropertyOptional({ example: 'Obralink Construction LLC', description: 'Legal company name. Razón social de la empresa.' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  legalName?: string;

  @ApiPropertyOptional({ example: '1799999999001', description: 'Company tax identifier. Identificador fiscal de la empresa.' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  taxId?: string;

  @ApiPropertyOptional({ example: 'Jane Smith', description: 'Primary contact name.' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  contactName?: string;

  @ApiPropertyOptional({ example: 'contact@company.com', description: 'Primary contact email.' })
  @IsOptional()
  @IsEmail()
  @MaxLength(180)
  email?: string;

  @ApiPropertyOptional({ example: '+1 555 123 4567', description: 'Primary contact phone.' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @ApiPropertyOptional({ example: '100 Main St', description: 'Company address.' })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  address?: string;

  @ApiPropertyOptional({ example: 'Miami', description: 'Company city.' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @ApiPropertyOptional({ example: 'FL', description: 'Company state.' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  state?: string;

  @ApiPropertyOptional({ example: 'General Contractor', description: 'Customer type.' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  customerType?: string;

  @ApiPropertyOptional({ example: 'Construction', description: 'Industry.' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  industry?: string;

  @ApiPropertyOptional({ example: 'billing@company.com', description: 'Billing email.' })
  @IsOptional()
  @IsEmail()
  @MaxLength(180)
  billingEmail?: string;

  @ApiPropertyOptional({ example: 'Net 30', description: 'Payment terms.' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  paymentTerms?: string;

  @ApiPropertyOptional({ example: 'LEAD', enum: ['LEAD', 'CUSTOMER'], description: 'Commercial status.' })
  @IsOptional()
  @IsIn(['LEAD', 'CUSTOMER'])
  customerStatus?: 'LEAD' | 'CUSTOMER';

  @ApiPropertyOptional({ example: 'Alex Johnson', description: 'Assigned account manager.' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  assignedAccountManager?: string;
}
