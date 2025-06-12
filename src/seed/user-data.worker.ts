import { parentPort, workerData } from 'worker_threads';
import { faker } from '@faker-js/faker';
import { User, Profile, Quote, UserVisit, Ticket, Admin } from './index';

function generateUserData(users: User[], admins: Admin[]) {
  const profiles: Profile[] = [];
  const quotes: Quote[] = [];
  const visits: UserVisit[] = [];
  const tickets: Ticket[] = [];

  // Process users in smaller chunks to avoid memory issues
  const chunkSize = 1000;
  for (let userIndex = 0; userIndex < users.length; userIndex += chunkSize) {
    const userChunk = users.slice(userIndex, userIndex + chunkSize);

    userChunk.forEach((user) => {
      // Generate profile (1 per user)
      profiles.push({
        profile_id: faker.string.uuid(),
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        country: faker.location.country(),
        zip_code: faker.location.zipCode(),
        preferred_language: 'en',
        date_of_birth: faker.date.past({ years: 30 }),
        social_media_links: [faker.internet.url(), faker.internet.url()],
        user_id: user.user_id,
        user: user, // Include the required 'user' property
      } as Profile);

      // Generate quotes (reduce the number per user to avoid too much data)
      const quoteCount = faker.number.int({ min: 50, max: 150 });
      for (let i = 0; i < quoteCount; i++) {
        quotes.push({
          quote_id: faker.string.uuid(),
          quote_details: faker.lorem.paragraph(),
          status: faker.helpers.arrayElement([
            'pending',
            'approved',
            'rejected',
            'expired',
          ]),
          requested_date: faker.date.recent({ days: 30 }),
          estimated_cost: parseFloat(
            faker.number
              .float({
                min: 100,
                max: 5000,
                fractionDigits: 2,
              })
              .toFixed(2),
          ),
          user: user,
          attachments: [faker.internet.url(), faker.internet.url()],
          user_id: user.user_id,
          valid_until: faker.date.future({ years: 1 }),
          quote_type: faker.helpers.arrayElement(['standard', 'custom']),
          updated_at: new Date(),
        } as Quote);
      }

      // Generate visits (reduce the number per user)
      const visitCount = faker.number.int({ min: 20, max: 80 });
      for (let i = 0; i < visitCount; i++) {
        visits.push({
          visit_id: faker.string.uuid(),
          ip_address: faker.internet.ipv4(),
          user_agent: faker.internet.userAgent(),
          device_type: faker.helpers.arrayElement([
            'Mobile',
            'Tablet',
            'Desktop',
          ]),
          user_id: user.user_id,
          visit_time: faker.date.recent({ days: 60 }),
          user: user, // Include the required 'user' property
        } as UserVisit);
      }

      // Generate tickets (reduce the number per user)
      const ticketCount = faker.number.int({ min: 10, max: 50 });
      for (let i = 0; i < ticketCount; i++) {
        const assignedAdmin = faker.helpers.arrayElement(admins);
        tickets.push({
          ticket_id: faker.string.uuid(),
          issue: faker.lorem.sentence(),
          ticket_status: faker.helpers.arrayElement([
            'open',
            'in-progress',
            'closed',
          ]),
          resolved_date: faker.datatype.boolean(0.3)
            ? faker.date.recent()
            : null,
          priority_level: faker.helpers.arrayElement(['low', 'medium', 'high']),
          user_id: user.user_id,
          assigned_to: assignedAdmin.admin_id,
          created_date: faker.date.recent(),
          user: user, // Include the required 'user' property
          assigned_admin: assignedAdmin, // Include the required 'assigned_admin' property
        } as Ticket);
      }
    });

    // Log progress
    if (parentPort) {
      console.log(
        `Processed ${Math.min(userIndex + chunkSize, users.length)}/${users.length} users`,
      );
    }
  }

  return { profiles, quotes, visits, tickets };
}

// Process data and send result to main thread
try {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
  const result = generateUserData(workerData.users, workerData.admins);
  parentPort?.postMessage(result);
} catch (error) {
  console.error('Worker error:', error);
  process.exit(1);
}
