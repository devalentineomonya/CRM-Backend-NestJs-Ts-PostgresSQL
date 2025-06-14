import { parentPort, workerData } from 'worker_threads';
import { DataSource, DataSourceOptions } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Quote } from './index';
import { WorkerPayload } from './worker-data.types';

const CHUNK_SIZE = 2;
type GeneratedQuote = Omit<Quote, 'quote_id' | 'user'> & { user_id: string };

async function generateQuotes(
  workerId: WorkerPayload['workerId'],
  dbConfig: WorkerPayload['dbConfig'],
  userIds: WorkerPayload['userIds'],
) {
  const dataSource = new DataSource({
    ...(dbConfig as DataSourceOptions),
    entities: [__dirname + '/../**/*.entity.{ts,js}'],
  });

  await dataSource.initialize();
  if (!userIds) return;
  try {
    const quoteRepo = dataSource.getRepository(Quote);
    const quotes: GeneratedQuote[] = [];
    let usersProcessed = 0;
    const totalUsers = userIds.length;

    userIds.forEach((userId) => {
      const quoteCount = faker.number.int({ min: 2, max: 5 });

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

      usersProcessed++;

      // Report progress every 100 users
      if (usersProcessed % 100 === 0 || usersProcessed === totalUsers) {
        parentPort?.postMessage({
          status: 'progress',
          usersProcessed,
          totalUsers,
          quotesGenerated: quotes.length,
          workerId,
        });
      }
    });

    // Insert in chunks
    for (let i = 0; i < quotes.length; i += CHUNK_SIZE) {
      await quoteRepo.insert(quotes.slice(i, i + CHUNK_SIZE));
      parentPort?.postMessage({
        status: 'chunk',
        chunkSize: Math.min(CHUNK_SIZE, quotes.length - i),
        workerId,
      });
    }

    return { count: quotes.length };
  } finally {
    await dataSource.destroy();
  }
}

(async () => {
  try {
    const { workerId, dbConfig, userIds }: WorkerPayload =
      workerData as WorkerPayload;
    const result = await generateQuotes(workerId, dbConfig, userIds);
    parentPort?.postMessage(result);
  } catch (error) {
    parentPort?.postMessage({
      error: error instanceof Error ? error.message : 'An error occurred ',
      stack: error instanceof Error ? error.stack : 'Unknown stack',
    });
  }
})()
  .then((result) => parentPort?.postMessage(result))
  .catch((error) => {
    parentPort?.postMessage({
      error: error instanceof Error ? error.message : 'An error occurred ',
      stack: error instanceof Error ? error.stack : 'Unknown stack',
    });
  });
