import { MiddlewareConsumer, Module } from '@nestjs/common';
import { WelcomeController } from './welcome.controller';
import { UsersModule } from './users/users.module';
import { ProfileModule } from './profiles/profiles.module';
import { QuotesModule } from './quotes/quotes.module';
import { TicketsModule } from './tickets/tickets.module';
import { AdminsModule } from './admins/admins.module';
import { AdminMetricsModule } from './admin_metrics/admin_metrics.module';
import { UserVisitsModule } from './user_visits/user_visits.module';
import { AdminActivityLogsModule } from './admin_activity_logs/admin_activity_logs.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { AccessTokenGuard } from './auth/guards/access-token.guard';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/guards/roles.guard';
import { ContactHelper } from './shared/helpers/contact.helper';
import { LoggerMiddleware } from './logger.middleware';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { SeedModule } from './seed/seed.module';

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
    AuthModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.getOrThrow('THROTTLER_TTL'),
          limit: config.getOrThrow('THROTTLER_LIMIT'),
        },
      ],
    }),
    SeedModule,
  ],

  controllers: [WelcomeController],
  providers: [
    ContactHelper,

    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
