import { parentPort, workerData } from 'worker_threads';
import { DataSource, DataSourceOptions } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Ticket } from './index';
import { WorkerPayload } from './worker-data.types';

const CHUNK_SIZE = 2;
type GeneratedTicket = Omit<Ticket, 'ticket_id' | 'user' | 'assigned_admin'> & {
  user_id: string;
  assigned_admin_id: string;
};

async function generateTickets(
  workerId: WorkerPayload['workerId'],
  dbConfig: WorkerPayload['dbConfig'],
  userIds: WorkerPayload['userIds'],
  adminIds: WorkerPayload['adminIds'],
) {
  const dataSource = new DataSource({
    ...(dbConfig as DataSourceOptions),
    entities: [__dirname + '/../**/*.entity.{ts,js}'],
  });

  if (!userIds || !adminIds) return;
  await dataSource.initialize();

  try {
    const ticketRepo = dataSource.getRepository(Ticket);
    const tickets: GeneratedTicket[] = [];
    let usersProcessed = 0;
    const totalUsers = userIds.length;

    userIds.forEach((userId) => {
      const ticketCount = faker.number.int({ min: 3, max: 6 });

      for (let t = 0; t < ticketCount; t++) {
        const assignedAdminId =
          adminIds[Math.floor(Math.random() * adminIds.length)];

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
          priority_level: faker.helpers.arrayElement(['low', 'medium', 'high']),
          created_date: faker.date.recent(),
          user_id: userId,
          assigned_admin_id: assignedAdminId,
        });
      }

      usersProcessed++;

      // Report progress every 100 users
      if (usersProcessed % 100 === 0 || usersProcessed === totalUsers) {
        parentPort?.postMessage({
          status: 'progress',
          usersProcessed,
          totalUsers,
          ticketsGenerated: tickets.length,
          workerId,
        });
      }
    });

    // Insert in chunks
    for (let i = 0; i < tickets.length; i += CHUNK_SIZE) {
      await ticketRepo.insert(tickets.slice(i, i + CHUNK_SIZE));
      parentPort?.postMessage({
        status: 'chunk',
        chunkSize: Math.min(CHUNK_SIZE, tickets.length - i),
        workerId,
      });
    }

    return { count: tickets.length };
  } finally {
    await dataSource.destroy();
  }
}

(async () => {
  try {
    const { workerId, dbConfig, userIds, adminIds }: WorkerPayload =
      workerData as WorkerPayload;
    const result = await generateTickets(workerId, dbConfig, userIds, adminIds);
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
