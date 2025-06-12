/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { faker } from '@faker-js/faker';
import type {
  ArtilleryContext,
  ArtilleryProcessorCallback,
} from './artillery.types';

export function generateUser(
  context: ArtilleryContext,
  events: any,
  done: ArtilleryProcessorCallback,
) {
  const user = {
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email(),
    password: context.vars.defaultPassword as string,
    phone_number: `+254${faker.phone.number({ style: 'national' })}`,
    profile_picture: faker.internet.url(),
    account_type: faker.helpers.arrayElement(['free', 'premium']),
    status: faker.helpers.arrayElement(['active', 'inactive']),

    address: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    country: faker.location.country(),
    zip_code: faker.location.zipCode(),
    date_of_birth: faker.date.past({ years: 30 }).toISOString().split('T')[0],
    preferred_language: 'en',
    social_media_links: [
      `https://twitter.com/${faker.internet.username()}`,
      `https://linkedin.com/in/${faker.internet.username()}`,
    ],
  };

  context.vars.user = user;
  done();
}

export function generateQuoteData(
  context: ArtilleryContext,
  events: any,
  done: ArtilleryProcessorCallback,
) {
  const quote = {
    quote_details: faker.lorem.paragraph(),
    quote_type: faker.helpers.arrayElement(['free', 'premium']),
    estimated_cost: faker.number.float({
      min: 100,
      max: 5000,
      fractionDigits: 2,
    }),
    attachments: [faker.internet.url(), faker.internet.url()],
  };

  context.vars.quote = quote;
  done();
}

export function generateTicketData(
  context: ArtilleryContext,
  events: any,
  done: ArtilleryProcessorCallback,
) {
  const ticket = {
    issue: faker.lorem.sentence(),
    priority_level: faker.helpers.arrayElement(['low', 'medium', 'high']),
    description: faker.lorem.paragraph(),
  };

  context.vars.ticket = ticket;
  done();
}

export function logResponse(
  context: ArtilleryContext,
  events: any,
  done: ArtilleryProcessorCallback,
) {
  console.log('Response captured:', {
    userId: context.vars.userId as string,
    email: context.vars.email as string,
    accessToken: context.vars.accessToken ? 'Present' : 'Missing',
  });
  done();
}

export function extractUserData(
  requestParams: any,
  response: {
    body:
      | string
      | { success: boolean; data?: { user_id: string; email: string } | null };
  },
  context: ArtilleryContext,
  events: any,
  done: ArtilleryProcessorCallback,
) {
  if (response.body) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data: {
        success: boolean;
        data?: {
          user_id: string;
          email: string;
        } | null;
      } =
        typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response.body;

      if (data.success && data.data) {
        context.vars.registeredUser = data.data;
        context.vars.userId = data.data?.user_id || '';

        context.vars.userEmail = data.data.email;
        console.log(
          `User registered: ${data.data.email} (ID: ${data.data.user_id})`,
        );
      }
    } catch (error) {
      console.error('Failed to parse registration response:', error);
    }
  }
  done();
}

export function extractLoginData(
  requestParams: any,
  response: any,
  context: ArtilleryContext,
  events: any,
  done: ArtilleryProcessorCallback,
) {
  if (response.body) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data =
        typeof response.body === 'string'
          ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            JSON.parse(response.body)
          : response.body;

      if (data.success && data.data) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        context.vars.accessToken = data.data.accessToken;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        context.vars.refreshToken = data.data.refreshToken;
        console.log(`User logged in: ${context.vars.userEmail}`);
      }
    } catch (error) {
      console.error('Failed to parse login response:', error);
    }
  }
  done();
}
