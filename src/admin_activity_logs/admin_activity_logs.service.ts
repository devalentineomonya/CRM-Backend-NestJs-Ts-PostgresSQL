import { Injectable } from '@nestjs/common';
import { CreateAdminActivityLogDto } from './dto/create-admin_activity_log.dto';
import { UpdateAdminActivityLogDto } from './dto/update-admin_activity_log.dto';

@Injectable()
export class AdminActivityLogsService {
  create(createAdminActivityLogDto: CreateAdminActivityLogDto) {
    return 'This action adds a new adminActivityLog';
  }

  findAll() {
    return `This action returns all adminActivityLogs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} adminActivityLog`;
  }

  update(id: number, updateAdminActivityLogDto: UpdateAdminActivityLogDto) {
    return `This action updates a #${id} adminActivityLog`;
  }

  remove(id: number) {
    return `This action removes a #${id} adminActivityLog`;
  }
}
