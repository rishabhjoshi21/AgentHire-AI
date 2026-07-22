import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';

import type { CreateResumeInput } from './resume.dto';

@Injectable()
export class ResumeRepository {
  constructor(private readonly prisma: PrismaService) {}

  private db(tx?: Prisma.TransactionClient) {
    return tx ?? this.prisma;
  }

  createResume(
    createResumeInput: CreateResumeInput,
    tx?: Prisma.TransactionClient,
  ) {
    return this.db(tx).resume.create({
      data: createResumeInput,
      select: {
        id: true,
        title: true,
        originalFileName: true,
        mimeType: true,
        fileSize: true,
        createdAt: true,
      },
    });
  }

  getResumeById(
    resumeId: string,
    userId: string,
    tx?: Prisma.TransactionClient,
  ) {
    return this.db(tx).resume.findFirst({
      where: {
        id: resumeId,
        userId,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        rawContent: true,
        optimizedContent: true,
        originalFileName: true,
        mimeType: true,
        fileSize: true,
        createdAt: true,
      },
    });
  }

  getUserResumes(userId: string, tx?: Prisma.TransactionClient) {
    return this.db(tx).resume.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        originalFileName: true,
        mimeType: true,
        fileSize: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  softDeleteResume(
    resumeId: string,
    userId: string,
    tx?: Prisma.TransactionClient,
  ) {
    return this.db(tx).resume.updateMany({
      where: {
        id: resumeId,
        userId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  getResumeByHash(userId: string, fileHash: string) {
    return this.prisma.resume.findFirst({
      where: {
        userId,
        fileHash,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        originalFileName: true,
        mimeType: true,
        fileSize: true,
        createdAt: true,
      },
    });
  }
}
