import { PartialType } from '@nestjs/swagger';
import { CreateAppModuleDto } from './create-app-module.dto';

export class UpdateAppModuleDto extends PartialType(CreateAppModuleDto) {}
