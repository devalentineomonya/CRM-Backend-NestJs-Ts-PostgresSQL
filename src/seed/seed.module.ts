import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from 'src/admins/entities/admin.entity';
import { AdminActivityLog } from 'src/admin_activity_logs/entities/admin_activity_log.entity';
import { AdminMetric } from 'src/admin_metrics/entities/admin_metric.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { Quote } from 'src/quotes/entities/quote.entity';
import { UserVisit } from 'src/user_visits/entities/user_visit.entity';
import { User } from 'src/users/entities/user.entity';
import { Profile } from 'src/profiles/entities/profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Admin,
      AdminActivityLog,
      AdminMetric,
      Ticket,
      Quote,
      UserVisit,
      Profile,
    ]),
  ],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
