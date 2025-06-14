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

    try {
      const { users, admins } = await this.createBaseEntities();

      const dbConfig = {
        type: 'postgres',
        host: this.configService.get<string>('DATABASE_HOST'),
        port: this.configService.get<number>('DATABASE_PORT'),
        username: this.configService.get<string>('DATABASE_USER'),
        password: this.configService.get<string>('DATABASE_PASSWORD'),
        database: this.configService.get<string>('DATABASE_DB'),
        ...(this.configService.get<string>('NODE_ENV') === 'production'
          ? { ssl: true }
          : {}),
      };

      const workerResults = await Promise.allSettled([
        this.runWorkerForEntity<{ profiles: number }>(
          'profiles',
          dbConfig,
          users.map((u) => u.user_id),
        ),
        this.runWorkerForEntity<{ quotes: number }>(
          'quotes',
          dbConfig,
          users.map((u) => u.user_id),
        ),
        this.runWorkerForEntity<{ visits: number }>(
          'visits',
          dbConfig,
          users.map((u) => u.user_id),
        ),
        this.runWorkerForEntity<{ tickets: number }>(
          'tickets',
          dbConfig,
          users.map((u) => u.user_id),
          admins.map((a) => a.admin_id),
        ),
        this.runWorkerForEntity<{ logs: number }>(
          'admin-logs',
          dbConfig,
          admins.map((a) => a.admin_id),
        ),
      ]);

      // Process results
      let totalProfiles = 0;
      let totalQuotes = 0;
      let totalVisits = 0;
      let totalTickets = 0;
      let totalLogs = 0;

      workerResults.forEach((result, i) => {
        const entities = [
          'Profiles',
          'Quotes',
          'Visits',
          'Tickets',
          'Admin Logs',
        ];
        if (result.status === 'fulfilled') {
          const data = result.value;
          this.logger.log(
            `${entities[i]} worker completed: ${JSON.stringify(data)}`,
          );

          // Aggregate counts
          if ('profiles' in data) totalProfiles = data.profiles;
          if ('quotes' in data) totalQuotes = data.quotes;
          if ('visits' in data) totalVisits = data.visits;
          if ('tickets' in data) totalTickets = data.tickets;
          if ('logs' in data) totalLogs = data.logs;
        } else {
          this.logger.error(`${entities[i]} worker failed: ${result.reason}`);
        }
      });

      this.logger.log('Database seeding completed');
      this.logger.log('Seeding summary:');
      this.logger.log(`- Profiles: ${totalProfiles}`);
      this.logger.log(`- Quotes: ${totalQuotes}`);
      this.logger.log(`- Visits: ${totalVisits}`);
      this.logger.log(`- Tickets: ${totalTickets}`);
      this.logger.log(`- Admin Logs: ${totalLogs}`);
    } catch (error: unknown) {
      this.logger.error('Seeding failed', (error as Error).stack);
      throw error;
    }
  }

  private runWorkerForEntity<T>(
    entityType: 'profiles' | 'quotes' | 'visits' | 'tickets' | 'admin-logs',
    dbConfig: WorkerPayload['dbConfig'],
    userIds?: string[],
    adminIds?: string[],
  ): Promise<T> {
    const workerId = `${entityType}-${Math.random().toString(36).substring(7)}`;
    this.logger.log(`Starting ${entityType} worker ${workerId}`);

    return this.runWorker<T>(join(__dirname, `${entityType}.worker.js`), {
      dbConfig,
      workerId,
      userIds,
      adminIds,
    });
  }

  private async createBaseEntities() {
    this.logger.log('Creating base entities (users and admins)');

    const createUsers = async () => {
      const users: User[] = [];
      const userBatchSize = 5;
      const totalUsers = 5;

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
      const adminBatchSize = 5;
      const totalAdmins = 5;

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
