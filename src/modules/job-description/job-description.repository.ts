import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';

import type {
  CreateJobDescriptionInput,
  UpdateJobDescriptionInput,
} from './job-description.dto';

@Injectable()
export class JobDescriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  private db(tx?: Prisma.TransactionClient) {
    return tx ?? this.prisma;
  }

  create(
    createJobDescriptionInput: CreateJobDescriptionInput,
    tx?: Prisma.TransactionClient,
  ) {
    return this.db(tx).jobDescription.create({
      data: createJobDescriptionInput,
    });
  }

  findAllByUserId(userId: string, tx?: Prisma.TransactionClient) {
    return this.db(tx).jobDescription.findMany({
      where: {
        userId,
        deletedAt: null,
      },

      select: {
        id: true,
        title: true,
        company: true,
        rawContent: true,
        jobUrl: true,
        createdAt: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findById(id: string, userId: string, tx?: Prisma.TransactionClient) {
    return this.db(tx).jobDescription.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    });
  }

  softDelete(id: string, userId: string, tx?: Prisma.TransactionClient) {
    return this.db(tx).jobDescription.updateMany({
      where: {
        id,
        userId,
        deletedAt: null,
      },

      data: {
        deletedAt: new Date(),
      },
    });
  }

  findByContentHash(userId: string, contentHash: string) {
    return this.prisma.jobDescription.findFirst({
      where: {
        userId,
        contentHash,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });
  }

  findByJobUrl(userId: string, jobUrl: string) {
    return this.prisma.jobDescription.findFirst({
      where: {
        userId,
        jobUrl,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });
  }

  update(id: string, userId: string, data: UpdateJobDescriptionInput) {
    return this.prisma.jobDescription.updateMany({
      where: {
        id,
        userId,
        deletedAt: null,
      },

      data,
    });
  }
}
