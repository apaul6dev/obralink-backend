import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AppLogger } from '../logger/app-logger.service';
import { TRACKING_ID_HEADER } from '../tracing/tracing.constants';
import { AppException } from './app-exception';

interface HttpRequestLike {
  method: string;
  originalUrl?: string;
  url?: string;
  trackingId?: string;
}

interface HttpResponseLike {
  setHeader(name: string, value: string): void;
  status(statusCode: number): { json(body: unknown): void };
}

interface NormalizedException {
  statusCode: number;
  code: string;
  message: string | string[];
  details?: unknown;
}

@Injectable()
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<HttpRequestLike>();
    const response = http.getResponse<HttpResponseLike>();
    const normalized = this.normalize(exception);
    const path = request.originalUrl ?? request.url ?? '';
    const trackingId = request.trackingId ?? 'unknown';

    if (request.trackingId) {
      response.setHeader(TRACKING_ID_HEADER, request.trackingId);
    }

    const logMessage = `Exception handled method=${request.method} path=${path} status=${normalized.statusCode} code=${normalized.code} message=${Array.isArray(normalized.message) ? normalized.message.join('; ') : normalized.message}`;
    if (normalized.statusCode >= 500) {
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(logMessage, stack, AllExceptionsFilter.name);
    } else {
      this.logger.warn(logMessage, AllExceptionsFilter.name);
    }

    response.status(normalized.statusCode).json({
      statusCode: normalized.statusCode,
      code: normalized.code,
      message: normalized.message,
      details: normalized.details,
      trackingId,
      path,
      timestamp: new Date().toISOString(),
    });
  }

  private normalize(exception: unknown): NormalizedException {
    if (exception instanceof AppException) {
      const body = exception.getResponse() as { details?: unknown };
      return {
        statusCode: exception.getStatus(),
        code: exception.code,
        message: exception.message,
        details: exception.details ?? body.details,
      };
    }

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && response !== null) {
        const body = response as { error?: string; message?: string | string[]; code?: string; details?: unknown };
        return {
          statusCode: exception.getStatus(),
          code: body.code ?? this.codeFromHttpStatus(exception.getStatus(), body.error),
          message: body.message ?? exception.message,
          details: body.details,
        };
      }

      return {
        statusCode: exception.getStatus(),
        code: this.codeFromHttpStatus(exception.getStatus()),
        message: response,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error.',
    };
  }

  private codeFromHttpStatus(statusCode: number, fallback?: string): string {
    if (fallback) {
      return fallback.toUpperCase().replace(/\s+/g, '_');
    }
    return HttpStatus[statusCode] ?? 'HTTP_ERROR';
  }
}
