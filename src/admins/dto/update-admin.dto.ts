import { PartialType } from '@nestjs/swagger';
import { ApiExtraModels } from '@nestjs/swagger';
import { CreateAdminDto } from './create-admin.dto';

@ApiExtraModels(CreateAdminDto)
export class UpdateAdminDto extends PartialType(CreateAdminDto) {}
