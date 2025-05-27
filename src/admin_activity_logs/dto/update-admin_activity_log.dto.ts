import { PartialType } from '@nestjs/mapped-types';
import { CreateAdminActivityLogDto } from './create-admin_activity_log.dto';

export class UpdateAdminActivityLogDto extends PartialType(
  CreateAdminActivityLogDto,
) {}
