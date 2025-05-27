import { Module } from '@nestjs/common';
import { AdminMetricsService } from './admin_metrics.service';
import { AdminMetricsController } from './admin_metrics.controller';

@Module({
  controllers: [AdminMetricsController],
  providers: [AdminMetricsService],
})
export class AdminMetricsModule {}
