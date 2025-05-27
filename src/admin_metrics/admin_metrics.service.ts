import { Injectable } from '@nestjs/common';
import { CreateAdminMetricDto } from './dto/create-admin_metric.dto';
import { UpdateAdminMetricDto } from './dto/update-admin_metric.dto';

@Injectable()
export class AdminMetricsService {
  create(createAdminMetricDto: CreateAdminMetricDto) {
    return 'This action adds a new adminMetric';
  }

  findAll() {
    return `This action returns all adminMetrics`;
  }

  findOne(id: number) {
    return `This action returns a #${id} adminMetric`;
  }

  update(id: number, updateAdminMetricDto: UpdateAdminMetricDto) {
    return `This action updates a #${id} adminMetric`;
  }

  remove(id: number) {
    return `This action removes a #${id} adminMetric`;
  }
}
