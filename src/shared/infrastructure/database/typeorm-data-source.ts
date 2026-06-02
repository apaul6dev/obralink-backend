import 'dotenv/config';
import { DataSource } from 'typeorm';
import { appOrmEntities } from './typeorm.config';
import { CreateAuthSchema1780272000002 } from '../../../modules/auth/infrastructure/persistence/typeorm/migrations/1780272000002-create-auth-schema';
import { CreateIdentitySchema1780272000001 } from '../../../modules/identity/infrastructure/persistence/typeorm/migrations/1780272000001-create-identity-schema';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_DATABASE ?? 'obralink',
  entities: appOrmEntities,
  migrations: [CreateIdentitySchema1780272000001, CreateAuthSchema1780272000002],
  synchronize: false,
});
