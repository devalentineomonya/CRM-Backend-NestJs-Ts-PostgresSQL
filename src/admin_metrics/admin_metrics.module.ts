import { Module } from '@nestjs/common';
import { AdminMetricsService } from './admin_metrics.service';
import { AdminMetricsController } from './admin_metrics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminMetric } from './entities/admin_metric.entity';
import { Quote } from 'src/quotes/entities/quote.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { UserVisit } from 'src/user_visits/entities/user_visit.entity';
import { AdminActivityLog } from 'src/admin_activity_logs/entities/admin_activity_log.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminMetric,
      User,
      Quote,
      Ticket,
      UserVisit,
      AdminActivityLog,
    ]),
  ],
  controllers: [AdminMetricsController],
  providers: [AdminMetricsService],
  exports: [AdminMetricsService],
})
export class AdminMetricsModule {}
