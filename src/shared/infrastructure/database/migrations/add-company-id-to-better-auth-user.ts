import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyIdToBetterAuthUser1780272000006 implements MigrationInterface {
  name = 'AddCompanyIdToBetterAuthUser1780272000006';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE ba_user ADD COLUMN IF NOT EXISTS company_id text`);
    await queryRunner.query(`
      UPDATE ba_user
      SET company_id = users.company_id::text
      FROM users
      WHERE users.id::text = ba_user.id
        AND users.company_id IS NOT NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE ba_user DROP COLUMN IF EXISTS company_id`);
  }
}
