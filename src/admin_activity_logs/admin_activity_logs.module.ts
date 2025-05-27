import { Module } from '@nestjs/common';
import { AdminActivityLogsService } from './admin_activity_logs.service';
import { AdminActivityLogsController } from './admin_activity_logs.controller';

@Module({
  controllers: [AdminActivityLogsController],
  providers: [AdminActivityLogsService],
})
export class AdminActivityLogsModule {}
