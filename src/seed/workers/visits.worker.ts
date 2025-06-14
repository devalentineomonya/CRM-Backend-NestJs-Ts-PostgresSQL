import { parentPort, workerData } from 'worker_threads';
import { DataSource, DataSourceOptions } from 'typeorm';
import { faker } from '@faker-js/faker';
import { UserVisit } from '../index';
import { WorkerPayload } from '../worker-data.types';

const CHUNK_SIZE = 50;
type GeneratedVisit = Omit<UserVisit, 'visit_id' | 'user'> & {
  user_id: string;
};
async function generateVisits(
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
    const visitRepo = dataSource.getRepository(UserVisit);
    const visits: GeneratedVisit[] = [];
    let usersProcessed = 0;
    const totalUsers = userIds.length;

    userIds.forEach((userId) => {
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
          visitsGenerated: visits.length,
          workerId,
        });
      }
    });

    // Insert in chunks
    for (let i = 0; i < visits.length; i += CHUNK_SIZE) {
      await visitRepo.insert(visits.slice(i, i + CHUNK_SIZE));
      parentPort?.postMessage({
        status: 'chunk',
        chunkSize: Math.min(CHUNK_SIZE, visits.length - i),
        workerId,
      });
    }

    return visits.length;
  } finally {
    await dataSource.destroy();
  }
}

void (async () => {
  try {
    const { workerId, dbConfig, userIds, entityType }: WorkerPayload =
      workerData as WorkerPayload;
    const result = await generateVisits(workerId, dbConfig, userIds);

    parentPort?.postMessage({
      type: 'done',
      counts: { [entityType]: result },
    });
  } catch (error) {
    parentPort?.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
})();
