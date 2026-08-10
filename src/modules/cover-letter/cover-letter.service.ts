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
  CoverLetterEntity,
  CoverLetterResponseDto,
  CreateCoverLetterDto,
  GenerateCoverLetterRequest,
  GenerateCoverLetterResponse,
  GenerateCoverLetterResponseDto,
} from './cover-letter.dto';
import { CoverLetterRepository } from './cover-letter.repository';
import { buildCoverLetterPrompt } from './prompts/cover-letter.prompt';
import { COVER_LETTER_SYSTEM_PROMPT } from './prompts/cover-letter.system-prompt';

interface CoverLetterContext {
  resumeContent: string;
  jobDescription: string;
  analysis: AnalyzeResumeResponse;
}

@Injectable()
export class CoverLetterService {
  private readonly logger = new Logger(CoverLetterService.name);

  constructor(
    private readonly analysisRepository: AnalysisRepository,
    private readonly coverLetterRepository: CoverLetterRepository,
    private readonly llmService: LLMService,
  ) {}

  async create(
    userId: string,
    dto: CreateCoverLetterDto,
  ): Promise<CoverLetterResponseDto> {
    const context = await this.buildContext(userId, dto.analysisId);

    const existing = await this.coverLetterRepository.findByAnalysisId(
      dto.analysisId,
      userId,
    );

    if (existing) {
      throw new ConflictException(
        'Cover letter already exists for this analysis.',
      );
    }

    const request: GenerateCoverLetterRequest = {
      resumeContent: context.resumeContent,
      jobDescription: context.jobDescription,
      analysis: context.analysis,
    };

    try {
      const response = await this.llmService.chat<GenerateCoverLetterResponse>({
        systemPrompt: COVER_LETTER_SYSTEM_PROMPT,
        userPrompt: buildCoverLetterPrompt(request),
      });

      const validatedResponse = await this.validateCoverLetterResult(response);

      const coverLetter = await this.coverLetterRepository.create({
        analysisId: dto.analysisId,
        content: validatedResponse.content,
        aiModel: this.llmService.getModel(),
      });

      return this.toResponseDto(coverLetter);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Cover letter already exists for this analysis.',
        );
      }

      this.logger.error(
        `Failed to generate cover letter for analysis ${dto.analysisId}.`,
        error instanceof Error ? error.stack : undefined,
      );

      throw new InternalServerErrorException(
        'Failed to generate cover letter.',
      );
    }
  }

  async findById(id: string, userId: string): Promise<CoverLetterResponseDto> {
    const coverLetter = await this.coverLetterRepository.findById(id, userId);

    if (!coverLetter) {
      throw new NotFoundException('Cover letter not found.');
    }

    return this.toResponseDto(coverLetter);
  }

  async findByAnalysisId(
    analysisId: string,
    userId: string,
  ): Promise<CoverLetterResponseDto> {
    const coverLetter = await this.coverLetterRepository.findByAnalysisId(
      analysisId,
      userId,
    );

    if (!coverLetter) {
      throw new NotFoundException('Cover letter not found.');
    }

    return this.toResponseDto(coverLetter);
  }

  private async buildContext(
    userId: string,
    analysisId: string,
  ): Promise<CoverLetterContext> {
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
    };
  }

  private async validateCoverLetterResult(
    response: GenerateCoverLetterResponse,
  ): Promise<GenerateCoverLetterResponse> {
    const dto = plainToInstance(GenerateCoverLetterResponseDto, response);

    const errors = await validate(dto);

    if (errors.length > 0) {
      this.logger.error(`Invalid AI response: ${JSON.stringify(errors)}`);

      throw new Error('Invalid AI response.');
    }

    return response;
  }

  private toResponseDto(entity: CoverLetterEntity): CoverLetterResponseDto {
    return {
      id: entity.id,
      analysisId: entity.analysisId,
      content: entity.content,
      aiModel: entity.aiModel,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
