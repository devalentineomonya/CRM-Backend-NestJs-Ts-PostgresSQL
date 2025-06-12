import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { UserVisit } from './entities/user_visit.entity';
import { User } from '../users/entities/user.entity';
import { CreateUserVisitDto } from './dto/create-user_visit.dto';

@Injectable()
export class UserVisitsService {
  constructor(
    @InjectRepository(UserVisit)
    private readonly visitRepository: Repository<UserVisit>,
  ) {}

  async createVisit(
    user: User,
    createUserVisitDto: CreateUserVisitDto,
  ): Promise<UserVisit> {
    const visit = this.visitRepository.create({
      ...createUserVisitDto,
      user,
    });
    return this.visitRepository.save(visit);
  }

  async getUserVisits(userId: string, limit?: number): Promise<UserVisit[]> {
    return this.visitRepository.find({
      where: { user: { user_id: userId } },
      order: { visit_time: 'DESC' },
      take: limit,
    });
  }

  async getUserVisitsWithCount(
    userId: string,
  ): Promise<{ visits: UserVisit[]; count: number }> {
    const [visits, count] = await this.visitRepository.findAndCount({
      where: { user: { user_id: userId } },
      order: { visit_time: 'DESC' },
    });
    return { visits, count };
  }

  async getRecentVisits(days = 7): Promise<UserVisit[]> {
    const date = new Date();
    date.setDate(date.getDate() - days);

    return this.visitRepository.find({
      where: { visit_time: MoreThan(date) },
      order: { visit_time: 'DESC' },
      relations: ['user'],
    });
  }

  async getAllVisits(): Promise<UserVisit[]> {
    return this.visitRepository.find({
      order: { visit_time: 'DESC' },
      relations: ['user'],
    });
  }
  async getVisitCountPerUser(): Promise<
    { userId: string; fullName: string; count: number }[]
  > {
    const result = await this.visitRepository
      .createQueryBuilder('visit')
      .leftJoinAndSelect('visit.user', 'user')
      .select('user.user_id', 'userId')
      .addSelect("CONCAT(user.first_name, ' ', user.last_name)", 'fullName')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.user_id')
      .addGroupBy('user.first_name')
      .addGroupBy('user.last_name')
      .getRawMany();

    return result as { userId: string; fullName: string; count: number }[];
  }
}
