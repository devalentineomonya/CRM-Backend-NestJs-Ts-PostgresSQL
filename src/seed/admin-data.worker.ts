import { parentPort, workerData } from 'worker_threads';
import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { WorkerPayload } from './worker-data.types';
import { Admin, AdminActivityLog } from './index';

async function generateAdminLogs(workerId: string, dbConfig: any) {
  console.log(`Worker ${workerId} starting database connection...`);
  type GeneratedAdminLog = Omit<AdminActivityLog, 'log_id' | 'admin'> & {
    admin_id: string;
  };
  const dataSource = new DataSource({
    ...dbConfig,
    entities: [__dirname + '/../**/*.entity.{ts,js}'],
    synchronize: false,
    logging: false,
  });

  try {
    if (!dataSource.isInitialized) {
      console.log(`Worker ${workerId} initializing database connection...`);
      await dataSource.initialize();
      console.log(`Worker ${workerId} database connection established`);
    }

    const adminRepository = dataSource.getRepository(Admin);
    const admins = await adminRepository.find({
      take: 500,
    });

    if (!admins.length) {
      throw new Error('No admins found in database');
    }

    console.log(`Worker ${workerId} processing ${admins.length} admins`);
    const logs: GeneratedAdminLog[] = [];

    const CHUNK_SIZE = 50;
    for (let i = 0; i < admins.length; i += CHUNK_SIZE) {
      const chunkAdmins = admins.slice(i, i + CHUNK_SIZE);

      chunkAdmins.forEach((admin) => {
        const logCount = faker.number.int({ min: 2, max: 3 });
        for (let j = 0; j < logCount; j++) {
          logs.push({
            action_type: faker.helpers.arrayElement([
              'CREATE',
              'UPDATE',
              'DELETE',
            ]),
            action_details: faker.lorem.sentence(),
            action_time: faker.date.recent({ days: 30 }),
            ip_address: faker.internet.ipv4(),
            target_entity: faker.helpers.arrayElement([
              'User',
              'Ticket',
              'Quote',
            ]),
            target_id: faker.number.int({ min: 1000, max: 9999 }),
            admin_id: admin.admin_id,
          });
        }
      });

      console.log(
        `Worker ${workerId}: Processed chunk ${i / CHUNK_SIZE + 1}/${Math.ceil(admins.length / CHUNK_SIZE)}`,
      );
    }

    console.log(
      `Worker ${workerId} saving ${logs.length} admin logs to database...`,
    );
    await dataSource.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager
        .getRepository(AdminActivityLog)
        .insert(logs);
    });

    console.log(
      `Worker ${workerId} completed. Generated ${logs.length} admin logs`,
    );
    return logs;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log(`Worker ${workerId} database connection closed`);
    }
  }
}

// Worker execution
try {
  const { workerId, dbConfig }: WorkerPayload = workerData as WorkerPayload;

  if (!workerId || !dbConfig) {
    throw new Error('Missing required worker data: workerId or dbConfig');
  }

  generateAdminLogs(workerId, dbConfig)
    .then((logs) => {
      // Return only count instead of full objects
      parentPort?.postMessage({ count: logs.length });
    })
    .catch((error) => {
      console.error(`Worker ${workerId} error:`, error);
      parentPort?.postMessage({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    });
} catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  console.error(`Worker initialization error:`, error);
  parentPort?.postMessage({ error: errorMessage });
}
