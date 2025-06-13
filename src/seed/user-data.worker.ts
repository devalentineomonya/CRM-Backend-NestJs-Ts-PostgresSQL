import { parentPort, workerData } from 'worker_threads';
import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { WorkerPayload } from './worker-data.types';
import { User, Admin, Profile, Quote, Ticket, UserVisit } from './index';

type GeneratedProfile = Omit<Profile, 'profile_id' | 'user'> & {
  user_id: string;
};
type GeneratedQuote = Omit<Quote, 'quote_id' | 'user'> & { user_id: string };
type GeneratedVisit = Omit<UserVisit, 'visit_id' | 'user'> & {
  user_id: string;
};
type GeneratedTicket = Omit<Ticket, 'ticket_id' | 'user' | 'assigned_admin'> & {
  user_id: string;
  assigned_admin_id: string;
};

const CHUNK_INSERT_SIZE = 500;

async function chunkInsert<T>(
  repository: any,
  data: T[],
  label: string,
  workerId: string,
) {
  for (let i = 0; i < data.length; i += CHUNK_INSERT_SIZE) {
    const chunk = data.slice(i, i + CHUNK_INSERT_SIZE);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await repository.insert(chunk);
    console.log(
      `Worker ${workerId} inserted ${label} chunk ${i / CHUNK_INSERT_SIZE + 1}`,
    );
  }
}

async function generateUserData(workerId: string, dbConfig: any) {
  console.log(`Worker ${workerId} starting database connection...`);

  const dataSource = new DataSource({
    ...dbConfig,
    entities: [__dirname + '/../**/*.entity.{ts,js}'],
    synchronize: false,
    logging: false,
  });

  try {
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
      console.log(`Worker ${workerId} connected to DB.`);
    }

    const userRepo = dataSource.getRepository(User);
    const adminRepo = dataSource.getRepository(Admin);
    const profileRepo = dataSource.getRepository(Profile);

    const existingProfiles = await profileRepo
      .createQueryBuilder('profile')
      .select('profile.user_id', 'user_id')
      .getRawMany();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    const existingUserIds = new Set(existingProfiles.map((p) => p.user_id));
    const users = await userRepo.find({ take: 1500 });
    const admins = await adminRepo.find({ take: 1500 });

    if (!users.length || !admins.length) {
      throw new Error('No users or admins found in DB. Cannot seed data.');
    }

    const profiles: GeneratedProfile[] = [];
    const quotes: GeneratedQuote[] = [];
    const visits: GeneratedVisit[] = [];
    const tickets: GeneratedTicket[] = [];

    let skippedProfiles = 0;
    const CHUNK_SIZE = 200;

    for (let i = 0; i < users.length; i += CHUNK_SIZE) {
      const chunkUsers = users.slice(i, i + CHUNK_SIZE);

      chunkUsers.forEach((user) => {
        const userId = user.user_id;

        if (!existingUserIds.has(userId)) {
          profiles.push({
            address: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state(),
            country: faker.location.country(),
            zip_code: faker.location.zipCode(),
            preferred_language: 'en',
            date_of_birth: faker.date.past({ years: 30 }),
            social_media_links: [faker.internet.url(), faker.internet.url()],
            user_id: userId,
          });
        } else {
          skippedProfiles++;
        }

        const quoteCount = faker.number.int({ min: 200, max: 500 });
        const visitCount = faker.number.int({ min: 400, max: 600 });
        const ticketCount = faker.number.int({ min: 300, max: 600 });

        for (let q = 0; q < quoteCount; q++) {
          quotes.push({
            quote_details: faker.lorem.paragraph(),
            status: faker.helpers.arrayElement([
              'pending',
              'approved',
              'rejected',
            ]),
            requested_date: faker.date.recent({ days: 30 }),
            estimated_cost: parseFloat(
              faker.finance.amount({ min: 100, max: 500 }),
            ),
            attachments: [faker.internet.url(), faker.internet.url()],
            valid_until: faker.date.future({ years: 1 }),
            quote_type: faker.helpers.arrayElement(['standard', 'custom']),
            updated_at: new Date(),
            user_id: userId,
          });
        }

        for (let v = 0; v < visitCount; v++) {
          visits.push({
            ip_address: faker.internet.ipv4(),
            user_agent: faker.internet.userAgent(),
            device_type: faker.helpers.arrayElement([
              'Mobile',
              'Tablet',
              'Desktop',
            ]),
            visit_time: faker.date.recent({ days: 60 }),
            user_id: userId,
          });
        }

        for (let t = 0; t < ticketCount; t++) {
          const assignedAdmin =
            admins[faker.number.int({ min: 0, max: admins.length - 1 })];
          tickets.push({
            issue: faker.lorem.sentence(),
            ticket_status: faker.helpers.arrayElement([
              'open',
              'in-progress',
              'closed',
            ]),
            resolved_date: faker.datatype.boolean({ probability: 0.3 })
              ? faker.date.recent()
              : null,
            priority_level: faker.helpers.arrayElement([
              'low',
              'medium',
              'high',
            ]),
            created_date: faker.date.recent(),
            user_id: userId,
            assigned_admin_id: assignedAdmin.admin_id,
          });
        }
      });

      console.log(
        `Worker ${workerId} processed chunk ${i / CHUNK_SIZE + 1}/${Math.ceil(users.length / CHUNK_SIZE)}`,
      );
    }

    console.log(`Worker ${workerId} saving data in chunks...`);
    const manager = dataSource.manager;
    if (profiles.length)
      await chunkInsert(
        manager.getRepository(Profile),
        profiles,
        'profiles',
        workerId,
      );
    if (quotes.length)
      await chunkInsert(
        manager.getRepository(Quote),
        quotes,
        'quotes',
        workerId,
      );
    if (visits.length)
      await chunkInsert(
        manager.getRepository(UserVisit),
        visits,
        'visits',
        workerId,
      );
    if (tickets.length)
      await chunkInsert(
        manager.getRepository(Ticket),
        tickets,
        'tickets',
        workerId,
      );

    const summary = {
      profiles: profiles.length,
      quotes: quotes.length,
      visits: visits.length,
      tickets: tickets.length,
      skippedProfiles,
    };

    console.log(`Worker ${workerId} completed.`, summary);
    return { success: true, ...summary };
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log(`Worker ${workerId} database connection closed.`);
    }
  }
}

try {
  const { workerId, dbConfig }: WorkerPayload = workerData as WorkerPayload;

  if (!workerId || !dbConfig) {
    throw new Error('Missing required worker data: workerId or dbConfig');
  }

  generateUserData(workerId, dbConfig)
    .then((result) => parentPort?.postMessage(result))
    .catch((error) => {
      console.error(`Worker ${workerId} error:`, error);
      parentPort?.postMessage({
        error: error instanceof Error ? error.message : 'Unknown worker error.',
      });
    });
} catch (error: unknown) {
  console.error('Worker initialization failed:', error);
  parentPort?.postMessage({
    error:
      error instanceof Error ? error.message : 'Unknown initialization error',
  });
}
