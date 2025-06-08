import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { AdminMetric } from './entities/admin_metric.entity';
import { MetricType } from './enums/metric-type.enum';
import { User } from '../users/entities/user.entity';
import { Quote } from 'src/quotes/entities/quote.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { UserVisit } from 'src/user_visits/entities/user_visit.entity';
import { AdminActivityLog } from 'src/admin_activity_logs/entities/admin_activity_log.entity';
@Injectable()
export class AdminMetricsService {
  private readonly logger = new Logger(AdminMetricsService.name);
  private readonly metricCache = new Map<string, number>();
  private readonly cacheTTL = 5 * 60 * 1000;

  constructor(
    @InjectRepository(AdminMetric)
    private metricRepository: Repository<AdminMetric>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Quote)
    private quoteRepository: Repository<Quote>,
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(UserVisit)
    private visitRepository: Repository<UserVisit>,
    @InjectRepository(AdminActivityLog)
    private activityRepository: Repository<AdminActivityLog>,
  ) {}

  async getMetrics(): Promise<AdminMetric[]> {
    const metrics = await this.metricRepository.find();
    return metrics;
  }

  async refreshAllMetrics(): Promise<void> {
    const metricTypes = Object.values(MetricType);
    for (const metric of metricTypes) {
      await this.calculateAndSaveMetric(metric);
    }
    this.logger.log('All dashboard metrics refreshed successfully');
  }

  async getMetricValue(type: MetricType): Promise<number> {
    const metric = await this.metricRepository.findOne({
      where: { metric_name: type },
    });

    if (metric) {
      this.metricCache.set(type.toString(), metric.metric_value);
      setTimeout(() => this.metricCache.delete(type), this.cacheTTL);
      return metric.metric_value;
    }

    return this.calculateAndSaveMetric(type);
  }

  private async calculateAndSaveMetric(type: MetricType): Promise<number> {
    let value: number;

    switch (type) {
      case MetricType.ACTIVE_USERS:
        value = await this.calculateActiveUsers();
        break;
      case MetricType.OPEN_TICKETS:
        value = await this.calculateOpenTickets();
        break;
      case MetricType.PENDING_QUOTES:
        value = await this.calculatePendingQuotes();
        break;
      case MetricType.NEW_VISITS_24H:
        value = await this.calculateNewVisits24h();
        break;
      case MetricType.ADMIN_ACTIVITY_24H:
        value = await this.calculateAdminActivity24h();
        break;
      case MetricType.RESOLVED_TICKETS_7D:
        value = await this.calculateResolvedTickets7d();
        break;
      default:
        value = 0;
    }

    await this.metricRepository.upsert(
      {
        metric_name: type,
        metric_value: value,
        last_updated: new Date(),
      },
      ['metric_name'],
    );

    this.metricCache.set(type, value);
    setTimeout(() => this.metricCache.delete(type), this.cacheTTL);

    return value;
  }

  private async calculateActiveUsers(): Promise<number> {
    return this.userRepository.count({
      where: { status: 'active' },
    });
  }

  private async calculateOpenTickets(): Promise<number> {
    return this.ticketRepository.count({
      where: { ticket_status: 'open' },
    });
  }

  private async calculatePendingQuotes(): Promise<number> {
    return this.quoteRepository.count({
      where: { status: 'pending' },
    });
  }

  private async calculateNewVisits24h(): Promise<number> {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    return this.visitRepository.count({
      where: {
        visit_time: MoreThanOrEqual(twentyFourHoursAgo),
      },
    });
  }

  private async calculateAdminActivity24h(): Promise<number> {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    return this.activityRepository.count({
      where: {
        action_time: MoreThanOrEqual(twentyFourHoursAgo),
      },
    });
  }

  private async calculateResolvedTickets7d(): Promise<number> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return this.ticketRepository.count({
      where: {
        ticket_status: 'closed',
        resolved_date: MoreThanOrEqual(sevenDaysAgo),
      },
    });
  }
}
