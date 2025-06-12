import { parentPort, workerData } from 'worker_threads';
import { faker } from '@faker-js/faker';
import { AdminActivityLog, Admin } from './index';

function generateAdminLogs(admins: Admin[]) {
  return admins.flatMap((admin) =>
    Array.from(
      { length: faker.number.int({ min: 500, max: 1500 }) },
      () =>
        ({
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
          admin: admin,
          admin_id: admin.admin_id,
        }) as AdminActivityLog,
    ),
  );
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
parentPort?.postMessage(generateAdminLogs(workerData.admins));
