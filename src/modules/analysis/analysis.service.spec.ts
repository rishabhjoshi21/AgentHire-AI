import { Test, TestingModule } from '@nestjs/testing';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AnalysisStatus } from '@prisma/client';

import { LLMService } from '@/infrastructure/llm/llm.service';
import { JobDescriptionRepository } from '@/modules/job-description/job-description.repository';
import { ResumeRepository } from '@/modules/resumes/resume.repository';

import { AnalysisService } from './analysis.service';
import { AnalysisRepository } from './analysis.repository';

describe('AnalysisService', () => {
  let service: AnalysisService;

  let analysisRepository: {
    findById: jest.Mock;
    findAllByUser: jest.Mock;
    findForRetry: jest.Mock;
    findByResumeAndJobDescription: jest.Mock;
    create: jest.Mock;
    markProcessing: jest.Mock;
    markCompleted: jest.Mock;
    markFailed: jest.Mock;
    resetForRetry: jest.Mock;
  };

  let resumeRepository: {
    getResumeById: jest.Mock;
  };

  let jobDescriptionRepository: {
    findById: jest.Mock;
  };

  let llmService: {
    chat: jest.Mock;
    getModel: jest.Mock;
  };

  const validAiResponse = {
    atsScore: 85,
    resumeMatchScore: 80,
    summary: 'The resume is a good match for the job description.',
    matchedSkills: ['Node.js', 'TypeScript'],
    missingSkills: ['Docker'],
    missingKeywords: ['Microservices', 'Redis'],
    recommendations: ['Add more cloud-related experience'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalysisService,
        {
          provide: AnalysisRepository,
          useValue: {
            findById: jest.fn(),
            findAllByUser: jest.fn(),
            findForRetry: jest.fn(),
            findByResumeAndJobDescription: jest.fn(),
            create: jest.fn(),
            markProcessing: jest.fn(),
            markCompleted: jest.fn(),
            markFailed: jest.fn(),
            resetForRetry: jest.fn(),
          },
        },
        {
          provide: ResumeRepository,
          useValue: {
            getResumeById: jest.fn(),
          },
        },
        {
          provide: JobDescriptionRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: LLMService,
          useValue: {
            chat: jest.fn(),
            getModel: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AnalysisService>(AnalysisService);
    analysisRepository = module.get(AnalysisRepository);
    resumeRepository = module.get(ResumeRepository);
    jobDescriptionRepository = module.get(JobDescriptionRepository);
    llmService = module.get(LLMService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return the analysis when it exists', async () => {
      const analysis = {
        id: 'analysis-id',
        status: AnalysisStatus.COMPLETED,
      };

      analysisRepository.findById.mockResolvedValue(analysis);

      const result = await service.findById('analysis-id', 'user-id');

      expect(result).toEqual(analysis);

      expect(analysisRepository.findById).toHaveBeenCalledWith(
        'analysis-id',
        'user-id',
      );
    });

    it('should throw NotFoundException when analysis does not exist', async () => {
      analysisRepository.findById.mockResolvedValue(null);

      await expect(service.findById('analysis-id', 'user-id')).rejects.toThrow(
        NotFoundException,
      );

      expect(analysisRepository.findById).toHaveBeenCalledWith(
        'analysis-id',
        'user-id',
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated analyses', async () => {
      const items = [
        {
          id: 'analysis-1',
          status: AnalysisStatus.COMPLETED,
        },
        {
          id: 'analysis-2',
          status: AnalysisStatus.FAILED,
        },
      ];

      analysisRepository.findAllByUser.mockResolvedValue({
        items,
        total: 2,
      });

      const result = await service.findAll('user-id', {
        page: 1,
        limit: 10,
      });

      expect(analysisRepository.findAllByUser).toHaveBeenCalledWith(
        'user-id',
        1,
        10,
      );

      expect(result).toEqual({
        items,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      });
    });

    it('should return correct pagination for multiple pages', async () => {
      const items = [
        {
          id: 'analysis-3',
          status: AnalysisStatus.COMPLETED,
        },
      ];

      analysisRepository.findAllByUser.mockResolvedValue({
        items,
        total: 25,
      });

      const result = await service.findAll('user-id', {
        page: 2,
        limit: 10,
      });

      expect(analysisRepository.findAllByUser).toHaveBeenCalledWith(
        'user-id',
        2,
        10,
      );

      expect(result).toEqual({
        items,
        pagination: {
          page: 2,
          limit: 10,
          total: 25,
          totalPages: 3,
        },
      });
    });
  });

  describe('create', () => {
    const createDto = {
      resumeId: 'resume-id',
      jobDescriptionId: 'job-description-id',
    };

    beforeEach(() => {
      resumeRepository.getResumeById.mockResolvedValue({
        id: 'resume-id',
        rawContent: 'Resume content',
      });

      jobDescriptionRepository.findById.mockResolvedValue({
        id: 'job-description-id',
        rawContent: 'Job description content',
      });

      analysisRepository.findByResumeAndJobDescription.mockResolvedValue(null);
    });

    it('should throw NotFoundException when resume does not exist', async () => {
      resumeRepository.getResumeById.mockResolvedValue(null);

      await expect(service.create('user-id', createDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(resumeRepository.getResumeById).toHaveBeenCalledWith(
        'resume-id',
        'user-id',
      );

      expect(jobDescriptionRepository.findById).not.toHaveBeenCalled();
      expect(analysisRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when job description does not exist', async () => {
      jobDescriptionRepository.findById.mockResolvedValue(null);

      await expect(service.create('user-id', createDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(jobDescriptionRepository.findById).toHaveBeenCalledWith(
        'job-description-id',
        'user-id',
      );

      expect(analysisRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when completed analysis already exists', async () => {
      analysisRepository.findByResumeAndJobDescription.mockResolvedValue({
        id: 'analysis-id',
        status: AnalysisStatus.COMPLETED,
      });

      await expect(service.create('user-id', createDto)).rejects.toThrow(
        'Analysis already exists for this resume and job description.',
      );

      expect(analysisRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when analysis is processing', async () => {
      analysisRepository.findByResumeAndJobDescription.mockResolvedValue({
        id: 'analysis-id',
        status: AnalysisStatus.PROCESSING,
      });

      await expect(service.create('user-id', createDto)).rejects.toThrow(
        'Analysis is currently being processed.',
      );

      expect(analysisRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when analysis is pending', async () => {
      analysisRepository.findByResumeAndJobDescription.mockResolvedValue({
        id: 'analysis-id',
        status: AnalysisStatus.PENDING,
      });

      await expect(service.create('user-id', createDto)).rejects.toThrow(
        'Analysis is currently pending.',
      );

      expect(analysisRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when failed analysis already exists', async () => {
      analysisRepository.findByResumeAndJobDescription.mockResolvedValue({
        id: 'analysis-id',
        status: AnalysisStatus.FAILED,
      });

      await expect(service.create('user-id', createDto)).rejects.toThrow(
        'Analysis failed previously. Please retry the analysis.',
      );

      expect(analysisRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when resume content is missing', async () => {
      resumeRepository.getResumeById.mockResolvedValue({
        id: 'resume-id',
        rawContent: null,
      });

      analysisRepository.create.mockResolvedValue({
        id: 'analysis-id',
      });

      await expect(service.create('user-id', createDto)).rejects.toThrow(
        'Resume content is not available.',
      );

      expect(analysisRepository.create).toHaveBeenCalled();
      expect(llmService.chat).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when job description content is missing', async () => {
      jobDescriptionRepository.findById.mockResolvedValue({
        id: 'job-description-id',
        rawContent: null,
      });

      analysisRepository.create.mockResolvedValue({
        id: 'analysis-id',
      });

      await expect(service.create('user-id', createDto)).rejects.toThrow(
        'Job description content is not available.',
      );

      expect(analysisRepository.create).toHaveBeenCalled();
      expect(llmService.chat).not.toHaveBeenCalled();
    });

    it('should create and complete an analysis successfully', async () => {
      analysisRepository.create.mockResolvedValue({
        id: 'analysis-id',
      });

      analysisRepository.markProcessing.mockResolvedValue(undefined);

      llmService.chat.mockResolvedValue(validAiResponse);
      llmService.getModel.mockReturnValue('gemini-2.5-flash');

      analysisRepository.markCompleted.mockResolvedValue(undefined);

      const completedAnalysis = {
        id: 'analysis-id',
        status: AnalysisStatus.COMPLETED,
        atsScore: 85,
        resumeMatchScore: 80,
        analysisResult: validAiResponse,
        aiModel: 'gemini-2.5-flash',
      };

      analysisRepository.findById.mockResolvedValue(completedAnalysis);

      const result = await service.create('user-id', createDto);

      expect(analysisRepository.create).toHaveBeenCalledWith({
        resume: {
          connect: {
            id: 'resume-id',
          },
        },
        jobDescription: {
          connect: {
            id: 'job-description-id',
          },
        },
      });

      expect(analysisRepository.markProcessing).toHaveBeenCalledWith(
        'analysis-id',
      );

      expect(llmService.chat).toHaveBeenCalledTimes(1);
      expect(llmService.getModel).toHaveBeenCalledTimes(1);

      expect(analysisRepository.markCompleted).toHaveBeenCalledWith(
        'analysis-id',
        {
          atsScore: 85,
          resumeMatchScore: 80,
          analysisResult: validAiResponse,
          aiModel: 'gemini-2.5-flash',
        },
      );

      expect(result).toEqual(completedAnalysis);
    });

    it('should mark analysis as failed when LLM request fails', async () => {
      analysisRepository.create.mockResolvedValue({
        id: 'analysis-id',
      });

      analysisRepository.markProcessing.mockResolvedValue(undefined);
      analysisRepository.markFailed.mockResolvedValue(undefined);

      llmService.chat.mockRejectedValue(new Error('LLM service unavailable'));

      await expect(service.create('user-id', createDto)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(analysisRepository.markProcessing).toHaveBeenCalledWith(
        'analysis-id',
      );

      expect(analysisRepository.markFailed).toHaveBeenCalledWith('analysis-id');

      expect(analysisRepository.markCompleted).not.toHaveBeenCalled();
    });

    it('should mark analysis as failed when AI response is invalid', async () => {
      analysisRepository.create.mockResolvedValue({
        id: 'analysis-id',
      });

      analysisRepository.markProcessing.mockResolvedValue(undefined);
      analysisRepository.markFailed.mockResolvedValue(undefined);

      llmService.chat.mockResolvedValue({
        atsScore: 'invalid-score',
      });

      await expect(service.create('user-id', createDto)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(analysisRepository.markFailed).toHaveBeenCalledWith('analysis-id');

      expect(analysisRepository.markCompleted).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when completed analysis cannot be found after processing', async () => {
      analysisRepository.create.mockResolvedValue({
        id: 'analysis-id',
      });

      analysisRepository.markProcessing.mockResolvedValue(undefined);

      llmService.chat.mockResolvedValue(validAiResponse);
      llmService.getModel.mockReturnValue('gemini-2.5-flash');

      analysisRepository.markCompleted.mockResolvedValue(undefined);
      analysisRepository.findById.mockResolvedValue(null);

      await expect(service.create('user-id', createDto)).rejects.toThrow(
        'Analysis not found.',
      );

      expect(analysisRepository.markCompleted).toHaveBeenCalled();
    });
  });

  describe('retry', () => {
    const failedAnalysis = {
      id: 'analysis-id',
      status: AnalysisStatus.FAILED,
      resume: {
        id: 'resume-id',
        rawContent: 'Resume content',
      },
      jobDescription: {
        id: 'job-description-id',
        rawContent: 'Job description content',
      },
    };

    it('should throw NotFoundException when analysis does not exist', async () => {
      analysisRepository.findForRetry.mockResolvedValue(null);

      await expect(service.retry('analysis-id', 'user-id')).rejects.toThrow(
        NotFoundException,
      );

      expect(analysisRepository.resetForRetry).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when analysis is not failed', async () => {
      analysisRepository.findForRetry.mockResolvedValue({
        ...failedAnalysis,
        status: AnalysisStatus.COMPLETED,
      });

      await expect(service.retry('analysis-id', 'user-id')).rejects.toThrow(
        'Only failed analyses can be retried.',
      );

      expect(analysisRepository.resetForRetry).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when resume content is missing', async () => {
      analysisRepository.findForRetry.mockResolvedValue({
        ...failedAnalysis,
        resume: {
          id: 'resume-id',
          rawContent: null,
        },
      });

      await expect(service.retry('analysis-id', 'user-id')).rejects.toThrow(
        'Resume content is not available for analysis.',
      );

      expect(analysisRepository.resetForRetry).not.toHaveBeenCalled();
      expect(llmService.chat).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when job description content is missing', async () => {
      analysisRepository.findForRetry.mockResolvedValue({
        ...failedAnalysis,
        jobDescription: {
          id: 'job-description-id',
          rawContent: null,
        },
      });

      await expect(service.retry('analysis-id', 'user-id')).rejects.toThrow(
        'Job description content is not available for analysis.',
      );

      expect(analysisRepository.resetForRetry).not.toHaveBeenCalled();
      expect(llmService.chat).not.toHaveBeenCalled();
    });

    it('should successfully retry a failed analysis', async () => {
      analysisRepository.findForRetry.mockResolvedValue(failedAnalysis);

      analysisRepository.resetForRetry.mockResolvedValue(undefined);
      analysisRepository.markProcessing.mockResolvedValue(undefined);

      llmService.chat.mockResolvedValue(validAiResponse);
      llmService.getModel.mockReturnValue('gemini-2.5-flash');

      analysisRepository.markCompleted.mockResolvedValue(undefined);

      const completedAnalysis = {
        id: 'analysis-id',
        status: AnalysisStatus.COMPLETED,
        resumeId: 'resume-id',
        jobDescriptionId: 'job-description-id',
        atsScore: 85,
        resumeMatchScore: 80,
        analysisResult: validAiResponse,
        aiModel: 'gemini-2.5-flash',
      };

      analysisRepository.findById.mockResolvedValue(completedAnalysis);

      const result = await service.retry('analysis-id', 'user-id');

      expect(analysisRepository.resetForRetry).toHaveBeenCalledTimes(1);
      expect(analysisRepository.resetForRetry).toHaveBeenCalledWith(
        'analysis-id',
      );

      expect(analysisRepository.markProcessing).toHaveBeenCalledWith(
        'analysis-id',
      );

      expect(llmService.chat).toHaveBeenCalledTimes(1);

      expect(analysisRepository.markCompleted).toHaveBeenCalledWith(
        'analysis-id',
        {
          atsScore: 85,
          resumeMatchScore: 80,
          analysisResult: validAiResponse,
          aiModel: 'gemini-2.5-flash',
        },
      );

      expect(analysisRepository.findById).toHaveBeenCalledWith(
        'analysis-id',
        'user-id',
      );

      expect(result).toEqual({
        ...completedAnalysis,
        analysisResult: validAiResponse,
      });
    });

    it('should mark analysis as failed when LLM fails during retry', async () => {
      analysisRepository.findForRetry.mockResolvedValue(failedAnalysis);

      analysisRepository.resetForRetry.mockResolvedValue(undefined);
      analysisRepository.markProcessing.mockResolvedValue(undefined);
      analysisRepository.markFailed.mockResolvedValue(undefined);

      llmService.chat.mockRejectedValue(new Error('LLM service unavailable'));

      await expect(service.retry('analysis-id', 'user-id')).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(analysisRepository.resetForRetry).toHaveBeenCalledTimes(1);

      expect(analysisRepository.markProcessing).toHaveBeenCalledWith(
        'analysis-id',
      );

      expect(analysisRepository.markFailed).toHaveBeenCalledWith('analysis-id');

      expect(analysisRepository.markCompleted).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when updated analysis cannot be found after retry', async () => {
      analysisRepository.findForRetry.mockResolvedValue(failedAnalysis);

      analysisRepository.resetForRetry.mockResolvedValue(undefined);
      analysisRepository.markProcessing.mockResolvedValue(undefined);

      llmService.chat.mockResolvedValue(validAiResponse);
      llmService.getModel.mockReturnValue('gemini-2.5-flash');

      analysisRepository.markCompleted.mockResolvedValue(undefined);
      analysisRepository.findById.mockResolvedValue(null);

      await expect(service.retry('analysis-id', 'user-id')).rejects.toThrow(
        'Analysis not found.',
      );

      expect(analysisRepository.markCompleted).toHaveBeenCalled();
    });
  });
});
