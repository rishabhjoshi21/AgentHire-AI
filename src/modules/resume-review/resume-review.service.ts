import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { LLMService } from '@/infrastructure/llm/llm.service';

import { AnalyzeResumeResponse } from '../analysis/analysis.dto';
import { AnalysisRepository } from '../analysis/analysis.repository';

import {
  CreateResumeReviewDto,
  GenerateResumeReviewRequest,
  GenerateResumeReviewResponse,
  ResumeReviewEntity,
  ResumeReviewResponseDto,
  ResumeReviewResultDto,
} from './resume-review.dto';

import { ResumeReviewRepository } from './resume-review.repository';

import { buildResumeReviewPrompt } from './prompts/resume-review.prompt';
import { RESUME_REVIEW_SYSTEM_PROMPT } from './prompts/resume-review.system-prompt';

interface ResumeReviewContext {
  resumeContent: string;
  jobDescription: string;
  analysis: AnalyzeResumeResponse;
  analysisId: string;
}

@Injectable()
export class ResumeReviewService {
  private readonly logger = new Logger(ResumeReviewService.name);

  constructor(
    private readonly analysisRepository: AnalysisRepository,
    private readonly resumeReviewRepository: ResumeReviewRepository,
    private readonly llmService: LLMService,
  ) {}

  async create(
    userId: string,
    dto: CreateResumeReviewDto,
  ): Promise<ResumeReviewResponseDto> {
    const context = await this.buildContext(userId, dto.analysisId);

    const request: GenerateResumeReviewRequest = {
      resumeContent: context.resumeContent,
      jobDescription: context.jobDescription,
      analysis: context.analysis,
    };
    const check = await this.resumeReviewRepository.findByAnalysisId(
      context.analysisId,
      userId,
    );
    if (check) {
      throw new ConflictException(
        'Resume review already exists for this analysis.',
      );
    }
    try {
      const response: GenerateResumeReviewResponse = await this.llmService.chat(
        {
          systemPrompt: RESUME_REVIEW_SYSTEM_PROMPT,
          userPrompt: buildResumeReviewPrompt(request),
        },
      );

      const validatedResponse = await this.validateResumeReviewResult(response);

      const review = await this.resumeReviewRepository.create({
        analysisId: dto.analysisId,
        reviewResult: JSON.parse(
          JSON.stringify(validatedResponse),
        ) as Prisma.InputJsonValue,
        aiModel: this.llmService.getModel(),
      });

      return this.toResponseDto(review);
    } catch (error: unknown) {
      this.logger.error(
        `Failed to generate resume review for analysis ${dto.analysisId}.`,
        error instanceof Error ? error.stack : undefined,
      );

      throw new InternalServerErrorException(
        'Failed to generate resume review.',
      );
    }
  }

  async findById(id: string, userId: string): Promise<ResumeReviewResponseDto> {
    const review = await this.resumeReviewRepository.findById(id, userId);

    if (!review) {
      throw new NotFoundException('Resume review not found.');
    }

    return this.toResponseDto(review);
  }

  async findByAnalysisId(
    analysisId: string,
    userId: string,
  ): Promise<ResumeReviewResponseDto> {
    const review = await this.resumeReviewRepository.findByAnalysisId(
      analysisId,
      userId,
    );

    if (!review) {
      throw new NotFoundException('Resume review not found.');
    }

    return this.toResponseDto(review);
  }

  private async buildContext(
    userId: string,
    analysisId: string,
  ): Promise<ResumeReviewContext> {
    const analysis = await this.analysisRepository.findCompletedAnalysis(
      analysisId,
      userId,
    );

    if (!analysis) {
      throw new NotFoundException('Completed analysis not found.');
    }

    if (!analysis.resume.rawContent) {
      throw new BadRequestException('Resume content is not available.');
    }

    if (!analysis.jobDescription.rawContent) {
      throw new BadRequestException(
        'Job description content is not available.',
      );
    }

    if (!analysis.analysisResult) {
      throw new BadRequestException('Analysis result is not available.');
    }

    return {
      resumeContent: analysis.resume.rawContent,
      jobDescription: analysis.jobDescription.rawContent,
      analysis: analysis.analysisResult as unknown as AnalyzeResumeResponse,
      analysisId: analysis.id,
    };
  }
  private async validateResumeReviewResult(
    response: GenerateResumeReviewResponse,
  ): Promise<GenerateResumeReviewResponse> {
    const dto = plainToInstance(ResumeReviewResultDto, response);

    const errors = await validate(dto);

    if (errors.length > 0) {
      this.logger.error(`Invalid AI response: ${JSON.stringify(errors)}`);

      throw new Error('Invalid AI response.');
    }

    return response;
  }

  private toResponseDto(entity: ResumeReviewEntity): ResumeReviewResponseDto {
    return {
      id: entity.id,
      analysisId: entity.analysisId,
      reviewResult: entity.reviewResult as unknown as ResumeReviewResultDto,
      aiModel: entity.aiModel,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
