import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  fullName!: string;

  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character.',
  })
  password!: string;
}

export class LoginDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

// ======================================================
// Internal Interfaces
// ======================================================

export interface CreateUserInput {
  fullName: string;
  email: string;
  passwordHash: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  createdAt: Date;
}

export interface UserForLogin {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
}

export interface CreateSessionInput {
  userId: string;
}

export interface UpdateSessionInput {
  sessionId: string;
  refreshTokenHash: string;
  expiresAt: Date;
}

export interface DeviceInfo {
  ipAddress?: string;
  userAgent?: string;
}

export interface JwtPayload {
  userId: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: UserProfile | null;
  accessToken: string;
  refreshToken?: string;
}
