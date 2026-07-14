import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';

import {
  CreateSessionInput,
  CreateUserInput,
  UpdateSessionInput,
  UserProfile,
} from './auth.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  getUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        passwordHash: true,
        createdAt: true,
      },
    });
  }

  createUser(createUserInput: CreateUserInput): Promise<UserProfile> {
    return this.prisma.user.create({
      data: createUserInput,
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
      },
    });
  }

  createSession(
    createSessionInput: CreateSessionInput,
    tx?: Prisma.TransactionClient,
  ) {
    return this.getPrisma(tx).userSession.create({
      data: createSessionInput,
    });
  }

  deleteSessionByUserId(userId: string, tx?: Prisma.TransactionClient) {
    return this.getPrisma(tx).userSession.deleteMany({
      where: {
        userId,
      },
    });
  }

  getSessionById(sessionId: string, tx?: Prisma.TransactionClient) {
    return this.getPrisma(tx).userSession.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });
  }

  deleteSessionById(sessionId: string, tx?: Prisma.TransactionClient) {
    return this.getPrisma(tx).userSession.deleteMany({
      where: {
        id: sessionId,
      },
    });
  }

  updateSession(
    updateSessionInput: UpdateSessionInput,
    tx?: Prisma.TransactionClient,
  ) {
    return this.getPrisma(tx).userSession.update({
      where: {
        id: updateSessionInput.sessionId,
      },
      data: {
        refreshTokenHash: updateSessionInput.refreshTokenHash,
        expiresAt: updateSessionInput.expiresAt,
      },
    });
  }

  private getPrisma(tx?: Prisma.TransactionClient) {
    return tx ?? this.prisma;
  }
}
