import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContextData {
  trackingId: string;
  method: string;
  path: string;
  userId: string | null;
  tenantId: string | null;
}

@Injectable()
export class RequestContextService {
  private readonly storage = new AsyncLocalStorage<RequestContextData>();

  run<T>(context: RequestContextData, callback: () => T): T {
    return this.storage.run(context, callback);
  }

  get(): RequestContextData | null {
    return this.storage.getStore() ?? null;
  }

  update(partial: Partial<RequestContextData>): void {
    const context = this.storage.getStore();
    if (context) {
      Object.assign(context, partial);
    }
  }
}
