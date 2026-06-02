import { randomBytes } from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenPayload, TokenGenerator } from '../../domain/services/token-generator.interface';

@Injectable()
export class JwtTokenGenerator implements TokenGenerator {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signAccessToken(payload: AccessTokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: Number(this.configService.get<string>('JWT_ACCESS_TOKEN_TTL_SECONDS', '900')),
    });
  }

  generateOpaqueToken(): string {
    return randomBytes(48).toString('base64url');
  }
}
