import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class RemoveRolesFromActorDto {
  @ApiProperty({ type: [String], format: 'uuid', example: ['0f1f66b6-7e0d-4cb0-a04e-3c2ecdcf0205'], description: 'Role ids to remove. IDs de roles a remover.' })
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  roleIds: string[];
}
