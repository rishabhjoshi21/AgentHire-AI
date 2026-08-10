import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';

import { CoverLetterEntity, CreateCoverLetterInput } from './cover-letter.dto';

@Injectable()
export class CoverLetterRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    input: CreateCoverLetterInput,
    tx?: Prisma.TransactionClient,
  ): Promise<CoverLetterEntity> {
    return this.getPrisma(tx).coverLetter.create({
      data: {
        analysisId: input.analysisId,
        content: input.content,
        aiModel: input.aiModel,
      },
    });
  }

  findById(
    id: string,
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<CoverLetterEntity | null> {
    return this.getPrisma(tx).coverLetter.findFirst({
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
  ): Promise<CoverLetterEntity | null> {
    return this.getPrisma(tx).coverLetter.findFirst({
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
