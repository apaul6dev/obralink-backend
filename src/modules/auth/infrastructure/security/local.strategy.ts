import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor() {
    super({ usernameField: 'email', passwordField: 'password', passReqToCallback: false });
  }

  validate(email: string, password: string): { email: string; password: string } {
    return { email, password };
  }
}
