import { User } from '../../domain/entities/user.entity';

export class UserPresenter {
  static toHttp(user: User) {
    return user;
  }
}
