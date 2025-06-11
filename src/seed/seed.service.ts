import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Worker } from 'worker_threads';
import { join } from 'path';
import {
  Admin,
  AdminActivityLog,
  Quote,
  Ticket,
  User,
  UserVisit,
  Profile,
} from './index';
import { faker } from '@faker-js/faker';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Admin) private adminRepo: Repository<Admin>,
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
    @InjectRepository(Quote) private quoteRepo: Repository<Quote>,
    @InjectRepository(UserVisit) private visitRepo: Repository<UserVisit>,
    @InjectRepository(Ticket) private ticketRepo: Repository<Ticket>,
    @InjectRepository(AdminActivityLog)
    private logRepo: Repository<AdminActivityLog>,
    private dataSource: DataSource,
  ) {}

  async seed() {
    this.logger.log('Starting database seeding');
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Create base users and admins
      const { users, admins } = await this.createBaseEntities();

      // Generate related entities using workers
      const [userData, adminLogs] = await Promise.all([
        this.runWorker<{
          profiles: Profile[];
          quotes: Quote[];
          visits: UserVisit[];
          tickets: Ticket[];
        }>(join(__dirname, 'user-data.worker.js'), {
          users,
          admins,
        }),
        this.runWorker<AdminActivityLog[]>(
          join(__dirname, 'admin-data.worker.js'),
          { admins },
        ),
      ]);

      await this.batchSave(Profile, userData.profiles);
      await this.batchSave(Quote, userData.quotes);
      await this.batchSave(UserVisit, userData.visits);
      await this.batchSave(Ticket, userData.tickets);
      await this.batchSave(AdminActivityLog, adminLogs);

      await queryRunner.commitTransaction();
      this.logger.log('Database seeding completed successfully');
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Seeding failed', (error as Error).stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async batchSave<T>(entity: any, data: T[], batchSize = 1000) {
    for (let i = 0; i < data.length; i += batchSize) {
      const chunk = data.slice(i, i + batchSize);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await this.dataSource.manager.insert(entity, chunk);
    }
  }

  private async createBaseEntities() {
    const users = await this.userRepo.save(
      Array.from({ length: 50000 }, () => {
        const user = new User();
        user.first_name = faker.person.firstName();
        user.last_name = faker.person.lastName();
        user.email = faker.internet.email();
        user.phone_number = faker.phone.number();
        user.account_type = faker.helpers.arrayElement(['free', 'premium']);
        user.status = faker.helpers.arrayElement(['active', 'inactive']);
        user.profile_picture = faker.internet.url();
        user.password = 'Password123!';
        return user;
      }),
    );

    const admins = await this.adminRepo.save(
      Array.from({ length: 5000 }, () => {
        const admin = new Admin();
        admin.first_name = faker.person.firstName();
        admin.last_name = faker.person.lastName();
        admin.email = faker.internet.email();
        admin.password = 'AdminPassword123!';
        admin.role = faker.helpers.arrayElement([
          'super',
          'support',
          'quotations',
          'system',
        ]);
        return admin;
      }),
    );
    return { users, admins };
  }

  private runWorker<T>(path: string, workerData: any): Promise<T> {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const worker = new Worker(path, { workerData });
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0)
          reject(new Error(`Worker stopped with exit code ${code}`));
      });
    });
  }
}
