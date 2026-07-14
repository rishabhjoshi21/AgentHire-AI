import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { jwtConfig as jwtConfiguration } from '@/shared/config';

import { JwtPayload } from './auth.dto';

@Injectable()
export class JwtTokenService {
  constructor(
    private readonly jwtService: JwtService,

    @Inject(jwtConfiguration.KEY)
    private readonly jwtConfig: ConfigType<typeof jwtConfiguration>,
  ) {}

  async generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.signToken(
      payload,
      this.jwtConfig.accessSecret,
      this.jwtConfig.accessExpiresIn,
    );
  }

  async generateRefreshToken(payload: JwtPayload): Promise<string> {
    return this.signToken(
      payload,
      this.jwtConfig.refreshSecret,
      this.jwtConfig.refreshExpiresIn,
    );
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: this.jwtConfig.accessSecret,
    });
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: this.jwtConfig.refreshSecret,
    });
  }

  decode(token: string): JwtPayload | null {
    const payload: unknown = this.jwtService.decode(token);

    if (!payload || typeof payload === 'string') {
      return null;
    }

    return payload as JwtPayload;
  }

  private async signToken(
    payload: JwtPayload,
    secret: string,
    expiresIn: StringValue,
  ): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    });
  }
}
