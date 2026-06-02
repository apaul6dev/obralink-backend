import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordRequestDto {
  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(120)
  currentPassword: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(120)
  newPassword: string;
}
