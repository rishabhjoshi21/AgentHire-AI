import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class RegisterDto {
  @ApiProperty({
    example: 'Rishabh Joshi',
    description: 'Full name of the user',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  fullName!: string;

  @ApiProperty({
    example: 'rishabh@example.com',
    description: 'Registered email address',
  })
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiProperty({
    example: 'Password@123',
    description:
      'Password must contain uppercase, lowercase, number and special character.',
    minLength: 8,
    maxLength: 32,
  })
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
  @ApiProperty({
    example: 'rishabh@example.com',
    description: 'Registered email address',
  })
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiProperty({
    example: 'Password@123',
    description: 'User password',
  })
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

// ======================================================
// Response DTOs
// ======================================================

export class UserProfileResponseDto {
  @ApiProperty({
    example: 'b58d4f42-0f74-4df8-99d3-0b7db8cf65c8',
    description: 'Unique identifier of the user',
  })
  id!: string;

  @ApiProperty({
    example: 'Rishabh Joshi',
    description: 'Full name of the user',
  })
  fullName!: string;

  @ApiProperty({
    example: 'rishabh@example.com',
    description: 'Registered email address',
  })
  email!: string;

  @ApiProperty({
    example: '2026-07-21T15:30:00.000Z',
    description: 'User registration date',
  })
  createdAt!: Date;
}

export class LoginResponseDto {
  @ApiProperty({
    type: UserProfileResponseDto,
    nullable: true,
    description: 'Authenticated user profile',
  })
  user!: UserProfileResponseDto | null;

  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken!: string;
}
