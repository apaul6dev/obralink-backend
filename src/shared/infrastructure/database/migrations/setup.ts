import { MigrationInterface, QueryRunner } from 'typeorm';

export class Setup1780272000001 implements MigrationInterface {
  name = 'Setup1780272000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    await this.createTypes(queryRunner);
    await this.createIdentityTables(queryRunner);
    await this.ensureCompanyProfileColumns(queryRunner);
    await this.createIndexes(queryRunner);
    await this.addComments(queryRunner);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS menu_item_permissions CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS menu_items CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS role_permissions CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS user_roles CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS permissions CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS app_modules CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS roles CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS users CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS companies CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_type_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS status_enum`);
  }

  private async createTypes(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE user_type_enum AS ENUM ('SYSTEM_OWNER', 'COMPANY_ADMIN', 'BRANCH_ADMIN', 'COMPANY_USER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
  }

  private async createIdentityTables(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(160) NOT NULL,
        legal_name varchar(200),
        tax_id varchar(60),
        contact_name varchar(160),
        email varchar(180),
        phone varchar(40),
        address varchar(240),
        city varchar(120),
        state varchar(80),
        customer_type varchar(120),
        industry varchar(120),
        billing_email varchar(180),
        payment_terms varchar(120),
        customer_status varchar(40) NOT NULL DEFAULT 'LEAD',
        assigned_account_manager varchar(160),
        status status_enum NOT NULL DEFAULT 'INACTIVE',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id uuid REFERENCES companies(id) ON DELETE RESTRICT,
        email varchar(180) NOT NULL,
        first_name varchar(100) NOT NULL,
        last_name varchar(100) NOT NULL,
        user_type user_type_enum NOT NULL,
        status status_enum NOT NULL DEFAULT 'ACTIVE',
        identification_number varchar(60),
        personal_email varchar(180),
        phone_number varchar(40),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
        name varchar(120) NOT NULL,
        code varchar(120) NOT NULL,
        status status_enum NOT NULL DEFAULT 'ACTIVE',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS app_modules (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code varchar(80) NOT NULL,
        name varchar(120) NOT NULL,
        description varchar(255),
        icon varchar(80),
        display_order int NOT NULL DEFAULT 0,
        status status_enum NOT NULL DEFAULT 'ACTIVE',
        is_system boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code varchar(160) NOT NULL,
        description varchar(255),
        category varchar(20) NOT NULL DEFAULT 'API',
        module_id uuid NOT NULL REFERENCES app_modules(id) ON DELETE RESTRICT,
        action varchar(80) NOT NULL,
        label varchar(160) NOT NULL,
        is_system boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        created_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_user_roles_user_role_company UNIQUE (user_id, role_id, company_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
        company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
        created_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_role_permissions_role_permission_company UNIQUE (role_id, permission_id, company_id)
      )
    `);

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

  }

  private async ensureCompanyProfileColumns(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE companies
        ADD COLUMN IF NOT EXISTS tax_id varchar(60),
        ADD COLUMN IF NOT EXISTS contact_name varchar(160),
        ADD COLUMN IF NOT EXISTS email varchar(180),
        ADD COLUMN IF NOT EXISTS phone varchar(40),
        ADD COLUMN IF NOT EXISTS address varchar(240),
        ADD COLUMN IF NOT EXISTS city varchar(120),
        ADD COLUMN IF NOT EXISTS state varchar(80),
        ADD COLUMN IF NOT EXISTS customer_type varchar(120),
        ADD COLUMN IF NOT EXISTS industry varchar(120),
        ADD COLUMN IF NOT EXISTS billing_email varchar(180),
        ADD COLUMN IF NOT EXISTS payment_terms varchar(120),
        ADD COLUMN IF NOT EXISTS customer_status varchar(40) NOT NULL DEFAULT 'LEAD',
        ADD COLUMN IF NOT EXISTS assigned_account_manager varchar(160)
    `);
  }

  private async createIndexes(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_users_company_email_active ON users (company_id, email) WHERE deleted_at IS NULL`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_users_company_identification_active ON users (company_id, identification_number) WHERE deleted_at IS NULL AND identification_number IS NOT NULL`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_roles_company_code_active ON roles (company_id, code) WHERE deleted_at IS NULL`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_app_modules_code_active ON app_modules (code) WHERE deleted_at IS NULL`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_permissions_code_active ON permissions (code) WHERE deleted_at IS NULL`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS ix_permissions_category_module ON permissions (category, module_id) WHERE deleted_at IS NULL`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_menu_items_code_active ON menu_items (code) WHERE deleted_at IS NULL`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS ix_menu_items_parent_order ON menu_items (parent_id, display_order) WHERE deleted_at IS NULL`);
  }

  private async addComments(queryRunner: QueryRunner): Promise<void> {
    const tableComments: Array<[string, string]> = [
      ['companies', 'Empresas registradas en la plataforma; separan clientes y su configuracion operativa.'],
      ['users', 'Usuarios que pueden autenticarse en el sistema, sean dueños del sistema o asociados a una empresa.'],
      ['roles', 'Roles de autorizacion disponibles globalmente o por empresa.'],
      ['app_modules', 'Modulos funcionales de la aplicacion usados para agrupar permisos, menu y capacidades.'],
      ['permissions', 'Permisos atomicos usados para autorizar acciones de API y pantallas UI.'],
      ['user_roles', 'Relacion entre usuarios y roles asignados dentro de una empresa.'],
      ['role_permissions', 'Relacion entre roles y permisos concedidos.'],
      ['menu_items', 'Opciones de menu disponibles en el frontend, filtradas por tipo de usuario y permisos.'],
      ['menu_item_permissions', 'Permisos requeridos para mostrar una opcion de menu.'],
    ];

    const columnComments: Array<[string, string, string]> = [
      ['companies', 'id', 'Identificador unico de la empresa.'],
      ['companies', 'name', 'Nombre comercial visible de la empresa.'],
      ['companies', 'legal_name', 'Razon social legal de la empresa.'],
      ['companies', 'tax_id', 'Identificador fiscal de la empresa.'],
      ['companies', 'contact_name', 'Nombre del contacto principal de la empresa.'],
      ['companies', 'email', 'Correo principal de contacto de la empresa.'],
      ['companies', 'phone', 'Telefono principal de contacto de la empresa.'],
      ['companies', 'address', 'Direccion fisica principal de la empresa.'],
      ['companies', 'city', 'Ciudad donde opera o esta registrada la empresa.'],
      ['companies', 'state', 'Estado, provincia o region de la empresa.'],
      ['companies', 'customer_type', 'Tipo comercial del cliente, por ejemplo contratista general o subcontratista.'],
      ['companies', 'industry', 'Industria o sector al que pertenece la empresa.'],
      ['companies', 'billing_email', 'Correo usado para facturacion y comunicaciones de cobro.'],
      ['companies', 'payment_terms', 'Terminos de pago acordados con la empresa.'],
      ['companies', 'customer_status', 'Estado comercial de la cuenta: LEAD o CUSTOMER.'],
      ['companies', 'assigned_account_manager', 'Responsable comercial asignado a la cuenta.'],
      ['companies', 'status', 'Estado operativo de la empresa dentro del sistema: activo, inactivo o suspendido.'],
      ['companies', 'created_at', 'Fecha y hora de creacion del registro.'],
      ['companies', 'updated_at', 'Fecha y hora de ultima actualizacion del registro.'],
      ['companies', 'deleted_at', 'Fecha y hora de eliminacion logica, si aplica.'],
      ['users', 'id', 'Identificador unico del usuario.'],
      ['users', 'company_id', 'Empresa a la que pertenece el usuario; nulo para dueños del sistema.'],
      ['users', 'email', 'Correo usado como credencial de inicio de sesion.'],
      ['users', 'first_name', 'Nombres del usuario.'],
      ['users', 'last_name', 'Apellidos del usuario.'],
      ['users', 'user_type', 'Tipo de usuario: dueño del sistema, administrador de empresa o usuario interno.'],
      ['users', 'status', 'Estado operativo del usuario.'],
      ['users', 'identification_number', 'Numero de identificacion personal del usuario, si aplica.'],
      ['users', 'personal_email', 'Correo personal opcional del usuario.'],
      ['users', 'phone_number', 'Numero de telefono opcional del usuario.'],
      ['users', 'created_at', 'Fecha y hora de creacion del usuario.'],
      ['users', 'updated_at', 'Fecha y hora de ultima actualizacion del usuario.'],
      ['users', 'deleted_at', 'Fecha y hora de eliminacion logica del usuario.'],
      ['roles', 'id', 'Identificador unico del rol.'],
      ['roles', 'company_id', 'Empresa propietaria del rol; nulo para plantillas globales.'],
      ['roles', 'name', 'Nombre legible del rol.'],
      ['roles', 'code', 'Codigo estable del rol para asignaciones y reglas.'],
      ['roles', 'status', 'Estado operativo del rol.'],
      ['roles', 'created_at', 'Fecha y hora de creacion del rol.'],
      ['roles', 'updated_at', 'Fecha y hora de ultima actualizacion del rol.'],
      ['roles', 'deleted_at', 'Fecha y hora de eliminacion logica del rol.'],
      ['app_modules', 'id', 'Identificador unico del modulo funcional.'],
      ['app_modules', 'code', 'Codigo estable del modulo funcional.'],
      ['app_modules', 'name', 'Nombre visible del modulo funcional.'],
      ['app_modules', 'description', 'Descripcion funcional del modulo.'],
      ['app_modules', 'icon', 'Icono Material sugerido para el modulo.'],
      ['app_modules', 'display_order', 'Orden visual usado en catalogos de administracion.'],
      ['app_modules', 'status', 'Estado operativo del modulo.'],
      ['app_modules', 'is_system', 'Indica si el modulo es mantenido por seeds de plataforma.'],
      ['app_modules', 'created_at', 'Fecha y hora de creacion del modulo.'],
      ['app_modules', 'updated_at', 'Fecha y hora de ultima actualizacion del modulo.'],
      ['app_modules', 'deleted_at', 'Fecha y hora de eliminacion logica del modulo.'],
      ['permissions', 'id', 'Identificador unico del permiso.'],
      ['permissions', 'code', 'Codigo estable del permiso para autorizacion.'],
      ['permissions', 'description', 'Descripcion funcional del permiso.'],
      ['permissions', 'category', 'Categoria del permiso usada por administracion: API o UI.'],
      ['permissions', 'module_id', 'Modulo funcional usado para agrupar permisos.'],
      ['permissions', 'action', 'Accion autorizada dentro del modulo funcional.'],
      ['permissions', 'label', 'Etiqueta legible mostrada en pantallas de administracion.'],
      ['permissions', 'is_system', 'Indica si el permiso es mantenido por seeds de plataforma.'],
      ['permissions', 'created_at', 'Fecha y hora de creacion del permiso.'],
      ['permissions', 'updated_at', 'Fecha y hora de ultima actualizacion del permiso.'],
      ['permissions', 'deleted_at', 'Fecha y hora de eliminacion logica del permiso.'],
      ['user_roles', 'id', 'Identificador unico de la asignacion usuario-rol.'],
      ['user_roles', 'user_id', 'Usuario que recibe el rol.'],
      ['user_roles', 'role_id', 'Rol asignado al usuario.'],
      ['user_roles', 'company_id', 'Empresa donde aplica la asignacion.'],
      ['user_roles', 'created_at', 'Fecha y hora de creacion de la asignacion.'],
      ['role_permissions', 'id', 'Identificador unico de la asignacion rol-permiso.'],
      ['role_permissions', 'role_id', 'Rol que recibe el permiso.'],
      ['role_permissions', 'permission_id', 'Permiso concedido al rol.'],
      ['role_permissions', 'company_id', 'Empresa donde aplica la asignacion; nulo para global.'],
      ['role_permissions', 'created_at', 'Fecha y hora de creacion de la asignacion.'],
      ['menu_items', 'id', 'Identificador unico de la opcion de menu.'],
      ['menu_items', 'code', 'Codigo estable usado como identificador del menu en el frontend.'],
      ['menu_items', 'title_key', 'Clave i18n del titulo visible del menu.'],
      ['menu_items', 'router_link', 'Ruta interna Angular asociada a la opcion.'],
      ['menu_items', 'href', 'URL externa asociada a la opcion, si aplica.'],
      ['menu_items', 'icon', 'Icono Material mostrado en el menu.'],
      ['menu_items', 'target', 'Target de navegacion externa, si aplica.'],
      ['menu_items', 'parent_id', 'Opcion padre para construir jerarquias de menu.'],
      ['menu_items', 'display_order', 'Orden visual dentro del mismo nivel.'],
      ['menu_items', 'allowed_user_types', 'Tipos de usuario permitidos; nulo significa sin restriccion por tipo.'],
      ['menu_items', 'status', 'Estado operativo de la opcion de menu.'],
      ['menu_items', 'created_at', 'Fecha y hora de creacion del item.'],
      ['menu_items', 'updated_at', 'Fecha y hora de ultima actualizacion del item.'],
      ['menu_items', 'deleted_at', 'Fecha y hora de eliminacion logica del item.'],
      ['menu_item_permissions', 'id', 'Identificador unico de la restriccion menu-permiso.'],
      ['menu_item_permissions', 'menu_item_id', 'Opcion de menu protegida por el permiso.'],
      ['menu_item_permissions', 'permission_id', 'Permiso requerido para mostrar la opcion.'],
      ['menu_item_permissions', 'created_at', 'Fecha y hora de creacion de la restriccion.'],
    ];

    for (const [table, comment] of tableComments) {
      await queryRunner.query(`COMMENT ON TABLE ${table} IS '${this.escapeComment(comment)}'`);
    }

    for (const [table, column, comment] of columnComments) {
      await queryRunner.query(`COMMENT ON COLUMN ${table}.${column} IS '${this.escapeComment(comment)}'`);
    }
  }

  private escapeComment(comment: string): string {
    return comment.replace(/'/g, "''");
  }
}
