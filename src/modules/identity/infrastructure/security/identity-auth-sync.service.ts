import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { hashPassword } from 'better-auth/crypto';
import { UserType } from '../../domain/enums/user-type.enum';

type ProvisionUserInput = {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  permissions?: string[];
  companyId?: string | null;
  branchId?: string | null;
};

type ProvisionOrganizationInput = {
  id: string;
  name: string;
  slug?: string | null;
};

@Injectable()
export class IdentityAuthSyncService {
  constructor(private readonly dataSource: DataSource) {}

  async provisionOrganization(input: ProvisionOrganizationInput): Promise<void> {
    await this.dataSource.query(
      `
        INSERT INTO ba_organization (id, name, slug, created_at, updated_at)
        VALUES ($1, $2, $3, now(), now())
        ON CONFLICT (id) DO UPDATE
        SET name = EXCLUDED.name,
            slug = EXCLUDED.slug,
            updated_at = now()
      `,
      [input.id, input.name, input.slug ?? this.toSlug(input.name, input.id)],
    );
  }

  async provisionUser(input: ProvisionUserInput): Promise<void> {
    const normalizedEmail = input.email.toLowerCase();
    const name = `${input.firstName} ${input.lastName}`.trim();
    const permissions = input.permissions ?? [];
    const passwordHash = await hashPassword(input.password);

    await this.dataSource.transaction(async (manager) => {
      await manager.query(
        `
          INSERT INTO ba_user (id, name, email, email_verified, image, user_type, permissions, company_id, branch_id, created_at, updated_at)
          VALUES ($1, $2, $3, false, null, $4, $5, $6, $7, now(), now())
          ON CONFLICT (id) DO UPDATE
          SET name = EXCLUDED.name,
              email = EXCLUDED.email,
              user_type = EXCLUDED.user_type,
              permissions = EXCLUDED.permissions,
              company_id = EXCLUDED.company_id,
              branch_id = EXCLUDED.branch_id,
              updated_at = now()
        `,
        [input.id, name, normalizedEmail, input.userType, permissions, input.companyId ?? null, input.branchId ?? null],
      );

      const existingAccount = await manager.query<{ id: string }[]>(
        `
          SELECT id
          FROM ba_account
          WHERE user_id = $1 AND provider_id = 'credential'
          LIMIT 1
        `,
        [input.id],
      );

      if (existingAccount.length > 0) {
        await manager.query(
          `
            UPDATE ba_account
            SET account_id = $1,
                password = $2,
                updated_at = now()
            WHERE id = $3
          `,
          [input.id, passwordHash, existingAccount[0].id],
        );
      } else {
        await manager.query(
          `
            INSERT INTO ba_account (id, account_id, provider_id, user_id, password, created_at, updated_at)
            VALUES ($1, $2, 'credential', $2, $3, now(), now())
          `,
          [randomUUID(), input.id, passwordHash],
        );
      }

      if (input.companyId) {
        await manager.query(
          `
            INSERT INTO ba_member (id, organization_id, user_id, role, created_at)
            VALUES ($1, $2, $3, $4, now())
            ON CONFLICT (organization_id, user_id) DO UPDATE
            SET role = EXCLUDED.role
          `,
          [randomUUID(), input.companyId, input.id, input.userType === UserType.COMPANY_ADMIN ? 'admin' : 'member'],
        );
      }
    });
  }

  async syncUserPermissions(userId: string): Promise<string[]> {
    const rows = await this.dataSource.query<Array<{ code: string }>>(
      `
        SELECT DISTINCT permission.code AS code
        FROM user_roles user_role
        INNER JOIN roles role ON role.id = user_role.role_id AND role.deleted_at IS NULL
        INNER JOIN role_permissions role_permission ON role_permission.role_id = role.id
        INNER JOIN permissions permission ON permission.id = role_permission.permission_id AND permission.deleted_at IS NULL
        WHERE user_role.user_id = $1
        ORDER BY permission.code
      `,
      [userId],
    );
    const permissions = rows.map((row) => row.code);

    await this.dataSource.query(
      `
        UPDATE ba_user
        SET permissions = $2,
            updated_at = now()
        WHERE id = $1
      `,
      [userId, permissions],
    );

    return permissions;
  }

  private toSlug(name: string, id: string): string {
    const slug = name
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 80);

    return `${slug || 'company'}-${id.slice(0, 8)}`;
  }
}
