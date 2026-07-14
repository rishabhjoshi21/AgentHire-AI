import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

import { AuthRepository } from '@/modules/auth/auth.repository';
import { JwtTokenService } from '@/modules/auth/jwt-token.service';
import { AuthenticatedRequest } from '../types/request.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtTokenService: JwtTokenService,
    private readonly authRepository: AuthRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context);

    const accessToken = this.extractAccessToken(request);

    try {
      const payload = await this.jwtTokenService.verifyAccessToken(accessToken);

      await this.validateSession(payload.sessionId);
      request.user = payload;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token.');
    }
  }

  private getRequest(context: ExecutionContext): AuthenticatedRequest {
    return context.switchToHttp().getRequest<AuthenticatedRequest>();
  }

  private extractAccessToken(request: Request): string {
    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException('Authorization header is missing.');
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header.');
    }

    return token;
  }

  private async validateSession(sessionId: string): Promise<void> {
    const session = await this.authRepository.getSessionById(sessionId);

    if (!session) {
      throw new UnauthorizedException('Session has expired.');
    }

    if (session.expiresAt && session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session has expired.');
    }
  }
}
