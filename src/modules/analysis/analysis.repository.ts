import { Injectable } from '@nestjs/common';
import { AnalysisStatus, Prisma } from '@prisma/client';

import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';

import { CompleteAnalysisInput, CreateAnalysisInput } from './analysis.dto';

const analysisSelect = Prisma.validator<Prisma.AnalysisSelect>()({
  id: true,
  resumeId: true,
  jobDescriptionId: true,
  status: true,
  aiModel: true,
  analysisResult: true,
  createdAt: true,
  updatedAt: true,
});

@Injectable()
export class AnalysisRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateAnalysisInput) {
    return this.prisma.analysis.create({
      data,
    });
  }

  findById(id: string, userId: string) {
    return this.prisma.analysis.findFirst({
      where: {
        id,
        resume: {
          userId,
        },
      },
      select: analysisSelect,
    });
  }

  findByResumeAndJobDescription(resumeId: string, jobDescriptionId: string) {
    return this.prisma.analysis.findUnique({
      where: {
        resumeId_jobDescriptionId: {
          resumeId,
          jobDescriptionId,
        },
      },
    });
  }

  markProcessing(id: string) {
    return this.prisma.analysis.update({
      where: {
        id,
      },
      data: {
        status: AnalysisStatus.PROCESSING,
      },
    });
  }

  markCompleted(id: string, data: CompleteAnalysisInput) {
    return this.prisma.analysis.update({
      where: {
        id,
      },
      data: {
        ...data,
        status: AnalysisStatus.COMPLETED,
      },
    });
  }

  markFailed(id: string) {
    return this.prisma.analysis.update({
      where: {
        id,
      },
      data: {
        status: AnalysisStatus.FAILED,
      },
    });
  }

  async findAllByUser(userId: string, page: number, limit: number) {
    const where = {
      resume: {
        userId,
      },
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.analysis.findMany({
        where,
        include: {
          resume: {
            select: {
              id: true,
              title: true,
            },
          },
          jobDescription: {
            select: {
              id: true,
              title: true,
              company: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.analysis.count({
        where,
      }),
    ]);

    return {
      items,
      total,
    };
  }
}
