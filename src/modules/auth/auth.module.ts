import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionOrmEntity } from '../identity/infrastructure/persistence/typeorm/entities/permission.orm-entity';
import { RolePermissionOrmEntity } from '../identity/infrastructure/persistence/typeorm/entities/role-permission.orm-entity';
import { RoleOrmEntity } from '../identity/infrastructure/persistence/typeorm/entities/role.orm-entity';
import { TenantOrmEntity } from '../identity/infrastructure/persistence/typeorm/entities/tenant.orm-entity';
import { UserRoleOrmEntity } from '../identity/infrastructure/persistence/typeorm/entities/user-role.orm-entity';
import { UserOrmEntity } from '../identity/infrastructure/persistence/typeorm/entities/user.orm-entity';
import { ChangePasswordHandler } from './application/command-handlers/change-password.handler';
import { ForgotPasswordHandler } from './application/command-handlers/forgot-password.handler';
import { LoginHandler } from './application/command-handlers/login.handler';
import { LogoutAllDevicesHandler } from './application/command-handlers/logout-all-devices.handler';
import { LogoutHandler } from './application/command-handlers/logout.handler';
import { RefreshTokenHandler } from './application/command-handlers/refresh-token.handler';
import { ResetPasswordHandler } from './application/command-handlers/reset-password.handler';
import { ValidateAccessTokenHandler } from './application/command-handlers/validate-access-token.handler';
import { GetActiveSessionsHandler } from './application/query-handlers/get-active-sessions.handler';
import { GetCurrentUserHandler } from './application/query-handlers/get-current-user.handler';
import { AUTH_EVENT_REPOSITORY, AUTH_USER_REPOSITORY, PASSWORD_RESET_TOKEN_REPOSITORY, REFRESH_TOKEN_REPOSITORY, USER_SESSION_REPOSITORY } from './domain/repositories/repository-tokens';
import { PASSWORD_HASHER } from './domain/services/password-hasher.interface';
import { TOKEN_GENERATOR } from './domain/services/token-generator.interface';
import { AuthEventOrmEntity } from './infrastructure/persistence/typeorm/entities/auth-event.orm-entity';
import { PasswordResetTokenOrmEntity } from './infrastructure/persistence/typeorm/entities/password-reset-token.orm-entity';
import { RefreshTokenOrmEntity } from './infrastructure/persistence/typeorm/entities/refresh-token.orm-entity';
import { UserSessionOrmEntity } from './infrastructure/persistence/typeorm/entities/user-session.orm-entity';
import { TypeOrmAuthEventRepository } from './infrastructure/persistence/typeorm/repositories/typeorm-auth-event.repository';
import { TypeOrmAuthUserRepository } from './infrastructure/persistence/typeorm/repositories/typeorm-auth-user.repository';
import { TypeOrmPasswordResetTokenRepository } from './infrastructure/persistence/typeorm/repositories/typeorm-password-reset-token.repository';
import { TypeOrmRefreshTokenRepository } from './infrastructure/persistence/typeorm/repositories/typeorm-refresh-token.repository';
import { TypeOrmUserSessionRepository } from './infrastructure/persistence/typeorm/repositories/typeorm-user-session.repository';
import { BcryptPasswordHasher } from './infrastructure/security/bcrypt-password-hasher.service';
import { JwtStrategy } from './infrastructure/security/jwt.strategy';
import { JwtTokenGenerator } from './infrastructure/security/jwt-token-generator.service';
import { LocalStrategy } from './infrastructure/security/local.strategy';
import { AuthController } from './presentation/controllers/auth.controller';
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';
import { LocalAuthGuard } from './presentation/guards/local-auth.guard';

const commandHandlers = [
  LoginHandler,
  RefreshTokenHandler,
  LogoutHandler,
  LogoutAllDevicesHandler,
  ForgotPasswordHandler,
  ResetPasswordHandler,
  ChangePasswordHandler,
  ValidateAccessTokenHandler,
];

const queryHandlers = [
  GetCurrentUserHandler,
  GetActiveSessionsHandler,
];

@Module({
  imports: [
    CqrsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'change-me'),
      }),
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          name: 'default',
          ttl: Number(configService.get<string>('AUTH_RATE_LIMIT_TTL_MS', '60000')),
          limit: Number(configService.get<string>('AUTH_RATE_LIMIT_LIMIT', '20')),
        },
        {
          name: 'login',
          ttl: Number(configService.get<string>('AUTH_LOGIN_RATE_LIMIT_TTL_MS', '60000')),
          limit: Number(configService.get<string>('AUTH_LOGIN_RATE_LIMIT_LIMIT', '5')),
        },
        {
          name: 'passwordRecovery',
          ttl: Number(configService.get<string>('AUTH_PASSWORD_RECOVERY_RATE_LIMIT_TTL_MS', '300000')),
          limit: Number(configService.get<string>('AUTH_PASSWORD_RECOVERY_RATE_LIMIT_LIMIT', '3')),
        },
      ],
    }),
    TypeOrmModule.forFeature([
      UserOrmEntity,
      TenantOrmEntity,
      UserRoleOrmEntity,
      RoleOrmEntity,
      RolePermissionOrmEntity,
      PermissionOrmEntity,
      UserSessionOrmEntity,
      RefreshTokenOrmEntity,
      PasswordResetTokenOrmEntity,
      AuthEventOrmEntity,
    ]),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    LocalStrategy,
    JwtAuthGuard,
    LocalAuthGuard,
    { provide: AUTH_USER_REPOSITORY, useClass: TypeOrmAuthUserRepository },
    { provide: USER_SESSION_REPOSITORY, useClass: TypeOrmUserSessionRepository },
    { provide: REFRESH_TOKEN_REPOSITORY, useClass: TypeOrmRefreshTokenRepository },
    { provide: PASSWORD_RESET_TOKEN_REPOSITORY, useClass: TypeOrmPasswordResetTokenRepository },
    { provide: AUTH_EVENT_REPOSITORY, useClass: TypeOrmAuthEventRepository },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: TOKEN_GENERATOR, useClass: JwtTokenGenerator },
    ...commandHandlers,
    ...queryHandlers,
  ],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
