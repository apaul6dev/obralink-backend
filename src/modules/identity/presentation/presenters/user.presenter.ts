import { User } from '../../domain/entities/user.entity';

export class UserPresenter {
  static toHttp(user: User) {
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
