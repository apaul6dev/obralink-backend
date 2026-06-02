import 'dotenv/config';
import * as bcrypt from 'bcrypt';
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

async function seedGlobalAdmin(): Promise<void> {
  await dataSource.initialize();

  const email = requiredEnv('GLOBAL_ADMIN_EMAIL', 'admin@obralink.local').toLowerCase();
  const password = requiredEnv('GLOBAL_ADMIN_PASSWORD', 'Admin123!');
  const firstName = requiredEnv('GLOBAL_ADMIN_FIRST_NAME', 'Global');
  const lastName = requiredEnv('GLOBAL_ADMIN_LAST_NAME', 'Admin');
  const identificationNumber = process.env.GLOBAL_ADMIN_IDENTIFICATION_NUMBER?.trim() || null;

  const users = dataSource.getRepository(UserOrmEntity);
  const existing = await users.findOne({
    where: {
      email,
      userType: UserType.GLOBAL_ADMIN,
    },
    withDeleted: true,
  });

  const passwordHash = await bcrypt.hash(password, 12);

  if (existing) {
    existing.tenantId = null;
    existing.passwordHash = passwordHash;
    existing.firstName = firstName;
    existing.lastName = lastName;
    existing.identificationNumber = identificationNumber;
    existing.status = Status.ACTIVE;
    existing.deletedAt = null;
    await users.save(existing);
    console.log(`Global admin updated: ${email}`);
    return;
  }

  await users.save(
    users.create({
      tenantId: null,
      email,
      passwordHash,
      firstName,
      lastName,
      userType: UserType.GLOBAL_ADMIN,
      status: Status.ACTIVE,
      identificationNumber,
    }),
  );

  console.log(`Global admin created: ${email}`);
}

seedGlobalAdmin()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Global admin seed failed: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });
