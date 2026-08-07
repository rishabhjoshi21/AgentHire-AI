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
  CreateInterviewQuestionDto,
  GenerateInterviewQuestionRequest,
  GenerateInterviewQuestionResponse,
  InterviewQuestionEntity,
  InterviewQuestionResponseDto,
  InterviewQuestionResultDto,
} from './interview-question.dto';

import { InterviewQuestionRepository } from './interview-question.repository';

import { buildInterviewQuestionPrompt } from './prompts/interview-question.prompt';

import { INTERVIEW_QUESTION_SYSTEM_PROMPT } from './prompts/interview-question.system-prompt';

interface InterviewQuestionContext {
  resumeContent: string;
  jobDescription: string;
  analysis: AnalyzeResumeResponse;
}

@Injectable()
export class InterviewQuestionService {
  private readonly logger = new Logger(InterviewQuestionService.name);

  constructor(
    private readonly analysisRepository: AnalysisRepository,
    private readonly interviewQuestionRepository: InterviewQuestionRepository,
    private readonly llmService: LLMService,
  ) {}

  async create(
    userId: string,
    dto: CreateInterviewQuestionDto,
  ): Promise<InterviewQuestionResponseDto> {
    const context = await this.buildContext(userId, dto.analysisId);

    const request: GenerateInterviewQuestionRequest = {
      resumeContent: context.resumeContent,
      jobDescription: context.jobDescription,
      analysis: context.analysis,
    };

    const check = await this.interviewQuestionRepository.findByAnalysisId(
      dto.analysisId,
      userId,
    );
    if (check) {
      throw new ConflictException(
        'Interview questions already exist for this analysis.',
      );
    }
    try {
      const response =
        await this.llmService.chat<GenerateInterviewQuestionResponse>({
          systemPrompt: INTERVIEW_QUESTION_SYSTEM_PROMPT,
          userPrompt: buildInterviewQuestionPrompt(request),
        });

      const validatedResponse =
        await this.validateInterviewQuestionResult(response);

      const interviewQuestion = await this.interviewQuestionRepository.create({
        analysisId: dto.analysisId,
        result: JSON.parse(
          JSON.stringify(validatedResponse),
        ) as Prisma.InputJsonValue,
        aiModel: this.llmService.getModel(),
      });

      return this.toResponseDto(interviewQuestion);
    } catch (error: unknown) {
      this.logger.error(
        `Failed to generate interview questions for analysis ${dto.analysisId}.`,
        error instanceof Error ? error.stack : undefined,
      );

      throw new InternalServerErrorException(
        'Failed to generate interview questions.',
      );
    }
  }

  async findById(
    id: string,
    userId: string,
  ): Promise<InterviewQuestionResponseDto> {
    const interviewQuestion = await this.interviewQuestionRepository.findById(
      id,
      userId,
    );

    if (!interviewQuestion) {
      throw new NotFoundException('Interview questions not found.');
    }

    return this.toResponseDto(interviewQuestion);
  }

  async findByAnalysisId(
    analysisId: string,
    userId: string,
  ): Promise<InterviewQuestionResponseDto> {
    const interviewQuestion =
      await this.interviewQuestionRepository.findByAnalysisId(
        analysisId,
        userId,
      );

    if (!interviewQuestion) {
      throw new NotFoundException('Interview questions not found.');
    }

    return this.toResponseDto(interviewQuestion);
  }

  private async buildContext(
    userId: string,
    analysisId: string,
  ): Promise<InterviewQuestionContext> {
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
  private async validateInterviewQuestionResult(
    response: GenerateInterviewQuestionResponse,
  ): Promise<GenerateInterviewQuestionResponse> {
    const dto = plainToInstance(InterviewQuestionResultDto, response);

    const errors = await validate(dto);

    if (errors.length > 0) {
      this.logger.error(`Invalid AI response: ${JSON.stringify(errors)}`);

      throw new Error('Invalid AI response.');
    }

    return response;
  }

  private toResponseDto(
    entity: InterviewQuestionEntity,
  ): InterviewQuestionResponseDto {
    return {
      id: entity.id,
      analysisId: entity.analysisId,
      result: entity.result as unknown as InterviewQuestionResultDto,
      aiModel: entity.aiModel,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
