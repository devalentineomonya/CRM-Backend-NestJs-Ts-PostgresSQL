import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTrigramIndexesAndSearch1750097414766
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ==================== EXTENSIONS ====================
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);

    // ==================== USERS ====================
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_users_first_name_trgm
      ON users USING GIN (first_name gin_trgm_ops)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_users_last_name_trgm
      ON users USING GIN (last_name gin_trgm_ops)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email_trgm
      ON users USING GIN (email gin_trgm_ops)
    `);

    // ==================== ADMINS ====================
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_admins_first_name_trgm
      ON admins USING GIN (first_name gin_trgm_ops)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_admins_last_name_trgm
      ON admins USING GIN (last_name gin_trgm_ops)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_admins_email_trgm
      ON admins USING GIN (email gin_trgm_ops)
    `);

    // ==================== USER PROFILES ====================
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_profiles_city_trgm
      ON user_profiles USING GIN (city gin_trgm_ops)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_profiles_state_trgm
      ON user_profiles USING GIN (state gin_trgm_ops)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_profiles_country_trgm
      ON user_profiles USING GIN (country gin_trgm_ops)
    `);

    // ==================== QUOTE REQUESTS ====================
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_quote_details_trgm
      ON quote_requests USING GIN (quote_details gin_trgm_ops)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_quote_type_trgm
      ON quote_requests USING GIN (quote_type gin_trgm_ops)
    `);

    // ==================== TICKETS ====================
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_tickets_issue_trgm
      ON tickets USING GIN (issue gin_trgm_ops)
    `);

    // ==================== OPTIONAL: FULL-TEXT SEARCH ON QUOTES ====================
    /*
    await queryRunner.query(`
      ALTER TABLE quote_requests
      ADD COLUMN IF NOT EXISTS fts tsvector
      GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(quote_details, '') || ' ' || coalesce(quote_type, ''))
      ) STORED
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_quote_fts
      ON quote_requests USING GIN (fts)
    `);
    */
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ==================== OPTIONAL: DROP FTS ====================
    /*
    await queryRunner.query(`DROP INDEX IF EXISTS idx_quote_fts`);
    await queryRunner.query(`ALTER TABLE quote_requests DROP COLUMN IF EXISTS fts`);
    */

    // ==================== TICKETS ====================
    await queryRunner.query(`DROP INDEX IF EXISTS idx_tickets_issue_trgm`);

    // ==================== QUOTE REQUESTS ====================
    await queryRunner.query(`DROP INDEX IF EXISTS idx_quote_type_trgm`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_quote_details_trgm`);

    // ==================== USER PROFILES ====================
    await queryRunner.query(`DROP INDEX IF EXISTS idx_profiles_country_trgm`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_profiles_state_trgm`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_profiles_city_trgm`);

    // ==================== ADMINS ====================
    await queryRunner.query(`DROP INDEX IF EXISTS idx_admins_email_trgm`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_admins_last_name_trgm`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_admins_first_name_trgm`);

    // ==================== USERS ====================
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_email_trgm`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_last_name_trgm`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_first_name_trgm`);
  }
}
