import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';

import type { ConfigType } from '@nestjs/config';
import ms from 'ms';
import { AuthRepository } from './auth.repository';
import {
  JwtPayload,
  LoginDto,
  LoginResponse,
  RegisterDto,
  TokenPair,
  UserForLogin,
} from './auth.dto';
import { compare, hash, normalizeEmail } from '@/shared/utils/index.util';
import { JwtTokenService } from './jwt-token.service';
import { jwtConfig as jwtConfiguration } from '@/shared/config';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtTokenService: JwtTokenService,
    private readonly prismaService: PrismaService,
    @Inject(jwtConfiguration.KEY)
    private readonly jwtConfig: ConfigType<typeof jwtConfiguration>,
  ) {}

  async register(registerDto: RegisterDto) {
    const email = registerDto.email.trim().toLowerCase();

    const existingUser = await this.authRepository.getUserByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email already exists.');
    }

    const passwordHash = await hash(
      registerDto.password,
      this.jwtConfig.saltRounds,
    );

    return this.authRepository.createUser({
      fullName: registerDto.fullName.trim(),
      email,
      passwordHash,
    });
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const email = normalizeEmail(loginDto.email);

    const user = await this.validateCredentials(email, loginDto.password);
    const response = await this.prismaService.$transaction(async (tx) => {
      await this.authRepository.deleteSessionByUserId(user.id, tx);

      const session = await this.authRepository.createSession(
        {
          userId: user.id,
        },
        tx,
      );

      const payload: JwtPayload = {
        userId: user.id,
        sessionId: session.id,
      };

      const { accessToken, refreshToken } = await this.generateTokens(payload);
      const hashedRefreshToken = await hash(
        refreshToken,
        this.jwtConfig.saltRounds,
      );

      await this.authRepository.updateSession(
        {
          sessionId: session.id,
          refreshTokenHash: hashedRefreshToken,
          expiresAt: new Date(Date.now() + ms(this.jwtConfig.refreshExpiresIn)),
        },
        tx,
      );

      return this.buildLoginResponse(user, {
        accessToken,
        refreshToken,
      });
    });

    return response;
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing.');
    }
    const session = await this.validateRefreshSession(refreshToken);

    const payload: JwtPayload = {
      userId: session.userId,
      sessionId: session.id,
    };

    const accessToken = await this.jwtTokenService.generateAccessToken(payload);

    return {
      user: session.user,
      accessToken,
    };
  }
  private async validateCredentials(
    email: string,
    password: string,
  ): Promise<UserForLogin> {
    const user = await this.authRepository.getUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isPasswordValid = await compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return user;
  }

  private async generateTokens(payload: JwtPayload): Promise<TokenPair> {
    const accessToken = await this.jwtTokenService.generateAccessToken(payload);

    const refreshToken =
      await this.jwtTokenService.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
    };
  }

  private buildLoginResponse(
    user: UserForLogin,
    tokens: TokenPair,
  ): LoginResponse {
    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        createdAt: new Date(),
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  private async validateRefreshSession(refreshToken: string) {
    const [type, token] = refreshToken.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid refresh token header.');
    }
    const payload = await this.jwtTokenService.verifyRefreshToken(token);

    const session = await this.authRepository.getSessionById(payload.sessionId);

    if (!session) {
      throw new UnauthorizedException('Session not found.');
    }

    if (session.expiresAt && session.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token has expired.');
    }

    const isValid = await compare(token, session.refreshTokenHash || '');

    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    return session;
  }
}
