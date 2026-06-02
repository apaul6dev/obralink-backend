import { AuthenticatedUser } from '../entities/authenticated-user.entity';

export interface AuthUserRepository {
  findForLogin(email: string, tenantId?: string | null, companyIdentifier?: string | null): Promise<AuthenticatedUser | null>;
  findById(id: string): Promise<AuthenticatedUser | null>;
  updatePasswordHash(userId: string, passwordHash: string): Promise<void>;
}
