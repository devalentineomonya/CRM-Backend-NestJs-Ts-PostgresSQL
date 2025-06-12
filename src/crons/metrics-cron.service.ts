import { Injectable, Logger } from '@nestjs/common';

import { AdminMetricsService } from '../admin_metrics/admin_metrics.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class MetricsCronService {
  private readonly logger = new Logger(MetricsCronService.name);

  constructor(private readonly metricsService: AdminMetricsService) {}

  // Run every 30 seconds
  @Cron('*/30 * * * * *')
  async refreshMetricsJob() {
    this.logger.log('Running metrics refresh job');
    try {
      await this.metricsService.refreshAllMetrics();
      this.logger.log('Metrics refreshed successfully');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.stack : 'Unknown error';
      this.logger.error('Failed to refresh metrics', errorMessage);
    }
  }
}
