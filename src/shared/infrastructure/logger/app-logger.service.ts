import { ConsoleLogger, Injectable, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RequestContextService } from '../context/request-context.service';

const validLogLevels = new Set<LogLevel>(['fatal', 'error', 'warn', 'log', 'debug', 'verbose']);

function parseLogLevels(value: string | undefined): LogLevel[] {
  const configuredLevels = value?.split(',').map((level) => level.trim()).filter(Boolean) ?? [];
  const levels = configuredLevels.filter((level): level is LogLevel => validLogLevels.has(level as LogLevel));
  return levels.length > 0 ? levels : ['error', 'warn', 'log', 'debug'];
}

@Injectable()
export class AppLogger extends ConsoleLogger {
  constructor(configService: ConfigService, private readonly requestContext: RequestContextService) {
    super({
      prefix: configService.get<string>('LOG_PREFIX', 'Obralink'),
      logLevels: parseLogLevels(configService.get<string>('LOG_LEVELS', 'error,warn,log,debug')),
      timestamp: configService.get<string>('LOG_TIMESTAMP', 'true') === 'true',
      json: configService.get<string>('LOG_JSON', 'false') === 'true',
      colors: configService.get<string>('LOG_COLORS', 'true') === 'true',
    });
  }

  override log(message: unknown, context?: string): void {
    super.log(this.withRequestContext(message), context);
  }

  override warn(message: unknown, context?: string): void {
    super.warn(this.withRequestContext(message), context);
  }

  override error(message: unknown, stackOrContext?: string, context?: string): void {
    super.error(this.withRequestContext(message), stackOrContext, context);
  }

  override debug(message: unknown, context?: string): void {
    super.debug(this.withRequestContext(message), context);
  }

  override verbose(message: unknown, context?: string): void {
    super.verbose(this.withRequestContext(message), context);
  }

  private withRequestContext(message: unknown): unknown {
    const context = this.requestContext.get();
    if (!context || typeof message !== 'string') {
      return message;
    }

    return `${message} trackingId=${context.trackingId} userId=${context.userId ?? 'anonymous'} tenantId=${context.tenantId ?? 'none'} path=${context.method} ${context.path}`;
  }
}
