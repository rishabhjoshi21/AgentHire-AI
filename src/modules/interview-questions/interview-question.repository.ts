import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import {
  CreateInterviewQuestionInput,
  InterviewQuestionEntity,
} from './interview-question.dto';

@Injectable()
export class InterviewQuestionRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    input: CreateInterviewQuestionInput,
    tx?: Prisma.TransactionClient,
  ): Promise<InterviewQuestionEntity> {
    return this.getPrisma(tx).interviewQuestion.create({
      data: {
        analysisId: input.analysisId,
        result: input.result as Prisma.JsonObject,
        aiModel: input.aiModel,
      },
    });
  }

  findById(
    id: string,
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<InterviewQuestionEntity | null> {
    return this.getPrisma(tx).interviewQuestion.findFirst({
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
  ): Promise<InterviewQuestionEntity | null> {
    return this.getPrisma(tx).interviewQuestion.findFirst({
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
