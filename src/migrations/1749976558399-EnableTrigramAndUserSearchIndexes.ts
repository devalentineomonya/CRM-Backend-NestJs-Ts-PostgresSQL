import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnableTrigramAndUserSearchIndexes1749976558399
  implements MigrationInterface
{
  name = 'EnableTrigramAndUserSearchIndexes';
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable pg_trgm extension (only needs to be done once per database)
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);

    // Add trigram-based GIN indexes for search optimization
    await queryRunner.query(`
          CREATE INDEX users_first_name_trgm_idx
          ON users USING GIN (first_name gin_trgm_ops)
        `);

    await queryRunner.query(`
          CREATE INDEX users_last_name_trgm_idx
          ON users USING GIN (last_name gin_trgm_ops)
        `);

    await queryRunner.query(`
          CREATE INDEX users_email_trgm_idx
          ON users USING GIN (email gin_trgm_ops)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the trigram indexes and extension
    await queryRunner.query(`DROP INDEX IF EXISTS users_email_trgm_idx`);
    await queryRunner.query(`DROP INDEX IF EXISTS users_last_name_trgm_idx`);
    await queryRunner.query(`DROP INDEX IF EXISTS users_first_name_trgm_idx`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS pg_trgm`);
  }
}
