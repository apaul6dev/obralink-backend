import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class ForgotPasswordRequestDto {
  @ApiProperty({ example: 'user@obralink.local' })
  @IsEmail()
  @MaxLength(180)
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(60)
  companyIdentifier?: string;
}
