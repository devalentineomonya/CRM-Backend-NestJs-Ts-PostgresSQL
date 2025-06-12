import { parentPort, workerData } from 'worker_threads';
import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { WorkerPayload } from './worker-data.types';

import { User, Admin, Profile, Quote, Ticket, UserVisit } from './index';

// Omit the auto-generated ID columns as they are not needed for creation.
type GeneratedProfile = Omit<Profile, 'profile_id'>;
type GeneratedQuote = Omit<Quote, 'quote_id'>;
type GeneratedVisit = Omit<UserVisit, 'visit_id'>;
type GeneratedTicket = Omit<Ticket, 'ticket_id'>;

async function generateUserData(workerId: string, dbConfig: any) {
  console.log(`Worker ${workerId} starting database connection...`);

  const dataSource = new DataSource({
    ...dbConfig,
    entities: [__dirname + '/../**/*.entity.{ts,js}'],
    synchronize: false,
    logging: false,
  });

  try {
    // Initialize the data source.
    try {
      if (!dataSource.isInitialized) {
        console.log(`Worker ${workerId} initializing database connection...`);
        await dataSource.initialize();
        console.log(`Worker ${workerId} database connection established.`);
      }
    } catch (initError) {
      console.error(`Worker ${workerId} failed to initialize DB:`, initError);
      throw initError; // Propagate the error to stop execution.
    }

    const userRepository = dataSource.getRepository(User);
    const adminRepository = dataSource.getRepository(Admin);
    const profileRepository = dataSource.getRepository(Profile);

    const existingProfileUserIds = (
      await profileRepository
        .createQueryBuilder('profile')
        .select('profile.user_id', 'user_id')
        .getRawMany()
    ).map((p: { user_id: string }) => p.user_id);

    const existingProfileIdsSet = new Set(existingProfileUserIds);
    console.log(
      `Worker ${workerId} found ${existingProfileIdsSet.size} existing profiles.`,
    );

    const users = await userRepository.find();
    const admins = await adminRepository.find();

    if (!users.length || !admins.length) {
      throw new Error(
        'No users or admins found in database. Cannot seed data.',
      );
    }

    console.log(`Worker ${workerId} processing ${users.length} users...`);

    const profiles: GeneratedProfile[] = [];
    const quotes: GeneratedQuote[] = [];
    const visits: GeneratedVisit[] = [];
    const tickets: GeneratedTicket[] = [];

    let skippedProfiles = 0;

    const CHUNK_SIZE = 500;
    for (let i = 0; i < users.length; i += CHUNK_SIZE) {
      const chunkUsers = users.slice(i, i + CHUNK_SIZE);

      chunkUsers.forEach((user) => {
        if (!existingProfileIdsSet.has(user.user_id)) {
          profiles.push({
            address: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state(),
            country: faker.location.country(),
            zip_code: faker.location.zipCode(),
            preferred_language: 'en',
            date_of_birth: faker.date.past({ years: 30, refDate: new Date() }),
            social_media_links: [faker.internet.url(), faker.internet.url()],
            user: user,
          });
        } else {
          skippedProfiles++;
        }

        const quoteCount = faker.number.int({ min: 200, max: 500 });
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
              faker.finance.amount({ min: 10000, max: 500000 }),
            ),
            user: user,
            attachments: [faker.internet.url(), faker.internet.url()],
            valid_until: faker.date.future({ years: 1 }),
            quote_type: faker.helpers.arrayElement(['standard', 'custom']),
            updated_at: new Date(),
          });
        }

        const visitCount = faker.number.int({ min: 400, max: 600 });
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
            user,
          });
        }

        const ticketCount = faker.number.int({ min: 300, max: 600 });
        for (let t = 0; t < ticketCount; t++) {
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
            assigned_admin: faker.helpers.arrayElement(admins),
            created_date: faker.date.recent(),
            user,
          });
        }
      });

      console.log(
        `Worker ${workerId}: Processed chunk ${i / CHUNK_SIZE + 1}/${Math.ceil(users.length / CHUNK_SIZE)}`,
      );
    }

    console.log(`Worker ${workerId} saving data to the database...`);
    await dataSource.transaction(async (transactionalEntityManager) => {
      if (profiles.length > 0) {
        await transactionalEntityManager
          .getRepository(Profile)
          .insert(profiles);
      }
      if (quotes.length > 0) {
        await transactionalEntityManager.getRepository(Quote).insert(quotes);
      }
      if (visits.length > 0) {
        await transactionalEntityManager
          .getRepository(UserVisit)
          .insert(visits);
      }
      if (tickets.length > 0) {
        await transactionalEntityManager.getRepository(Ticket).insert(tickets);
      }
    });

    const summary = {
      profiles: profiles.length,
      quotes: quotes.length,
      visits: visits.length,
      tickets: tickets.length,
      skippedProfiles,
    };

    console.log(`Worker ${workerId} completed successfully.`, summary);
    return { success: true, ...summary };
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log(`Worker ${workerId} database connection closed.`);
    } else {
      console.log(
        `Worker ${workerId} did not establish a database connection.`,
      );
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
      console.error(
        `Worker ${workerId} encountered an unhandled error:`,
        error,
      );
      parentPort?.postMessage({
        error:
          error instanceof Error
            ? error.message
            : 'An unknown error occurred in the worker.',
      });
    });
} catch (error: unknown) {
  const errorMessage =
    error instanceof Error ? error.message : 'Unknown initialization error';
  console.error('Worker initialization failed:', error);
  parentPort?.postMessage({ error: errorMessage });
}
