import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from 'src/admins/entities/admin.entity';
import { User } from 'src/users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { UserVisitsService } from 'src/user_visits/user_visits.service';
import { UserVisit } from 'src/user_visits/entities/user_visit.entity';
import { PassportModule } from '@nestjs/passport';
import { RefreshTokenStrategy } from './strategy/refresh-token.strategy';
import { AccessTokenStrategy } from './strategy/access-token.strategy';
import { UsersModule } from 'src/users/users.module';
import { UserService } from 'src/users/users.service';
import { AdminsService } from 'src/admins/admins.service';
import { AdminsModule } from 'src/admins/admins.module';
import { PermissionHelper } from 'src/shared/helpers/permission.helper';
import { ContactHelper } from 'src/shared/helpers/contact.helper';
import { MailModule } from 'src/shared/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, User, UserVisit]),
    JwtModule.register({
      global: true,
    }),
    UsersModule,
    AdminsModule,
    PassportModule,
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    AdminsService,
    UserVisitsService,
    RefreshTokenStrategy,
    AccessTokenStrategy,
    PermissionHelper,
    ContactHelper,
  ],
})
export class AuthModule {}
