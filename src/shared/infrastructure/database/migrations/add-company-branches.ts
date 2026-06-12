import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyBranches1780272000004 implements MigrationInterface {
  name = 'AddCompanyBranches1780272000004';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS company_branches (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        name varchar(160) NOT NULL,
        code varchar(80) NOT NULL,
        address varchar(240),
        city varchar(120),
        state varchar(80),
        phone varchar(40),
        email varchar(180),
        status status_enum NOT NULL DEFAULT 'ACTIVE',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz
      )
    `);

    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_company_branches_company_code_active ON company_branches (company_id, code) WHERE deleted_at IS NULL`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS ix_company_branches_company_status ON company_branches (company_id, status) WHERE deleted_at IS NULL`);
    await queryRunner.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS branch_id uuid REFERENCES company_branches(id) ON DELETE SET NULL`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS ix_users_company_branch ON users (company_id, branch_id) WHERE deleted_at IS NULL`);
    await queryRunner.query(`ALTER TABLE ba_user ADD COLUMN IF NOT EXISTS branch_id text`);
    await queryRunner.query(`COMMENT ON TABLE company_branches IS 'Company branches used to isolate operational data inside a company.'`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE ba_user DROP COLUMN IF EXISTS branch_id`);
    await queryRunner.query(`ALTER TABLE users DROP COLUMN IF EXISTS branch_id`);
    await queryRunner.query(`DROP TABLE IF EXISTS company_branches CASCADE`);
  }
}
