import { Module } from '@nestjs/common';
import { UserVisitsService } from './user_visits.service';
import { UserVisitsController } from './user_visits.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserVisit } from './entities/user_visit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserVisit])],
  controllers: [UserVisitsController],
  providers: [UserVisitsService],
})
export class UserVisitsModule {}
