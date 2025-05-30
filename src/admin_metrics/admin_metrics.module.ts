import { Module } from '@nestjs/common';
import { AdminMetricsService } from './admin_metrics.service';
import { AdminMetricsController } from './admin_metrics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminMetric } from './entities/admin_metric.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AdminMetric])],
  controllers: [AdminMetricsController],
  providers: [AdminMetricsService],
})
export class AdminMetricsModule {}
