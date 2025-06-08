import { Controller, Get } from '@nestjs/common';
import { AdminMetricsService } from './admin_metrics.service';
import { AdminMetric } from './entities/admin_metric.entity';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('admin-metrics')
export class AdminMetricsController {
  constructor(private readonly metricsService: AdminMetricsService) {}
  @ApiBearerAuth()
  @Get()
  async getMetrics(): Promise<AdminMetric[]> {
    return await this.metricsService.getMetrics();
  }
  @ApiBearerAuth()
  @Get('refresh')
  async refreshMetrics(): Promise<{ message: string }> {
    await this.metricsService.refreshAllMetrics();
    return { message: 'Dashboard metrics refreshed successfully' };
  }
}
