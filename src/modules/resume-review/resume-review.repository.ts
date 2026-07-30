import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';

import {
  CreateResumeReviewInput,
  ResumeReviewEntity,
} from './resume-review.dto';

@Injectable()
export class ResumeReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    input: CreateResumeReviewInput,
    tx?: Prisma.TransactionClient,
  ): Promise<ResumeReviewEntity> {
    return this.getPrisma(tx).resumeReview.create({
      data: {
        analysisId: input.analysisId,
        reviewResult: input.reviewResult,
        aiModel: input.aiModel,
      },
    });
  }

  findById(
    id: string,
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<ResumeReviewEntity | null> {
    return this.getPrisma(tx).resumeReview.findUnique({
      where: {
        id,
        analysis: {
          resume: {
            userId,
          },
        },
      },
    });
  }

  findByAnalysisId(
    analysisId: string,
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<ResumeReviewEntity | null> {
    return this.getPrisma(tx).resumeReview.findUnique({
      where: {
        analysisId,
        analysis: {
          resume: {
            userId,
          },
        },
      },
    });
  }

  private getPrisma(tx?: Prisma.TransactionClient) {
    return tx ?? this.prisma;
  }
}
