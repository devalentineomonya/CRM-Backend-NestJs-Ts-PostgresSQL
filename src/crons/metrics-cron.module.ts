import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule/dist';
import { MetricsCronService } from './metrics-cron.service';
import { AdminMetricsModule } from 'src/admin_metrics/admin_metrics.module';

@Module({
  imports: [ScheduleModule.forRoot(), AdminMetricsModule],
  providers: [MetricsCronService],
})
export class MetricsCronModule {}
