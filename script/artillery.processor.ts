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
    phone_number: `+254768133220`,
    profile_picture: faker.internet.url(),
    account_type: faker.helpers.arrayElement(['free', 'premium']),
    status: faker.helpers.arrayElement(['active', 'inactive']),
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
      const data: {
        success: boolean;
        data?: {
          accessToken: string;
          refreshToken: string;
        } | null;
      } =
        typeof response.body === 'string'
          ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            JSON.parse(response.body)
          : response.body;

      if (data.success && data.data) {
        context.vars.accessToken = data.data.accessToken;
        context.vars.refreshToken = data.data.refreshToken;
        console.log(`User logged in: ${context.vars.userEmail}`);
      }
    } catch (error) {
      console.error('Failed to parse login response:', error);
    }
  }
  done();
}
