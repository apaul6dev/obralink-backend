import { BadRequestException, CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { isUUID } from 'class-validator';
import { Observable, tap } from 'rxjs';
import { RequestContextService } from '../context/request-context.service';
import { TRACKING_ID_HEADER } from './tracing.constants';

interface TraceableRequest {
  method: string;
  originalUrl?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  user?: {
    id?: string;
    tenantId?: string | null;
  };
  trackingId?: string;
}

interface TraceableResponse {
  statusCode: number;
  setHeader(name: string, value: string): void;
}

@Injectable()
export class RequestTracingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestTracingInterceptor.name);

  constructor(private readonly requestContext: RequestContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<TraceableRequest>();
    const response = httpContext.getResponse<TraceableResponse>();
    const startedAt = Date.now();

    const requestedTrackingId = this.firstHeaderValue(request.headers[TRACKING_ID_HEADER]);
    const trackingId = requestedTrackingId && isUUID(requestedTrackingId) ? requestedTrackingId : randomUUID();
    const tenantId = request.user?.tenantId ?? null;
    const path = request.originalUrl ?? request.url ?? '';

    request.trackingId = trackingId;
    response.setHeader(TRACKING_ID_HEADER, trackingId);

    return this.requestContext.run(
      {
        trackingId,
        method: request.method,
        path,
        userId: request.user?.id ?? null,
        tenantId,
      },
      () => {
        if (requestedTrackingId && !isUUID(requestedTrackingId)) {
          throw new BadRequestException(`${TRACKING_ID_HEADER} must be a UUID`);
        }

        this.logger.debug(`Request started method=${request.method} path=${path}`);

        return next.handle().pipe(
          tap({
            next: () => this.logRequest(response, startedAt),
            error: () => this.logRequest(response, startedAt, true),
          }),
        );
      },
    );
  }

  private firstHeaderValue(value: string | string[] | undefined): string | null {
    if (Array.isArray(value)) {
      return value[0]?.trim() || null;
    }
    return value?.trim() || null;
  }

  private logRequest(response: TraceableResponse, startedAt: number, failed = false): void {
    const durationMs = Date.now() - startedAt;
    const message = `Request finished status=${response.statusCode} durationMs=${durationMs}`;

    if (failed || response.statusCode >= 500) {
      this.logger.error(message);
      return;
    }

    if (response.statusCode >= 400) {
      this.logger.warn(message);
      return;
    }

    this.logger.log(message);
  }
}
