import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { AdminActivityLogsService } from './admin_activity_logs.service';
import { CreateAdminActivityLogDto } from './dto/create-admin_activity_log.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Admin Activity Logs')
@Controller('admin-activity-logs')
export class AdminActivityLogsController {
  constructor(private readonly logsService: AdminActivityLogsService) {}

  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Record an admin activity' })
  create(@Body() createAdminActivityLogDto: CreateAdminActivityLogDto) {
    const mockAdmin = {
      admin_id: 1,
      username: 'admin_user',
      email: 'admin@example.com',
    };

    return this.logsService.createLog(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockAdmin as any,
      createAdminActivityLogDto,
    );
  }

  @ApiBearerAuth()
  @Get('admin/:adminId')
  @ApiOperation({ summary: 'Get logs for a specific admin' })
  getAdminLogs(@Param('adminId') adminId: string) {
    return this.logsService.getAdminLogs(adminId);
  }

  @ApiBearerAuth()
  @Get('recent')
  @ApiOperation({ summary: 'Get recent admin activities' })
  getRecentLogs() {
    return this.logsService.getRecentLogs();
  }

  @ApiBearerAuth()
  @Get('action/:actionType')
  @ApiOperation({ summary: 'Get logs by action type' })
  getLogsByActionType(@Param('actionType') actionType: string) {
    return this.logsService.getLogsByActionType(actionType);
  }
}
