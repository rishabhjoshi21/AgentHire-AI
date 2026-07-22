import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { LLMService } from '@/infrastructure/llm/llm.service';
import { JobDescriptionRepository } from '@/modules/job-description/job-description.repository';
import { ResumeRepository } from '@/modules/resumes/resume.repository';

import {
  AnalyzeResumeRequest,
  AnalyzeResumeResponse,
  AnalyzeResumeResultDto,
  CreateAnalysisDto,
} from './analysis.dto';
import { AnalysisRepository } from './analysis.repository';
import {
  ANALYSIS_SYSTEM_PROMPT,
  buildAnalysisPrompt,
} from './prompts/analysis.prompt';
import { Prisma } from '@prisma/client';
import {
  buildPaginatedResponse,
  PaginationQueryDto,
} from '@/shared/utils/pagination.util';

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);

  constructor(
    private readonly analysisRepository: AnalysisRepository,
    private readonly resumeRepository: ResumeRepository,
    private readonly jobDescriptionRepository: JobDescriptionRepository,
    private readonly llmService: LLMService,
  ) {}

  async create(userId: string, dto: CreateAnalysisDto) {
    const resume = await this.getResume(dto.resumeId, userId);

    const jobDescription = await this.getJobDescription(
      dto.jobDescriptionId,
      userId,
    );

    await this.ensureAnalysisDoesNotExist(resume.id, jobDescription.id);

    const analysis = await this.createPendingAnalysis(
      resume.id,
      jobDescription.id,
    );
    if (!resume.rawContent) {
      throw new BadRequestException('Resume content is not available.');
    }

    if (!jobDescription.rawContent) {
      throw new BadRequestException(
        'Job description content is not available.',
      );
    }
    const request: AnalyzeResumeRequest = {
      resumeContent: resume.rawContent ?? '',
      jobDescriptionContent: jobDescription.rawContent ?? '',
    };

    await this.processAnalysis(analysis.id, request);

    const completedAnalysis = await this.analysisRepository.findById(
      analysis.id,
      userId,
    );

    if (!completedAnalysis) {
      throw new NotFoundException('Analysis not found.');
    }

    return completedAnalysis;
  }

  async findAll(userId: string, query: PaginationQueryDto) {
    const { items, total } = await this.analysisRepository.findAllByUser(
      userId,
      query.page,
      query.limit,
    );

    return buildPaginatedResponse(items, query.page, query.limit, total);
  }

  async findById(id: string, userId: string) {
    const analysis = await this.analysisRepository.findById(id, userId);

    if (!analysis) {
      throw new NotFoundException('Analysis not found.');
    }

    return analysis;
  }

  private async processAnalysis(
    analysisId: string,
    request: AnalyzeResumeRequest,
  ): Promise<void> {
    await this.analysisRepository.markProcessing(analysisId);

    try {
      const response = await this.llmService.chat<AnalyzeResumeResponse>({
        systemPrompt: ANALYSIS_SYSTEM_PROMPT,
        userPrompt: buildAnalysisPrompt(request),
      });

      const validatedResponse = await this.validateAnalysisResult(response);

      await this.analysisRepository.markCompleted(analysisId, {
        atsScore: validatedResponse.atsScore,
        resumeMatchScore: validatedResponse.resumeMatchScore,
        analysisResult: validatedResponse as unknown as Prisma.InputJsonValue,
        aiModel: this.llmService.getModel(),
      });
    } catch (error) {
      await this.analysisRepository.markFailed(analysisId);

      this.logger.error(
        `Analysis ${analysisId} failed.`,
        error instanceof Error ? error.stack : undefined,
      );

      throw new InternalServerErrorException('Failed to analyze resume.');
    }
  }
  private async getResume(resumeId: string, userId: string) {
    const resume = await this.resumeRepository.getResumeById(resumeId, userId);

    if (!resume) {
      throw new NotFoundException('Resume not found.');
    }

    return resume;
  }

  private async getJobDescription(jobDescriptionId: string, userId: string) {
    const jobDescription = await this.jobDescriptionRepository.findById(
      jobDescriptionId,
      userId,
    );

    if (!jobDescription) {
      throw new NotFoundException('Job description not found.');
    }

    return jobDescription;
  }

  private async ensureAnalysisDoesNotExist(
    resumeId: string,
    jobDescriptionId: string,
  ) {
    const existing =
      await this.analysisRepository.findByResumeAndJobDescription(
        resumeId,
        jobDescriptionId,
      );

    if (existing) {
      throw new ConflictException(
        'Analysis already exists for this resume and job description.',
      );
    }
  }

  private async createPendingAnalysis(
    resumeId: string,
    jobDescriptionId: string,
  ) {
    return this.analysisRepository.create({
      resume: {
        connect: {
          id: resumeId,
        },
      },
      jobDescription: {
        connect: {
          id: jobDescriptionId,
        },
      },
    });
  }

  private async validateAnalysisResult(
    response: AnalyzeResumeResponse,
  ): Promise<AnalyzeResumeResponse> {
    const dto = plainToInstance(AnalyzeResumeResultDto, response);

    const errors = await validate(dto);

    if (errors.length > 0) {
      throw new Error('Invalid AI response.');
    }

    return response;
  }
}
