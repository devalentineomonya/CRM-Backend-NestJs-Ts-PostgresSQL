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
import { WorkerPayload, WorkerResult } from './worker-data.types';
import { ConfigService } from '@nestjs/config';

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
        ssl: this.configService.get<string>('NODE_ENV') !== 'development',
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
        this.runWorkerForEntity<{ 'admin-logs': number }>(
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
        const entityTypes = [
          'profiles',
          'quotes',
          'visits',
          'tickets',
          'admin-logs',
        ];

        if (result.status === 'fulfilled') {
          const data = result.value;
          this.logger.log(`Worker completed: ${JSON.stringify(data)}`);

          const entityType = entityTypes[i];
          if (data && data[entityType]) {
            const count = data[entityType] as number;

            if (count !== undefined) {
              switch (i) {
                case 0:
                  totalProfiles = count;
                  break;
                case 1:
                  totalQuotes = count;
                  break;
                case 2:
                  totalVisits = count;
                  break;
                case 3:
                  totalTickets = count;
                  break;
                case 4:
                  totalLogs = count;
                  break;
              }
            } else {
              this.logger.warn(
                `Missing count for ${entityType} in worker results`,
              );
            }
          } else {
            this.logger.warn(`Worker result missing 'counts' property`);
          }
        } else {
          this.logger.error(`Worker failed: ${result.reason}`);
        }
      });

      this.logger.log('Database seeding completed');
      this.logger.log('Seeding summary:');
      this.logger.log(`- Profiles: ${totalProfiles}`);
      this.logger.log(`- Quotes: ${totalQuotes}`);
      this.logger.log(`- Visits: ${totalVisits}`);
      this.logger.log(`- Tickets: ${totalTickets}`);
      this.logger.log(`- Admin Logs: ${totalLogs}`);
      return {
        success: true,
        message: 'Database seeding completed successfully',
        counts: {
          profiles: totalProfiles,
          quotes: totalQuotes,
          visits: totalVisits,
          tickets: totalTickets,
          adminLogs: totalLogs,
        },
      };
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error('Seeding failed', err.stack);
      return {
        success: false,
        message: 'Database seeding failed',
        error: err.message,
      };
    }
  }

  private async createBaseEntities() {
    this.logger.log('Creating base entities (users and admins)');

    const createUsers = async () => {
      const users: User[] = [];
      const userBatchSize = 100;
      const totalUsers = 10_000;

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
      const adminBatchSize = 100;
      const totalAdmins = 4_500;

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
      let settled = false;

      worker.on('message', (data: WorkerResult) => {
        if (settled) return;

        // Handle error messages
        if (data.type === 'error' || data.status === 'error') {
          settled = true;
          const errorMsg = data.error || data.message || 'Unknown error';
          this.logger.error(`Worker ${workerData.workerId} error: ${errorMsg}`);
          reject(new Error(errorMsg));
          return;
        }

        // Handle progress messages (both formats)
        if (data.type === 'progress' || data.status === 'progress') {
          const message =
            data.message ||
            (data.usersProcessed !== undefined
              ? `Processed ${data.usersProcessed}/${data.totalUsers}`
              : data.adminsProcessed !== undefined
                ? `Processed ${data.adminsProcessed}/${data.totalAdmins}`
                : 'Progress update');
          this.logger.log(`[${workerData.workerId}] ${message}`);
          return;
        }

        // Handle chunk messages
        if (data.status === 'chunk') {
          this.logger.log(
            `[${workerData.workerId}] Processed chunk of ${data.chunkSize} records`,
          );
          return;
        }

        // Handle completion via count property
        if ('count' in data) {
          settled = true;
          this.logger.log(`Worker completed: ${workerData.workerId}`);
          resolve({ [workerData.entityType]: data.count } as T);
          return;
        }

        // Handle direct result objects
        if (
          'profiles' in data ||
          'quotes' in data ||
          'visits' in data ||
          'tickets' in data ||
          'logs' in data
        ) {
          settled = true;
          this.logger.log(`Worker completed: ${workerData.workerId}`);
          resolve(data as T);
          return;
        }

        // Handle new format completion
        if (data.type === 'done') {
          settled = true;
          this.logger.log(`Worker completed: ${workerData.workerId}`);
          resolve(data.counts as T);
          return;
        }

        this.logger.warn(
          `Unknown message format from worker ${workerData.workerId}:`,
          data,
        );
      });

      worker.on('error', (error) => {
        if (settled) return;
        settled = true;
        this.logger.error(`Worker error: ${workerData.workerId}`, error);
        reject(error);
      });

      worker.on('exit', (code) => {
        if (settled) return;
        settled = true;

        if (code !== 0) {
          const errorMsg = `Worker ${workerData.workerId} exited with code ${code}`;
          this.logger.error(errorMsg);
          reject(new Error(errorMsg));
        } else {
          const errorMsg = `Worker ${workerData.workerId} exited without sending done message`;
          this.logger.error(errorMsg);
          reject(new Error(errorMsg));
        }
      });
    });
  }

  private runWorkerForEntity<T>(
    entityType: 'profiles' | 'quotes' | 'visits' | 'tickets' | 'admin-logs',
    dbConfig: WorkerPayload['dbConfig'],
    userIds?: string[],
    adminIds?: string[],
  ): Promise<T> {
    const workerId = `${entityType}-${Math.random().toString(36).substring(7)}`;
    this.logger.log(`Starting ${entityType} worker ${workerId}`);

    return this.runWorker<T>(
      join(__dirname, 'workers', `${entityType}.worker.js`),
      {
        dbConfig,
        workerId,
        entityType,
        userIds,
        adminIds,
      },
    );
  }
}
