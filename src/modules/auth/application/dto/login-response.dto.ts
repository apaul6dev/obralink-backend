import { ApiProperty } from '@nestjs/swagger';

export class LoginUserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ nullable: true })
  tenantId: string | null;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  userType: string;

  @ApiProperty({ type: [String] })
  roles: string[];

  @ApiProperty({ type: [String] })
  permissions: string[];
}

export class LoginResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType: 'Bearer';

  @ApiProperty()
  expiresIn: number;

  @ApiProperty()
  sessionId: string;

  @ApiProperty({ type: LoginUserResponseDto })
  user: LoginUserResponseDto;
}
