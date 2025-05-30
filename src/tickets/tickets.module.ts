import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { Ticket } from './entities/ticket.entity';
import { User } from 'src/users/entities/user.entity';
import { Admin } from 'src/admins/entities/admin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, User, Admin])],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
