import 'dotenv/config';
import { DataSource } from 'typeorm';
import { appOrmEntities } from './typeorm.config';
import { Setup1780272000001 } from './migrations/setup';
import { AddBetterAuth1780272000002 } from './migrations/add-better-auth';
import { AddMenuManagement1780272000003 } from './migrations/add-menu-management';
import { AddCompanyBranches1780272000004 } from './migrations/add-company-branches';
import { AddBranchAdminUserType1780272000005 } from './migrations/add-branch-admin-user-type';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_DATABASE ?? 'obralink',
  entities: appOrmEntities,
  migrations: [
    Setup1780272000001,
    AddBetterAuth1780272000002,
    AddMenuManagement1780272000003,
    AddCompanyBranches1780272000004,
    AddBranchAdminUserType1780272000005,
  ],
  synchronize: false,
});
