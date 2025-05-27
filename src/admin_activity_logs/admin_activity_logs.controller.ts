import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AdminActivityLogsService } from './admin_activity_logs.service';
import { CreateAdminActivityLogDto } from './dto/create-admin_activity_log.dto';
import { UpdateAdminActivityLogDto } from './dto/update-admin_activity_log.dto';

@Controller('admin-activity-logs')
export class AdminActivityLogsController {
  constructor(
    private readonly adminActivityLogsService: AdminActivityLogsService,
  ) {}

  @Post()
  create(@Body() createAdminActivityLogDto: CreateAdminActivityLogDto) {
    return this.adminActivityLogsService.create(createAdminActivityLogDto);
  }

  @Get()
  findAll() {
    return this.adminActivityLogsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminActivityLogsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAdminActivityLogDto: UpdateAdminActivityLogDto,
  ) {
    return this.adminActivityLogsService.update(+id, updateAdminActivityLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminActivityLogsService.remove(+id);
  }
}
