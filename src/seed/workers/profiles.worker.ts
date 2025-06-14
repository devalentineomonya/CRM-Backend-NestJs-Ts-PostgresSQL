import { parentPort, workerData } from 'worker_threads';
import { DataSource, DataSourceOptions } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Profile } from '../index';
import { WorkerPayload } from '../worker-data.types';

const CHUNK_SIZE = 100;
type GeneratedProfile = Omit<Profile, 'profile_id' | 'user'> & {
  user_id: string;
};

export async function generateProfiles(
  workerId: WorkerPayload['workerId'],
  dbConfig: WorkerPayload['dbConfig'],
  userIds: WorkerPayload['userIds'],
) {
  const dataSource = new DataSource({
    ...(dbConfig as DataSourceOptions),
    entities: [__dirname + '/../**/*.entity.{ts,js}'],
  });
  await dataSource.initialize();

  try {
    const profileRepo = dataSource.getRepository(Profile);
    const profiles: GeneratedProfile[] = [];
    let processed = 0;
    if (!userIds) return;

    for (let i = 0; i < userIds.length; i += CHUNK_SIZE) {
      const chunkUserIds = userIds.slice(i, i + CHUNK_SIZE);

      chunkUserIds.forEach((userId) => {
        profiles.push({
          address: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          country: faker.location.country(),
          zip_code: faker.location.zipCode(),
          preferred_language: faker.helpers.arrayElement([
            'en',
            'es',
            'fr',
            'de',
            'sw',
            'other',
          ]),
          date_of_birth: faker.date.past({ years: 30 }),
          social_media_links: [faker.internet.url(), faker.internet.url()],
          user_id: userId,
        });
      });

      processed += chunkUserIds.length;
      parentPort?.postMessage({
        status: 'progress',
        message: `Processed ${processed}/${userIds.length} users`,
        workerId,
      });
    }

    // Insert in chunks
    for (let i = 0; i < profiles.length; i += CHUNK_SIZE) {
      await profileRepo.insert(profiles.slice(i, i + CHUNK_SIZE));
    }

    return profiles.length;
  } finally {
    await dataSource.destroy();
  }
}

void (async () => {
  try {
    const { workerId, dbConfig, userIds, entityType }: WorkerPayload =
      workerData as WorkerPayload;
    const result = await generateProfiles(workerId, dbConfig, userIds);

    parentPort?.postMessage({
      type: 'done',
      counts: { [entityType]: result },
    });
  } catch (error) {
    parentPort?.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
})();
