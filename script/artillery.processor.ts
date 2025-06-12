import { faker } from '@faker-js/faker';
import type {
  ArtilleryContext,
  ArtilleryProcessorCallback,
} from '../artillery.types';

export function generateUser(
  context: ArtilleryContext,
  events: any,
  done: ArtilleryProcessorCallback,
) {
  const user = {
    email: faker.internet.email(),
    password: context.vars.defaultPassword,
    username: faker.internet.userName(),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    country: faker.location.country(),
    zip_code: faker.location.zipCode(),
    dob: faker.date.past({ years: 30 }).toISOString().split('T')[0],
  };

  context.vars.user = user;
  done();
}
