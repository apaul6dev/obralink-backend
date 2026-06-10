import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMenuManagement1780272000003 implements MigrationInterface {
  name = 'AddMenuManagement1780272000003';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code varchar(120) NOT NULL,
        title_key varchar(160) NOT NULL,
        router_link varchar(240),
        href varchar(240),
        icon varchar(80) NOT NULL,
        target varchar(40),
        parent_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
        display_order int NOT NULL DEFAULT 0,
        allowed_user_types user_type_enum[],
        status status_enum NOT NULL DEFAULT 'ACTIVE',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS menu_item_permissions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        menu_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
        permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
        created_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_menu_item_permissions_menu_permission UNIQUE (menu_item_id, permission_id)
      )
    `);

    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_menu_items_code_active ON menu_items (code) WHERE deleted_at IS NULL`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS ix_menu_items_parent_order ON menu_items (parent_id, display_order) WHERE deleted_at IS NULL`);
    await queryRunner.query(`COMMENT ON TABLE menu_items IS 'Menu options available in the frontend, filtered by user type and permissions.'`);
    await queryRunner.query(`COMMENT ON TABLE menu_item_permissions IS 'Permissions required to display a menu option.'`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS menu_item_permissions CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS menu_items CASCADE`);
  }
}
