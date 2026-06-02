import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIdentitySchema1780272000001 implements MigrationInterface {
  name = 'CreateIdentitySchema1780272000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await queryRunner.query(`CREATE TYPE status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED')`);
    await queryRunner.query(`CREATE TYPE user_type_enum AS ENUM ('GLOBAL_ADMIN', 'TENANT_ADMIN', 'TENANT_USER')`);
    await queryRunner.query(`CREATE TYPE actor_type_enum AS ENUM ('CLIENT', 'SALES_REPRESENTATIVE', 'ENGINEER_TECHNICIAN', 'COMMERCIAL_ADMINISTRATOR', 'EXTERNAL_SUBCONTRACTOR', 'ACCOUNTING_FINANCE', 'MANAGEMENT')`);

    await queryRunner.query(`
      CREATE TABLE tenants (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(160) NOT NULL,
        legal_name varchar(200),
        identification_number varchar(60),
        status status_enum NOT NULL DEFAULT 'INACTIVE',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz
      )
    `);

    await queryRunner.query(`
      CREATE TABLE users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid REFERENCES tenants(id) ON DELETE RESTRICT,
        email varchar(180) NOT NULL,
        password_hash varchar(255) NOT NULL,
        first_name varchar(100) NOT NULL,
        last_name varchar(100) NOT NULL,
        user_type user_type_enum NOT NULL,
        status status_enum NOT NULL DEFAULT 'ACTIVE',
        identification_number varchar(60),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX uq_users_tenant_email_active ON users (tenant_id, email) WHERE deleted_at IS NULL`);
    await queryRunner.query(`CREATE UNIQUE INDEX uq_users_tenant_identification_active ON users (tenant_id, identification_number) WHERE deleted_at IS NULL AND identification_number IS NOT NULL`);

    await queryRunner.query(`
      CREATE TABLE roles (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
        name varchar(120) NOT NULL,
        code varchar(120) NOT NULL,
        status status_enum NOT NULL DEFAULT 'ACTIVE',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX uq_roles_tenant_code_active ON roles (tenant_id, code) WHERE deleted_at IS NULL`);

    await queryRunner.query(`
      CREATE TABLE permissions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code varchar(160) NOT NULL,
        description varchar(255),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX uq_permissions_code_active ON permissions (code) WHERE deleted_at IS NULL`);

    await queryRunner.query(`
      CREATE TABLE user_roles (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        created_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_user_roles_user_role_tenant UNIQUE (user_id, role_id, tenant_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE role_permissions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
        tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
        created_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_role_permissions_role_permission_tenant UNIQUE (role_id, permission_id, tenant_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE actors (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        type actor_type_enum NOT NULL,
        name varchar(180) NOT NULL,
        email varchar(180),
        identification_number varchar(60),
        phone varchar(40),
        status status_enum NOT NULL DEFAULT 'ACTIVE',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX uq_actors_tenant_email_active ON actors (tenant_id, email) WHERE deleted_at IS NULL AND email IS NOT NULL`);
    await queryRunner.query(`CREATE UNIQUE INDEX uq_actors_tenant_identification_active ON actors (tenant_id, identification_number) WHERE deleted_at IS NULL AND identification_number IS NOT NULL`);

    await queryRunner.query(`
      CREATE TABLE actor_roles (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        actor_id uuid NOT NULL REFERENCES actors(id) ON DELETE CASCADE,
        role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        created_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_actor_roles_actor_role_tenant UNIQUE (actor_id, role_id, tenant_id)
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE actor_roles`);
    await queryRunner.query(`DROP TABLE actors`);
    await queryRunner.query(`DROP TABLE role_permissions`);
    await queryRunner.query(`DROP TABLE user_roles`);
    await queryRunner.query(`DROP TABLE permissions`);
    await queryRunner.query(`DROP TABLE roles`);
    await queryRunner.query(`DROP TABLE users`);
    await queryRunner.query(`DROP TABLE tenants`);
    await queryRunner.query(`DROP TYPE actor_type_enum`);
    await queryRunner.query(`DROP TYPE user_type_enum`);
    await queryRunner.query(`DROP TYPE status_enum`);
  }
}
