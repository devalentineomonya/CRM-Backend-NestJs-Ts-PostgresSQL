import { PartialType } from '@nestjs/swagger';
import { CreateProfileDto } from './create-profile.dto';
import { ApiExtraModels } from '@nestjs/swagger';
@ApiExtraModels(CreateProfileDto)
export class UpdateProfileDto extends PartialType(CreateProfileDto) {}
