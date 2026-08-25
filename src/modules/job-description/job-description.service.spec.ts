import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createHash } from 'crypto';

import { JobDescriptionService } from './job-description.service';
import { JobDescriptionRepository } from './job-description.repository';
describe('JobDescriptionService', () => {
  let service: JobDescriptionService;

  const jobDescriptionRepository = {
    create: jest.fn(),
    findAllByUserId: jest.fn(),
    findById: jest.fn(),
    softDelete: jest.fn(),
    findByContentHash: jest.fn(),
    findByJobUrl: jest.fn(),
    update: jest.fn(),
  };

  const userId = 'user-id';
  const jobDescriptionId = 'job-description-id';

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobDescriptionService,
        {
          provide: JobDescriptionRepository,
          useValue: jobDescriptionRepository,
        },
      ],
    }).compile();

    service = module.get<JobDescriptionService>(JobDescriptionService);
  });

  const generateHash = (value: string) =>
    createHash('sha256').update(value).digest('hex');

  // ======================================================
  // create
  // ======================================================

  describe('create', () => {
    it('should create a job description successfully with raw content', async () => {
      const dto = {
        title: 'Senior Backend Engineer',
        company: 'OpenAI',
        rawContent: '  We are looking for a Node.js Developer.  ',
      };

      const normalizedContent = 'We are looking for a Node.js Developer.';

      const contentHash = generateHash(normalizedContent);

      const createdJobDescription = {
        id: jobDescriptionId,
        userId,
        title: dto.title,
        company: dto.company,
        rawContent: normalizedContent,
        contentHash,
      };

      jobDescriptionRepository.findByContentHash.mockResolvedValue(null);
      jobDescriptionRepository.create.mockResolvedValue(createdJobDescription);

      const result = await service.create(userId, dto);

      expect(jobDescriptionRepository.findByContentHash).toHaveBeenCalledTimes(
        1,
      );

      expect(jobDescriptionRepository.findByContentHash).toHaveBeenCalledWith(
        userId,
        contentHash,
      );

      expect(jobDescriptionRepository.findByJobUrl).not.toHaveBeenCalled();

      expect(jobDescriptionRepository.create).toHaveBeenCalledTimes(1);

      expect(jobDescriptionRepository.create).toHaveBeenCalledWith({
        userId,
        title: dto.title,
        company: dto.company,
        jobUrl: undefined,
        rawContent: normalizedContent,
        contentHash,
      });

      expect(result).toEqual(createdJobDescription);
    });

    it('should create a job description successfully with only a job URL', async () => {
      const dto = {
        title: 'Backend Engineer',
        company: 'OpenAI',
        jobUrl: 'https://careers.openai.com/job/123',
      };

      const createdJobDescription = {
        id: jobDescriptionId,
        userId,
        title: dto.title,
        company: dto.company,
        jobUrl: dto.jobUrl,
      };

      jobDescriptionRepository.findByJobUrl.mockResolvedValue(null);
      jobDescriptionRepository.create.mockResolvedValue(createdJobDescription);

      const result = await service.create(userId, dto);

      expect(jobDescriptionRepository.findByContentHash).not.toHaveBeenCalled();

      expect(jobDescriptionRepository.findByJobUrl).toHaveBeenCalledTimes(1);

      expect(jobDescriptionRepository.findByJobUrl).toHaveBeenCalledWith(
        userId,
        dto.jobUrl,
      );

      expect(jobDescriptionRepository.create).toHaveBeenCalledTimes(1);

      expect(jobDescriptionRepository.create).toHaveBeenCalledWith({
        userId,
        title: dto.title,
        company: dto.company,
        jobUrl: dto.jobUrl,
        rawContent: undefined,
        contentHash: undefined,
      });

      expect(result).toEqual(createdJobDescription);
    });

    it('should create a job description successfully with both raw content and job URL', async () => {
      const dto = {
        title: 'Senior Backend Engineer',
        company: 'OpenAI',
        jobUrl: 'https://careers.openai.com/job/123',
        rawContent: '  Looking for a Node.js Engineer.  ',
      };

      const normalizedContent = 'Looking for a Node.js Engineer.';

      const contentHash = generateHash(normalizedContent);

      const createdJobDescription = {
        id: jobDescriptionId,
        userId,
        title: dto.title,
        company: dto.company,
        jobUrl: dto.jobUrl,
        rawContent: normalizedContent,
        contentHash,
      };

      jobDescriptionRepository.findByContentHash.mockResolvedValue(null);
      jobDescriptionRepository.findByJobUrl.mockResolvedValue(null);
      jobDescriptionRepository.create.mockResolvedValue(createdJobDescription);

      const result = await service.create(userId, dto);

      expect(jobDescriptionRepository.findByContentHash).toHaveBeenCalledWith(
        userId,
        contentHash,
      );

      expect(jobDescriptionRepository.findByJobUrl).toHaveBeenCalledWith(
        userId,
        dto.jobUrl,
      );

      expect(jobDescriptionRepository.create).toHaveBeenCalledWith({
        userId,
        title: dto.title,
        company: dto.company,
        jobUrl: dto.jobUrl,
        rawContent: normalizedContent,
        contentHash,
      });

      expect(result).toEqual(createdJobDescription);
    });

    it('should throw ConflictException when job description content already exists', async () => {
      const dto = {
        title: 'Backend Engineer',
        rawContent: 'Existing job description content',
      };

      const contentHash = generateHash(dto.rawContent);

      jobDescriptionRepository.findByContentHash.mockResolvedValue({
        id: 'existing-job-description-id',
      });

      await expect(service.create(userId, dto)).rejects.toThrow(
        new ConflictException('Job description already exists.'),
      );

      expect(jobDescriptionRepository.findByContentHash).toHaveBeenCalledWith(
        userId,
        contentHash,
      );

      expect(jobDescriptionRepository.findByJobUrl).not.toHaveBeenCalled();

      expect(jobDescriptionRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when job URL already exists', async () => {
      const dto = {
        title: 'Backend Engineer',
        jobUrl: 'https://careers.openai.com/job/123',
      };

      jobDescriptionRepository.findByJobUrl.mockResolvedValue({
        id: 'existing-job-description-id',
      });

      await expect(service.create(userId, dto)).rejects.toThrow(
        new ConflictException('Job URL already exists.'),
      );

      expect(jobDescriptionRepository.findByContentHash).not.toHaveBeenCalled();

      expect(jobDescriptionRepository.findByJobUrl).toHaveBeenCalledWith(
        userId,
        dto.jobUrl,
      );

      expect(jobDescriptionRepository.create).not.toHaveBeenCalled();
    });

    it('should not create a job description when content is duplicate even if a job URL is also provided', async () => {
      const dto = {
        title: 'Backend Engineer',
        jobUrl: 'https://careers.openai.com/job/123',
        rawContent: 'Existing job description content',
      };

      const contentHash = generateHash(dto.rawContent);

      jobDescriptionRepository.findByContentHash.mockResolvedValue({
        id: 'existing-job-description-id',
      });

      await expect(service.create(userId, dto)).rejects.toThrow(
        new ConflictException('Job description already exists.'),
      );

      expect(jobDescriptionRepository.findByContentHash).toHaveBeenCalledWith(
        userId,
        contentHash,
      );

      expect(jobDescriptionRepository.findByJobUrl).not.toHaveBeenCalled();

      expect(jobDescriptionRepository.create).not.toHaveBeenCalled();
    });

    it('should not create a job description when job URL is duplicate after content validation passes', async () => {
      const dto = {
        title: 'Backend Engineer',
        jobUrl: 'https://careers.openai.com/job/123',
        rawContent: 'New job description content',
      };

      const contentHash = generateHash(dto.rawContent);

      jobDescriptionRepository.findByContentHash.mockResolvedValue(null);

      jobDescriptionRepository.findByJobUrl.mockResolvedValue({
        id: 'existing-job-description-id',
      });

      await expect(service.create(userId, dto)).rejects.toThrow(
        new ConflictException('Job URL already exists.'),
      );

      expect(jobDescriptionRepository.findByContentHash).toHaveBeenCalledWith(
        userId,
        contentHash,
      );

      expect(jobDescriptionRepository.findByJobUrl).toHaveBeenCalledWith(
        userId,
        dto.jobUrl,
      );

      expect(jobDescriptionRepository.create).not.toHaveBeenCalled();
    });
  });

  // ======================================================
  // findAll
  // ======================================================

  describe('findAll', () => {
    it('should return all job descriptions for the user', async () => {
      const jobDescriptions = [
        {
          id: 'job-description-1',
          title: 'Backend Engineer',
        },
        {
          id: 'job-description-2',
          title: 'Node.js Developer',
        },
      ];

      jobDescriptionRepository.findAllByUserId.mockResolvedValue(
        jobDescriptions,
      );

      const result = await service.findAll(userId);

      expect(jobDescriptionRepository.findAllByUserId).toHaveBeenCalledTimes(1);

      expect(jobDescriptionRepository.findAllByUserId).toHaveBeenCalledWith(
        userId,
      );

      expect(result).toEqual(jobDescriptions);
    });

    it('should return an empty array when the user has no job descriptions', async () => {
      jobDescriptionRepository.findAllByUserId.mockResolvedValue([]);

      const result = await service.findAll(userId);

      expect(jobDescriptionRepository.findAllByUserId).toHaveBeenCalledWith(
        userId,
      );

      expect(result).toEqual([]);
    });
  });

  // ======================================================
  // findOne
  // ======================================================

  describe('findOne', () => {
    it('should return the job description when it exists', async () => {
      const jobDescription = {
        id: jobDescriptionId,
        userId,
        title: 'Backend Engineer',
      };

      jobDescriptionRepository.findById.mockResolvedValue(jobDescription);

      const result = await service.findOne(jobDescriptionId, userId);

      expect(jobDescriptionRepository.findById).toHaveBeenCalledTimes(1);

      expect(jobDescriptionRepository.findById).toHaveBeenCalledWith(
        jobDescriptionId,
        userId,
      );

      expect(result).toEqual(jobDescription);
    });

    it('should throw NotFoundException when job description does not exist', async () => {
      jobDescriptionRepository.findById.mockResolvedValue(null);

      await expect(service.findOne(jobDescriptionId, userId)).rejects.toThrow(
        new NotFoundException('Job description not found.'),
      );

      expect(jobDescriptionRepository.findById).toHaveBeenCalledWith(
        jobDescriptionId,
        userId,
      );
    });
  });

  // ======================================================
  // delete
  // ======================================================

  describe('delete', () => {
    it('should soft delete the job description successfully', async () => {
      jobDescriptionRepository.softDelete.mockResolvedValue({
        count: 1,
      });

      const result = await service.delete(jobDescriptionId, userId);

      expect(jobDescriptionRepository.softDelete).toHaveBeenCalledTimes(1);

      expect(jobDescriptionRepository.softDelete).toHaveBeenCalledWith(
        jobDescriptionId,
        userId,
      );

      expect(result).toEqual({
        deleted: true,
      });
    });

    it('should throw NotFoundException when job description does not exist during delete', async () => {
      jobDescriptionRepository.softDelete.mockResolvedValue({
        count: 0,
      });

      await expect(service.delete(jobDescriptionId, userId)).rejects.toThrow(
        new NotFoundException('Job description not found.'),
      );

      expect(jobDescriptionRepository.softDelete).toHaveBeenCalledWith(
        jobDescriptionId,
        userId,
      );
    });
  });

  // ======================================================
  // update
  // ======================================================

  describe('update', () => {
    it('should update a job description successfully without raw content', async () => {
      const dto = {
        title: 'Senior Backend Engineer',
        company: 'OpenAI',
        jobUrl: 'https://careers.openai.com/job/456',
      };

      jobDescriptionRepository.update.mockResolvedValue({
        count: 1,
      });

      const result = await service.update(jobDescriptionId, userId, dto);

      expect(jobDescriptionRepository.findByContentHash).not.toHaveBeenCalled();

      expect(jobDescriptionRepository.update).toHaveBeenCalledTimes(1);

      expect(jobDescriptionRepository.update).toHaveBeenCalledWith(
        jobDescriptionId,
        userId,
        dto,
      );

      expect(result).toEqual({
        updated: true,
      });
    });

    it('should normalize content and update content hash when raw content is provided', async () => {
      const dto = {
        title: 'Senior Backend Engineer',
        rawContent: '  Updated Node.js job description.  ',
      };

      const normalizedContent = 'Updated Node.js job description.';

      const contentHash = generateHash(normalizedContent);

      jobDescriptionRepository.findByContentHash.mockResolvedValue(null);

      jobDescriptionRepository.update.mockResolvedValue({
        count: 1,
      });

      const result = await service.update(jobDescriptionId, userId, dto);

      expect(jobDescriptionRepository.findByContentHash).toHaveBeenCalledTimes(
        1,
      );

      expect(jobDescriptionRepository.findByContentHash).toHaveBeenCalledWith(
        userId,
        contentHash,
      );

      expect(jobDescriptionRepository.update).toHaveBeenCalledTimes(1);

      expect(jobDescriptionRepository.update).toHaveBeenCalledWith(
        jobDescriptionId,
        userId,
        {
          title: dto.title,
          rawContent: normalizedContent,
          contentHash,
        },
      );

      expect(result).toEqual({
        updated: true,
      });
    });

    it('should throw ConflictException when updated content belongs to another job description', async () => {
      const dto = {
        rawContent: 'Duplicate job description content',
      };

      const contentHash = generateHash(dto.rawContent);

      jobDescriptionRepository.findByContentHash.mockResolvedValue({
        id: 'another-job-description-id',
      });

      await expect(
        service.update(jobDescriptionId, userId, dto),
      ).rejects.toThrow(
        new ConflictException('Job description already exists.'),
      );

      expect(jobDescriptionRepository.findByContentHash).toHaveBeenCalledWith(
        userId,
        contentHash,
      );

      expect(jobDescriptionRepository.update).not.toHaveBeenCalled();
    });

    it('should allow updating with the same content when it belongs to the same job description', async () => {
      const dto = {
        rawContent: 'Existing job description content',
      };

      const contentHash = generateHash(dto.rawContent);

      jobDescriptionRepository.findByContentHash.mockResolvedValue({
        id: jobDescriptionId,
      });

      jobDescriptionRepository.update.mockResolvedValue({
        count: 1,
      });

      const result = await service.update(jobDescriptionId, userId, dto);

      expect(jobDescriptionRepository.findByContentHash).toHaveBeenCalledWith(
        userId,
        contentHash,
      );

      expect(jobDescriptionRepository.update).toHaveBeenCalledWith(
        jobDescriptionId,
        userId,
        {
          rawContent: dto.rawContent,
          contentHash,
        },
      );

      expect(result).toEqual({
        updated: true,
      });
    });

    it('should update successfully when raw content does not already exist', async () => {
      const dto = {
        rawContent: 'Completely new job description content',
      };

      const contentHash = generateHash(dto.rawContent);

      jobDescriptionRepository.findByContentHash.mockResolvedValue(null);

      jobDescriptionRepository.update.mockResolvedValue({
        count: 1,
      });

      const result = await service.update(jobDescriptionId, userId, dto);

      expect(jobDescriptionRepository.findByContentHash).toHaveBeenCalledWith(
        userId,
        contentHash,
      );

      expect(jobDescriptionRepository.update).toHaveBeenCalledWith(
        jobDescriptionId,
        userId,
        {
          rawContent: dto.rawContent,
          contentHash,
        },
      );

      expect(result).toEqual({
        updated: true,
      });
    });

    it('should throw NotFoundException when job description does not exist during update', async () => {
      const dto = {
        title: 'Updated Backend Engineer',
      };

      jobDescriptionRepository.update.mockResolvedValue({
        count: 0,
      });

      await expect(
        service.update(jobDescriptionId, userId, dto),
      ).rejects.toThrow(new NotFoundException('Job description not found.'));

      expect(jobDescriptionRepository.findByContentHash).not.toHaveBeenCalled();

      expect(jobDescriptionRepository.update).toHaveBeenCalledWith(
        jobDescriptionId,
        userId,
        dto,
      );
    });

    it('should throw NotFoundException after content validation passes but update affects no records', async () => {
      const dto = {
        rawContent: 'Updated content',
      };

      const contentHash = generateHash(dto.rawContent);

      jobDescriptionRepository.findByContentHash.mockResolvedValue(null);

      jobDescriptionRepository.update.mockResolvedValue({
        count: 0,
      });

      await expect(
        service.update(jobDescriptionId, userId, dto),
      ).rejects.toThrow(new NotFoundException('Job description not found.'));

      expect(jobDescriptionRepository.findByContentHash).toHaveBeenCalledWith(
        userId,
        contentHash,
      );

      expect(jobDescriptionRepository.update).toHaveBeenCalledWith(
        jobDescriptionId,
        userId,
        {
          rawContent: dto.rawContent,
          contentHash,
        },
      );
    });
  });
});
