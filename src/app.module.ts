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
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { SeedModule } from './seed/seed.module';
// import { MetricsCronModule } from './crons/metrics-cron.module';
import { createKeyv, Keyv } from '@keyv/redis';
import { CacheableMemory } from 'cacheable';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    // MetricsCronModule,
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
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: (configService: ConfigService) => {
        return {
          ttl: 60000,
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: 30000, lruSize: 5000 }),
            }),
            createKeyv(configService.getOrThrow<string>('REDIS_URL')),
          ],
        };
      },
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule, PrometheusModule.register()],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get('THROTTLER_TTL') ?? 60000,
          limit: config.get('THROTTLER_LIMIT') ?? 100,
        },
      ],
    }),
    SeedModule,
  ],

  controllers: [WelcomeController],
  providers: [
    ContactHelper,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
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
