import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBetterAuth1780272000002 implements MigrationInterface {
  name = 'AddBetterAuth1780272000002';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ba_user (
        id text PRIMARY KEY,
        name text NOT NULL,
        email text NOT NULL,
        email_verified boolean NOT NULL DEFAULT false,
        image text,
        user_type varchar(40) NOT NULL DEFAULT 'COMPANY_USER',
        permissions text[] NOT NULL DEFAULT '{}',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ba_organization (
        id text PRIMARY KEY,
        name text NOT NULL,
        slug text NOT NULL,
        logo text,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ba_session (
        id text PRIMARY KEY,
        expires_at timestamptz NOT NULL,
        token text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        ip_address text,
        user_agent text,
        user_id text NOT NULL REFERENCES ba_user(id) ON DELETE CASCADE,
        active_organization_id text REFERENCES ba_organization(id) ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ba_account (
        id text PRIMARY KEY,
        account_id text NOT NULL,
        provider_id text NOT NULL,
        user_id text NOT NULL REFERENCES ba_user(id) ON DELETE CASCADE,
        access_token text,
        refresh_token text,
        id_token text,
        access_token_expires_at timestamptz,
        refresh_token_expires_at timestamptz,
        scope text,
        password text,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ba_verification (
        id text PRIMARY KEY,
        identifier text NOT NULL,
        value text NOT NULL,
        expires_at timestamptz,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ba_member (
        id text PRIMARY KEY,
        organization_id text NOT NULL REFERENCES ba_organization(id) ON DELETE CASCADE,
        user_id text NOT NULL REFERENCES ba_user(id) ON DELETE CASCADE,
        role text NOT NULL DEFAULT 'member',
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ba_invitation (
        id text PRIMARY KEY,
        organization_id text NOT NULL REFERENCES ba_organization(id) ON DELETE CASCADE,
        email text NOT NULL,
        role text NOT NULL,
        status text NOT NULL DEFAULT 'pending',
        expires_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        inviter_id text NOT NULL REFERENCES ba_user(id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_ba_user_email ON ba_user (email)`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_ba_session_token ON ba_session (token)`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_ba_organization_slug ON ba_organization (slug)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_ba_session_user_id ON ba_session (user_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_ba_account_user_id ON ba_account (user_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_ba_account_provider_account ON ba_account (provider_id, account_id)`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_ba_member_org_user ON ba_member (organization_id, user_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_ba_invitation_org_email ON ba_invitation (organization_id, email)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS ba_invitation CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS ba_member CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS ba_verification CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS ba_account CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS ba_session CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS ba_organization CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS ba_user CASCADE`);
  }
}
