import { parentPort, workerData } from 'worker_threads';
import { DataSource, DataSourceOptions } from 'typeorm';
import { faker } from '@faker-js/faker';
import { AdminActivityLog } from './index';
import { WorkerPayload } from './worker-data.types';

const CHUNK_SIZE = 2;
type GeneratedLogs = Omit<AdminActivityLog, 'log_id' | 'admin'> & {
  admin_id: string;
};
async function generateAdminLogs(
  workerId: WorkerPayload['workerId'],
  dbConfig: WorkerPayload['dbConfig'],
  adminIds: WorkerPayload['adminIds'],
) {
  const dataSource = new DataSource({
    ...(dbConfig as DataSourceOptions),
    entities: [__dirname + '/../**/*.entity.{ts,js}'],
    synchronize: false,
    logging: false,
  });

  await dataSource.initialize();
  if (!adminIds) return;
  try {
    const logRepo = dataSource.getRepository(AdminActivityLog);
    const logs: GeneratedLogs[] = [];
    let adminsProcessed = 0;
    const totalAdmins = adminIds.length;

    adminIds.forEach((adminId) => {
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
          admin_id: adminId,
        });
      }

      adminsProcessed++;

      // Report progress every 100 admins
      if (adminsProcessed % 100 === 0 || adminsProcessed === totalAdmins) {
        parentPort?.postMessage({
          status: 'progress',
          adminsProcessed,
          totalAdmins,
          logsGenerated: logs.length,
          workerId,
        });
      }
    });

    // Insert in chunks
    for (let i = 0; i < logs.length; i += CHUNK_SIZE) {
      await logRepo.insert(logs.slice(i, i + CHUNK_SIZE));
      parentPort?.postMessage({
        status: 'chunk',
        chunkSize: Math.min(CHUNK_SIZE, logs.length - i),
        workerId,
      });
    }

    return { count: logs.length };
  } finally {
    await dataSource.destroy();
  }
}

(async () => {
  try {
    const { workerId, dbConfig, userIds }: WorkerPayload =
      workerData as WorkerPayload;
    const result = await generateAdminLogs(workerId, dbConfig, userIds);
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
