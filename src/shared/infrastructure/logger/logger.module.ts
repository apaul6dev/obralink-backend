import { Global, Module } from '@nestjs/common';
import { RequestContextModule } from '../context/request-context.module';
import { AppLogger } from './app-logger.service';

@Global()
@Module({
  imports: [RequestContextModule],
  providers: [AppLogger],
  exports: [AppLogger],
})
export class LoggerModule {}
