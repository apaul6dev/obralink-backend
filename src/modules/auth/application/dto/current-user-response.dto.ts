import { ApiProperty } from '@nestjs/swagger';

export class CurrentUserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  tenantId: string | null;

  @ApiProperty()
  userType: string;

  @ApiProperty()
  sessionId: string;

  @ApiProperty({ type: [String] })
  roles: string[];

  @ApiProperty({ type: [String] })
  permissions: string[];
}
