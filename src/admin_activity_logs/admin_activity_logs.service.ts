import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminActivityLog } from './entities/admin_activity_log.entity';
import { Admin } from '../admins/entities/admin.entity';
import { CreateAdminActivityLogDto } from './dto/create-admin_activity_log.dto';

@Injectable()
export class AdminActivityLogsService {
  constructor(
    @InjectRepository(AdminActivityLog)
    private readonly logRepository: Repository<AdminActivityLog>,
  ) {}

  async createLog(
    admin: Admin,
    createAdminActivityLogDto: CreateAdminActivityLogDto,
  ): Promise<AdminActivityLog> {
    const log = this.logRepository.create({
      ...createAdminActivityLogDto,
      admin,
    });
    return this.logRepository.save(log);
  }

  async getAdminLogs(adminId: string): Promise<AdminActivityLog[]> {
    return this.logRepository.find({
      where: { admin: { admin_id: adminId } },
      order: { action_time: 'DESC' },
      take: 100,
    });
  }

  async getRecentLogs(days = 7): Promise<AdminActivityLog[]> {
    const date = new Date();
    date.setDate(date.getDate() - days);

    return this.logRepository.find({
      where: { action_time: new Date(date) },
      order: { action_time: 'DESC' },
      relations: ['admin'],
      take: 100,
    });
  }

  async getLogsByActionType(
    actionType: string,
    limit = 100,
  ): Promise<AdminActivityLog[]> {
    return this.logRepository.find({
      where: { action_type: actionType },
      order: { action_time: 'DESC' },
      relations: ['admin'],
      take: limit,
    });
  }
}
