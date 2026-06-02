import { Actor } from '../../domain/entities/actor.entity';

export class ActorPresenter {
  static toHttp(actor: Actor) {
    return actor;
  }
}
