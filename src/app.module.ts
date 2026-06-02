import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { IdentityModule } from './modules/identity/identity.module';
import { typeOrmConfigFactory } from './shared/infrastructure/database/typeorm.config';
import { RequestContextModule } from './shared/infrastructure/context/request-context.module';
import { AllExceptionsFilter } from './shared/infrastructure/exceptions/all-exceptions.filter';
import { LoggerModule } from './shared/infrastructure/logger/logger.module';
import { RequestTracingInterceptor } from './shared/infrastructure/tracing/request-tracing.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RequestContextModule,
    LoggerModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: typeOrmConfigFactory,
    }),
    AuthModule,
    IdentityModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestTracingInterceptor,
    },
  ],
})
export class AppModule {}
