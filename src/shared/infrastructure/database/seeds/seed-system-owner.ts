import 'dotenv/config';
import { hashPassword } from 'better-auth/crypto';
import dataSource from '../typeorm-data-source';
import { UserOrmEntity } from '../../../../modules/identity/infrastructure/persistence/typeorm/entities/user.orm-entity';
import { Status } from '../../../../modules/identity/domain/enums/status.enum';
import { UserType } from '../../../../modules/identity/domain/enums/user-type.enum';

function requiredEnv(name: string, fallback: string): string {
  const value = process.env[name]?.trim() || fallback;
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

async function seedSystemOwner(): Promise<void> {
  await dataSource.initialize();

  const email = requiredEnv('SYSTEM_OWNER_EMAIL', 'admin@obralink.local').toLowerCase();
  const password = requiredEnv('SYSTEM_OWNER_PASSWORD', 'Admin123!');
  const firstName = requiredEnv('SYSTEM_OWNER_FIRST_NAME', 'System');
  const lastName = requiredEnv('SYSTEM_OWNER_LAST_NAME', 'Owner');
  const identificationNumber = process.env.SYSTEM_OWNER_IDENTIFICATION_NUMBER?.trim() || null;

  const users = dataSource.getRepository(UserOrmEntity);
  const existing = await users.findOne({
    where: {
      email,
      userType: UserType.SYSTEM_OWNER,
    },
    withDeleted: true,
  });

  const betterAuthPasswordHash = await hashPassword(password);

  if (existing) {
    existing.companyId = null;
    existing.firstName = firstName;
    existing.lastName = lastName;
    existing.identificationNumber = identificationNumber;
    existing.status = Status.ACTIVE;
    existing.deletedAt = null;
    const saved = await users.save(existing);
    await upsertBetterAuthSystemOwner(saved.id, email, firstName, lastName, betterAuthPasswordHash);
    console.log(`System owner updated: ${email}`);
    return;
  }

  const saved = await users.save(
    users.create({
      companyId: null,
      email,
      firstName,
      lastName,
      userType: UserType.SYSTEM_OWNER,
      status: Status.ACTIVE,
      identificationNumber,
      personalEmail: null,
      phoneNumber: null,
    }),
  );
  await upsertBetterAuthSystemOwner(saved.id, email, firstName, lastName, betterAuthPasswordHash);

  console.log(`System owner created: ${email}`);
}

async function upsertBetterAuthSystemOwner(userId: string, email: string, firstName: string, lastName: string, passwordHash: string): Promise<void> {
  await dataSource.transaction(async (manager) => {
    await manager.query(
      `
        INSERT INTO ba_user (id, name, email, email_verified, image, user_type, permissions, created_at, updated_at)
        VALUES ($1, $2, $3, true, null, $4, $5, now(), now())
        ON CONFLICT (id) DO UPDATE
        SET name = EXCLUDED.name,
            email = EXCLUDED.email,
            email_verified = true,
            user_type = EXCLUDED.user_type,
            permissions = EXCLUDED.permissions,
            updated_at = now()
      `,
      [userId, `${firstName} ${lastName}`.trim(), email, UserType.SYSTEM_OWNER, []],
    );

    const existingAccount = await manager.query<{ id: string }[]>(
      `
        SELECT id
        FROM ba_account
        WHERE user_id = $1 AND provider_id = 'credential'
        LIMIT 1
      `,
      [userId],
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
        [userId, passwordHash, existingAccount[0].id],
      );
      return;
    }

    await manager.query(
      `
        INSERT INTO ba_account (id, account_id, provider_id, user_id, password, created_at, updated_at)
        VALUES (gen_random_uuid()::text, $1, 'credential', $1, $2, now(), now())
      `,
      [userId, passwordHash],
    );
  });
}

seedSystemOwner()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`System owner seed failed: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });
