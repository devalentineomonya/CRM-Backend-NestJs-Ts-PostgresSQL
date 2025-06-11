import { parentPort, workerData } from 'worker_threads';
import { faker } from '@faker-js/faker';
import { User, Profile, Quote, UserVisit, Ticket, Admin } from './index';

function generateUserData(users: User[], admins: Admin[]) {
  const profiles: Profile[] = [];
  const quotes: Quote[] = [];
  const visits: UserVisit[] = [];
  const tickets: Ticket[] = [];

  users.forEach((user) => {
    // Generate profile
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
      user: user,
    } as Profile);

    // Generate quotes (100-300 per user)
    const quoteCount = faker.number.int({ min: 1000, max: 3000 });
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
        estimated_cost: faker.number.float({
          min: 100,
          max: 5000,
          fractionDigits: 2,
        }),
        valid_until: faker.date.future({ years: 1 }),
        quote_type: faker.helpers.arrayElement(['free', 'premium']),
        attachments: Array.from({ length: 2 }, () => faker.internet.url()),
        user_id: user.user_id,
        user: user,
        updated_at: new Date(),
      } as Quote);
    }

    // Generate visits (30-100 per user)
    const visitCount = faker.number.int({ min: 3000, max: 10000 });
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
        user: user,
      } as UserVisit);
    }

    // Generate tickets (30-200 per user)
    const ticketCount = faker.number.int({ min: 3000, max: 20000 });
    for (let i = 0; i < ticketCount; i++) {
      tickets.push({
        ticket_id: faker.string.uuid(),
        issue: faker.lorem.sentence(),
        ticket_status: faker.helpers.arrayElement([
          'open',
          'in-progress',
          'closed',
        ]),
        resolved_date: faker.datatype.boolean(0.3) ? faker.date.recent() : null,
        priority_level: faker.helpers.arrayElement(['low', 'medium', 'high']),
        user_id: user.user_id,
        assigned_to: faker.helpers.arrayElement(admins).admin_id,
        created_date: faker.date.recent(),
        user: user,
        assigned_admin: faker.helpers.arrayElement(admins),
      } as Ticket);
    }
  });

  return { profiles, quotes, visits, tickets };
}

// Process data and send result to main thread
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
const result = generateUserData(workerData.users, workerData.admins);
parentPort?.postMessage(result);
