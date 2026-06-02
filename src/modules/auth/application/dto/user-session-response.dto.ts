import { ApiProperty } from '@nestjs/swagger';

export class UserSessionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ nullable: true })
  ipAddress: string | null;

  @ApiProperty({ nullable: true })
  userAgent: string | null;

  @ApiProperty()
  loginAt: Date;

  @ApiProperty({ nullable: true })
  logoutAt: Date | null;

  @ApiProperty()
  expiresAt: Date;
}
