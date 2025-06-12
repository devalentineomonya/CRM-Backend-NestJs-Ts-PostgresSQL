import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { UserService } from './users.service';
import { UserController } from './users.controller';
import { User } from './entities/user.entity';
import { PermissionHelper } from 'src/shared/helpers/permission.helper';
import { MailService } from 'src/shared/mail/mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, PermissionHelper, MailService],
})
export class UsersModule {}
