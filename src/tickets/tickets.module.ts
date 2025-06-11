import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { Ticket } from './entities/ticket.entity';
import { User } from 'src/users/entities/user.entity';
import { Admin } from 'src/admins/entities/admin.entity';
import { MailService } from 'src/shared/mail/mail.service';
import { PermissionHelper } from 'src/shared/helpers/permission.helper';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, User, Admin])],
  controllers: [TicketsController],
  providers: [TicketsService, MailService, PermissionHelper],
})
export class TicketsModule {}
