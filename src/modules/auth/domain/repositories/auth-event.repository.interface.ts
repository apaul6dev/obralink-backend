import { AuthEvent } from '../entities/auth-event.entity';

export interface AuthEventRepository {
  save(event: AuthEvent): Promise<void>;
}
