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

      // Create base users and admins with smaller batches
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

      // Use smaller batch sizes and clean data before insertion
      await this.batchSaveWithCleaning(Profile, userData.profiles, 100);
      await this.batchSaveWithCleaning(Quote, userData.quotes, 50);
      await this.batchSaveWithCleaning(UserVisit, userData.visits, 100);
      await this.batchSaveWithCleaning(Ticket, userData.tickets, 50);
      await this.batchSaveWithCleaning(AdminActivityLog, adminLogs, 100);

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

  // New method that cleans data and uses smaller batches
  async batchSaveWithCleaning<T>(entity: any, data: T[], batchSize = 100) {
    this.logger.log(`Saving ${data.length} records of ${entity.name} in batches of ${batchSize}`);
    
    for (let i = 0; i < data.length; i += batchSize) {
      const chunk = data.slice(i, i + batchSize);
      
      // Clean the data to remove circular references and undefined values
      const cleanedChunk = chunk.map(item => this.cleanObject(item));
      
      try {
        await this.dataSource.manager.insert(entity, cleanedChunk);
        
        // Log progress every 1000 records
        if ((i + batchSize) % 1000 === 0 || i + batchSize >= data.length) {
          this.logger.log(`Processed ${Math.min(i + batchSize, data.length)}/${data.length} ${entity.name} records`);
        }
      } catch (error) {
        this.logger.error(`Failed to insert batch ${i}-${i + batchSize} for ${entity.name}:`, error);
        throw error;
      }
    }
  }

  // Alternative method using query builder for better performance
  async batchSaveWithQueryBuilder<T>(entity: any, data: T[], batchSize = 100) {
    this.logger.log(`Saving ${data.length} records of ${entity.name} using query builder`);
    
    for (let i = 0; i < data.length; i += batchSize) {
      const chunk = data.slice(i, i + batchSize);
      const cleanedChunk = chunk.map(item => this.cleanObject(item));
      
      try {
        await this.dataSource
          .createQueryBuilder()
          .insert()
          .into(entity)
          .values(cleanedChunk)
          .execute();
          
        if ((i + batchSize) % 1000 === 0 || i + batchSize >= data.length) {
          this.logger.log(`Processed ${Math.min(i + batchSize, data.length)}/${data.length} ${entity.name} records`);
        }
      } catch (error) {
        this.logger.error(`Failed to insert batch ${i}-${i + batchSize} for ${entity.name}:`, error);
        throw error;
      }
    }
  }

  // Clean object to remove circular references and undefined values
  private cleanObject(obj: any): any {
    const seen = new WeakSet();
    
    const clean = (item: any): any => {
      if (item === null || typeof item !== 'object') {
        return item;
      }
      
      if (seen.has(item)) {
        return undefined; // Remove circular reference
      }
      
      seen.add(item);
      
      if (Array.isArray(item)) {
        return item.map(clean).filter(x => x !== undefined);
      }
      
      const result: any = {};
      for (const [key, value] of Object.entries(item)) {
        // Skip relation objects to avoid circular references
        if (key === 'user' || key === 'admin' || key === 'assigned_admin') {
          continue;
        }
        
        const cleanedValue = clean(value);
        if (cleanedValue !== undefined) {
          result[key] = cleanedValue;
        }
      }
      
      return result;
    };
    
    return clean(obj);
  }

  private async createBaseEntities() {
    this.logger.log('Creating base entities (users and admins)');
    
    // Create users in smaller batches
    const users: User[] = [];
    const userBatchSize = 1000;
    const totalUsers = 50000;
    
    for (let i = 0; i < totalUsers; i += userBatchSize) {
      const batch = Array.from({ length: Math.min(userBatchSize, totalUsers - i) }, () => {
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
      });
      
      const savedBatch = await this.userRepo.save(batch);
      users.push(...savedBatch);
      
      this.logger.log(`Created ${users.length}/${totalUsers} users`);
    }

    // Create admins in smaller batches
    const admins: Admin[] = [];
    const adminBatchSize = 500;
    const totalAdmins = 5000;
    
    for (let i = 0; i < totalAdmins; i += adminBatchSize) {
      const batch = Array.from({ length: Math.min(adminBatchSize, totalAdmins - i) }, () => {
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
      });
      
      const savedBatch = await this.adminRepo.save(batch);
      admins.push(...savedBatch);
      
      this.logger.log(`Created ${admins.length}/${totalAdmins} admins`);
    }

    return { users, admins };
  }

  private runWorker<T>(path: string, workerData: any): Promise<T> {
    return new Promise((resolve, reject) => {
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