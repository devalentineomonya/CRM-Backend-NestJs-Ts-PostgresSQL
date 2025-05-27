import { Module } from '@nestjs/common';
import { UserVisitsService } from './user_visits.service';
import { UserVisitsController } from './user_visits.controller';

@Module({
  controllers: [UserVisitsController],
  providers: [UserVisitsService],
})
export class UserVisitsModule {}
