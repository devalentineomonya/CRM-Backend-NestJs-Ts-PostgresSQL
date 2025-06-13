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
import { WorkerPayload } from './worker-data.types';
import { ConfigService } from '@nestjs/config'; // Add this import

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
    private configService: ConfigService,
  ) {}

  async seed() {
    this.logger.log('Starting database seeding');
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // await this.createBaseEntities();

      // Get database configuration from environment
      const dbConfig = {
        type: 'postgres',
        host: this.configService.get<string>('DATABASE_HOST'),
        port: this.configService.get<number>('DATABASE_PORT'),
        username: this.configService.get<string>('DATABASE_USER'),
        password: this.configService.get<string>('DATABASE_PASSWORD'),
        database: this.configService.get<string>('DATABASE_DB'),
      };

      const workerId = Math.random().toString(36).substring(7);
      this.logger.log(`Starting user data worker ${workerId}`);

      const [userDataResult, adminLogsResult] = await Promise.allSettled([
        this.runWorker<{
          success: boolean;
          profiles: number;
          quotes: number;
          visits: number;
          tickets: number;
        }>(join(__dirname, 'user-data.worker.js'), {
          dbConfig,
          workerId,
        }),
        this.runWorker<Omit<AdminActivityLog, 'log_id'>[]>(
          join(__dirname, 'admin-data.worker.js'),
          {
            dbConfig,
            workerId: Math.random().toString(36).substring(7),
          },
        ),
      ]);

      // Handle user data worker result
      if (userDataResult.status === 'fulfilled') {
        const userData = userDataResult.value;
        if (userData.success) {
          this.logger.log(`Worker ${workerId} completed. Generated:`, {
            profiles: userData.profiles,
            quotes: userData.quotes,
            visits: userData.visits,
            tickets: userData.tickets,
          });
        } else {
          throw new Error('User data worker failed');
        }
      } else {
        this.logger.error(`Worker ${workerId} failed:`, userDataResult.reason);
        throw new Error('User data worker failed');
      }

      // Handle admin logs worker result
      if (adminLogsResult.status === 'fulfilled') {
        const adminLogs = adminLogsResult.value;
        this.logger.log(`Saved ${adminLogs.length} admin activity logs`);
      } else {
        this.logger.error(
          'Failed to retrieve admin logs:',
          adminLogsResult.reason,
        );
        throw new Error('Admin logs worker failed');
      }

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

  private cleanObject<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item: T) => this.cleanObject(item)) as unknown as T;
    }

    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (
        key.startsWith('__') ||
        [
          'user',
          'admin',
          'assigned_admin',
          'profile',
          'quotes',
          'tickets',
          'visits',
        ].includes(key)
      ) {
        continue;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const cleanedValue = this.cleanObject(value);
      if (cleanedValue !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        result[key] = cleanedValue;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result;
  }

  private async createBaseEntities() {
    this.logger.log('Creating base entities (users and admins)');

    const createUsers = async () => {
      const users: User[] = [];
      const userBatchSize = 500;
      const totalUsers = 50000;

      for (let i = 0; i < totalUsers; i += userBatchSize) {
        const batch = Array.from(
          { length: Math.min(userBatchSize, totalUsers - i) },
          () => {
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
          },
        );

        try {
          const savedBatch = await this.userRepo.save(batch);
          users.push(...savedBatch);
          this.logger.log(`Created ${users.length}/${totalUsers} users`);
        } catch (error) {
          this.logger.error(`Failed to create a batch of users:`, error);
        }
      }

      return users;
    };

    const createAdmins = async () => {
      const admins: Admin[] = [];
      const adminBatchSize = 500;
      const totalAdmins = 5000;

      for (let i = 0; i < totalAdmins; i += adminBatchSize) {
        const batch = Array.from(
          { length: Math.min(adminBatchSize, totalAdmins - i) },
          () => {
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
          },
        );

        try {
          const savedBatch = await this.adminRepo.save(batch);
          admins.push(...savedBatch);
          this.logger.log(`Created ${admins.length}/${totalAdmins} admins`);
        } catch (error) {
          this.logger.error(`Failed to create a batch of admins:`, error);
        }
      }

      return admins;
    };

    const [users, admins] = await Promise.all([createUsers(), createAdmins()]);
    return { users, admins };
  }

  private runWorker<T>(path: string, workerData: WorkerPayload): Promise<T> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(path, { workerData });

      worker.on('message', (data: { error?: string }) => {
        if (data.error) {
          this.logger.error(
            `Worker error: ${workerData.workerId || 'unknown'}`,
            data.error,
          );
          reject(new Error(data.error));
        } else {
          this.logger.log(
            `Worker completed: ${workerData.workerId || 'unknown'}`,
          );
          resolve(data as T);
        }
      });

      worker.on('error', (error) => {
        this.logger.error(
          `Worker error: ${workerData.workerId || 'unknown'}`,
          error,
        );
        reject(error);
      });

      worker.on('exit', (code) => {
        if (code !== 0) {
          const error = new Error(
            `Worker ${workerData.workerId || 'unknown'} stopped with exit code ${code}`,
          );
          this.logger.error(error.message);
          reject(error);
        }
      });
    });
  }
}
