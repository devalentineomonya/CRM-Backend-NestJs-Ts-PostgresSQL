import { Module } from '@nestjs/common';
import { AdminActivityLogsService } from './admin_activity_logs.service';
import { AdminActivityLogsController } from './admin_activity_logs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminActivityLog } from './entities/admin_activity_log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AdminActivityLog])],
  controllers: [AdminActivityLogsController],
  providers: [AdminActivityLogsService],
})
export class AdminActivityLogsModule {}
