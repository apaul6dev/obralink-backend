import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBranchAdminUserType1780272000005 implements MigrationInterface {
  name = 'AddBranchAdminUserType1780272000005';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE user_type_enum ADD VALUE IF NOT EXISTS 'BRANCH_ADMIN'
    `);
  }

  async down(): Promise<void> {
    // PostgreSQL does not support dropping enum values safely without recreating the type.
  }
}
