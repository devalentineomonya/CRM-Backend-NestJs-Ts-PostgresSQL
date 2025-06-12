import { parentPort, workerData } from 'worker_threads';
import { faker } from '@faker-js/faker';
import { AdminActivityLog, Admin } from './index';

function generateAdminLogs(admins: Admin[]) {
  const logs: AdminActivityLog[] = [];

  // Process admins in chunks to avoid memory issues
  const chunkSize = 500;
  for (
    let adminIndex = 0;
    adminIndex < admins.length;
    adminIndex += chunkSize
  ) {
    const adminChunk = admins.slice(adminIndex, adminIndex + chunkSize);

    adminChunk.forEach((admin) => {
      // Reduce the number of logs per admin to avoid too much data
      const logCount = faker.number.int({ min: 50, max: 200 });

      for (let i = 0; i < logCount; i++) {
        logs.push({
          log_id: faker.string.uuid(),
          action_type: faker.helpers.arrayElement([
            'CREATE',
            'UPDATE',
            'DELETE',
          ]),
          action_details: faker.lorem.sentence(),
          ip_address: faker.internet.ipv4(),
          target_entity: faker.helpers.arrayElement([
            'User',
            'Ticket',
            'Quote',
          ]),
          target_id: faker.number.int({ min: 1000, max: 9999 }),
          action_time: faker.date.recent(),
          admin_id: admin.admin_id,
          admin: admin,
        } as AdminActivityLog);
      }
    });

    // Log progress
    if (parentPort) {
      console.log(
        `Processed ${Math.min(adminIndex + chunkSize, admins.length)}/${admins.length} admins`,
      );
    }
  }

  return logs;
}

try {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
  const result = generateAdminLogs(workerData.admins);
  parentPort?.postMessage(result);
} catch (error) {
  console.error('Worker error:', error);
  process.exit(1);
}
