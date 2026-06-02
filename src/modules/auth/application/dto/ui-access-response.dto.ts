import { ApiProperty } from '@nestjs/swagger';

export class UiAccessResponseDto {
  @ApiProperty({ type: [String], example: ['dashboard', 'users', 'actors'] })
  screens: string[];

  @ApiProperty({ type: [String], example: ['users.create', 'actors.update'] })
  actions: string[];
}
