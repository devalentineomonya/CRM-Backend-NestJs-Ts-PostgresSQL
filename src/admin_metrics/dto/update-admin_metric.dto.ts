import { PartialType } from '@nestjs/mapped-types';
import { CreateAdminMetricDto } from './create-admin_metric.dto';

export class UpdateAdminMetricDto extends PartialType(CreateAdminMetricDto) {}
