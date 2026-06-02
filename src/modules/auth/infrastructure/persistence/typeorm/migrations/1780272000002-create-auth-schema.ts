import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuthSchema1780272000002 implements MigrationInterface {
  name = 'CreateAuthSchema1780272000002';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE session_status_enum AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE auth_event_type_enum AS ENUM ('LOGIN', 'FAILED_LOGIN', 'LOGOUT', 'LOGOUT_ALL_DEVICES', 'PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET', 'PASSWORD_CHANGED', 'TOKEN_REFRESH');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE user_sessions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
        status session_status_enum NOT NULL DEFAULT 'ACTIVE',
        ip_address varchar(80),
        user_agent varchar(500),
        login_at timestamptz NOT NULL,
        logout_at timestamptz,
        expires_at timestamptz NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_user_sessions_user_status ON user_sessions (user_id, status)`);

    await queryRunner.query(`
      CREATE TABLE refresh_tokens (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        session_id uuid NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
        token_hash varchar(255) NOT NULL,
        expires_at timestamptz NOT NULL,
        revoked_at timestamptz,
        replaced_by_token_id uuid,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_refresh_tokens_user_session ON refresh_tokens (user_id, session_id)`);

    await queryRunner.query(`
      CREATE TABLE password_reset_tokens (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash varchar(255) NOT NULL,
        expires_at timestamptz NOT NULL,
        used_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_password_reset_tokens_user ON password_reset_tokens (user_id)`);

    await queryRunner.query(`
      CREATE TABLE auth_events (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        type auth_event_type_enum NOT NULL,
        user_id uuid REFERENCES users(id) ON DELETE SET NULL,
        tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL,
        session_id uuid REFERENCES user_sessions(id) ON DELETE SET NULL,
        email varchar(180),
        ip_address varchar(80),
        user_agent varchar(500),
        metadata jsonb,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_auth_events_user_created ON auth_events (user_id, created_at)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE auth_events`);
    await queryRunner.query(`DROP TABLE password_reset_tokens`);
    await queryRunner.query(`DROP TABLE refresh_tokens`);
    await queryRunner.query(`DROP TABLE user_sessions`);
    await queryRunner.query(`DROP TYPE auth_event_type_enum`);
    await queryRunner.query(`DROP TYPE session_status_enum`);
  }
}
