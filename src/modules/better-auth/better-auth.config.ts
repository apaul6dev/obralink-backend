import 'dotenv/config';
import { Pool } from 'pg';
import { betterAuth } from 'better-auth';
import { organization } from 'better-auth/plugins';
import { UserType } from '../identity/domain/enums/user-type.enum';

const databasePool = new Pool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_DATABASE ?? 'obralink',
});

export const betterAuthConfig = betterAuth({
  appName: process.env.BETTER_AUTH_APP_NAME ?? 'Obralink',
  baseURL: process.env.BETTER_AUTH_URL ?? `http://localhost:${process.env.PORT ?? 3000}`,
  basePath: process.env.BETTER_AUTH_BASE_PATH ?? '/api/auth',
  secret: process.env.BETTER_AUTH_SECRET ?? 'change-me',
  trustedOrigins: (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? 'http://localhost:3000,http://localhost:3001')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  database: databasePool,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    disableSignUp: true,
  },
  user: {
    modelName: 'ba_user',
    fields: {
      emailVerified: 'email_verified',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    additionalFields: {
      userType: {
        type: 'string',
        required: false,
        defaultValue: UserType.COMPANY_USER,
        fieldName: 'user_type',
      },
      permissions: {
        type: 'string[]',
        required: false,
        defaultValue: [],
        fieldName: 'permissions',
      },
    },
  },
  session: {
    modelName: 'ba_session',
    fields: {
      expiresAt: 'expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      ipAddress: 'ip_address',
      userAgent: 'user_agent',
      userId: 'user_id',
    },
  },
  account: {
    modelName: 'ba_account',
    fields: {
      accountId: 'account_id',
      providerId: 'provider_id',
      userId: 'user_id',
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      accessTokenExpiresAt: 'access_token_expires_at',
      refreshTokenExpiresAt: 'refresh_token_expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  verification: {
    modelName: 'ba_verification',
    fields: {
      expiresAt: 'expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  plugins: [
    organization({
      schema: {
        organization: {
          modelName: 'ba_organization',
          fields: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
          },
        },
        member: {
          modelName: 'ba_member',
          fields: {
            organizationId: 'organization_id',
            userId: 'user_id',
            createdAt: 'created_at',
          },
        },
        invitation: {
          modelName: 'ba_invitation',
          fields: {
            organizationId: 'organization_id',
            expiresAt: 'expires_at',
            createdAt: 'created_at',
            inviterId: 'inviter_id',
          },
        },
        session: {
          fields: {
            activeOrganizationId: 'active_organization_id',
          },
        },
      },
    }),
  ],
  hooks: {},
});

export type BetterAuthInstance = typeof betterAuthConfig;
