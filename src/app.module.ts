import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UsersModule } from './users/users.module';
import { ProfileModule } from './profiles/profiles.module';
import { QuotesModule } from './quotes/quotes.module';
import { TicketsModule } from './tickets/tickets.module';
import { AdminsModule } from './admins/admins.module';
import { AdminMetricsModule } from './admin_metrics/admin_metrics.module';
import { UserVisitsModule } from './user_visits/user_visits.module';
import { AdminActivityLogsModule } from './admin_activity_logs/admin_activity_logs.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    UsersModule,
    ProfileModule,
    QuotesModule,
    TicketsModule,
    AdminsModule,
    AdminMetricsModule,
    UserVisitsModule,
    AdminActivityLogsModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
