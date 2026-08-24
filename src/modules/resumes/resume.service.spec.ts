import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

// ======================================================
// Module Mocks
// IMPORTANT:
// These mocks are declared before importing ResumeService.
// This prevents Jest from loading the real ResumeParser,
// which imports ESM-only pdfjs-dist.
// ======================================================

jest.mock('fs/promises', () => ({
  unlink: jest.fn(),
}));

jest.mock('@/shared/utils/file-upload.util', () => ({
  generateFileHash: jest.fn(),
}));

jest.mock('./parsers/resume.parser', () => ({
  ResumeParser: jest.fn(),
}));

// ======================================================
// Imports after mocks
// ======================================================

import { unlink } from 'fs/promises';

import { generateFileHash } from '@/shared/utils/file-upload.util';

import { ResumeService } from './resume.service';
import { ResumeRepository } from './resume.repository';
import { ResumeParser } from './parsers/resume.parser';

import type { UploadedFile } from './resume.dto';

// ======================================================
// Typed Mocks
// ======================================================

const mockedUnlink = jest.mocked(unlink);
const mockedGenerateFileHash = jest.mocked(generateFileHash);

// ======================================================
// Test Suite
// ======================================================

describe('ResumeService', () => {
  let service: ResumeService;

  let resumeRepository: {
    createResume: jest.Mock;
    getResumeByHash: jest.Mock;
    getUserResumes: jest.Mock;
    getResumeById: jest.Mock;
    softDeleteResume: jest.Mock;
  };

  let resumeParser: {
    extractText: jest.Mock;
  };

  // ======================================================
  // Mock Data
  // ======================================================

  const mockFile: UploadedFile = {
    fieldname: 'file',
    originalname: 'my-resume.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    size: 1024,
    destination: 'uploads',
    filename: 'my-resume.pdf',
    path: 'uploads/my-resume.pdf',
    buffer: Buffer.from('mock resume content'),
  };

  const mockParsedResume = {
    content: 'John Doe\nNode.js Developer',
    metadata: {
      emails: ['john@example.com'],
      phones: ['1234567890'],
      links: [],
    },
  };

  const mockResume = {
    id: 'resume-id',
    title: 'my-resume',
    originalFileName: 'my-resume.pdf',
    mimeType: 'application/pdf',
    fileSize: 1024,
    createdAt: new Date(),
  };

  // ======================================================
  // Setup
  // ======================================================

  beforeEach(async () => {
    jest.clearAllMocks();

    resumeRepository = {
      createResume: jest.fn(),
      getResumeByHash: jest.fn(),
      getUserResumes: jest.fn(),
      getResumeById: jest.fn(),
      softDeleteResume: jest.fn(),
    };

    resumeParser = {
      extractText: jest.fn(),
    };

    mockedUnlink.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResumeService,
        {
          provide: ResumeRepository,
          useValue: resumeRepository,
        },
        {
          provide: ResumeParser,
          useValue: resumeParser,
        },
      ],
    }).compile();

    service = module.get<ResumeService>(ResumeService);
  });

  // ======================================================
  // uploadResume
  // ======================================================

  describe('uploadResume', () => {
    it('should upload and create a resume successfully', async () => {
      mockedGenerateFileHash.mockResolvedValue('file-hash');

      resumeRepository.getResumeByHash.mockResolvedValue(null);

      resumeParser.extractText.mockResolvedValue(mockParsedResume);

      resumeRepository.createResume.mockResolvedValue(mockResume);

      const result = await service.uploadResume('user-id', mockFile);

      expect(mockedGenerateFileHash).toHaveBeenCalledWith(mockFile.path);

      expect(resumeRepository.getResumeByHash).toHaveBeenCalledWith(
        'user-id',
        'file-hash',
      );

      expect(resumeParser.extractText).toHaveBeenCalledWith(
        mockFile.path,
        mockFile.mimetype,
      );

      expect(resumeRepository.createResume).toHaveBeenCalledWith({
        userId: 'user-id',
        title: 'my-resume',
        rawContent: JSON.stringify(mockParsedResume),
        fileHash: 'file-hash',
        originalFileName: 'my-resume.pdf',
        mimeType: 'application/pdf',
        storagePath: mockFile.path,
        fileSize: mockFile.size,
      });

      expect(mockedUnlink).not.toHaveBeenCalled();

      expect(result).toEqual(mockResume);
    });

    it('should return existing resume and delete uploaded file when duplicate resume is found', async () => {
      mockedGenerateFileHash.mockResolvedValue('file-hash');

      resumeRepository.getResumeByHash.mockResolvedValue(mockResume);

      const result = await service.uploadResume('user-id', mockFile);

      expect(resumeRepository.getResumeByHash).toHaveBeenCalledWith(
        'user-id',
        'file-hash',
      );

      expect(mockedUnlink).toHaveBeenCalledTimes(1);

      expect(mockedUnlink).toHaveBeenCalledWith(mockFile.path);

      expect(resumeParser.extractText).not.toHaveBeenCalled();

      expect(resumeRepository.createResume).not.toHaveBeenCalled();

      expect(result).toEqual(mockResume);
    });

    it('should delete the uploaded file when hash generation fails', async () => {
      const error = new Error('Failed to generate file hash');

      mockedGenerateFileHash.mockRejectedValue(error);

      await expect(service.uploadResume('user-id', mockFile)).rejects.toThrow(
        error,
      );

      expect(resumeRepository.getResumeByHash).not.toHaveBeenCalled();

      expect(resumeParser.extractText).not.toHaveBeenCalled();

      expect(resumeRepository.createResume).not.toHaveBeenCalled();

      expect(mockedUnlink).toHaveBeenCalledTimes(1);

      expect(mockedUnlink).toHaveBeenCalledWith(mockFile.path);
    });

    it('should delete the uploaded file when resume parsing fails', async () => {
      const error = new Error('Failed to parse resume');

      mockedGenerateFileHash.mockResolvedValue('file-hash');

      resumeRepository.getResumeByHash.mockResolvedValue(null);

      resumeParser.extractText.mockRejectedValue(error);

      await expect(service.uploadResume('user-id', mockFile)).rejects.toThrow(
        error,
      );

      expect(resumeRepository.createResume).not.toHaveBeenCalled();

      expect(mockedUnlink).toHaveBeenCalledTimes(1);

      expect(mockedUnlink).toHaveBeenCalledWith(mockFile.path);
    });

    it('should delete the uploaded file when database creation fails', async () => {
      const error = new Error('Database creation failed');

      mockedGenerateFileHash.mockResolvedValue('file-hash');

      resumeRepository.getResumeByHash.mockResolvedValue(null);

      resumeParser.extractText.mockResolvedValue(mockParsedResume);

      resumeRepository.createResume.mockRejectedValue(error);

      await expect(service.uploadResume('user-id', mockFile)).rejects.toThrow(
        error,
      );

      expect(resumeRepository.createResume).toHaveBeenCalledTimes(1);

      expect(mockedUnlink).toHaveBeenCalledTimes(1);

      expect(mockedUnlink).toHaveBeenCalledWith(mockFile.path);
    });
  });

  // ======================================================
  // getUserResumes
  // ======================================================

  describe('getUserResumes', () => {
    it('should return all resumes for the user', async () => {
      const resumes = [
        mockResume,
        {
          ...mockResume,
          id: 'resume-id-2',
          title: 'another-resume',
        },
      ];

      resumeRepository.getUserResumes.mockResolvedValue(resumes);

      const result = await service.getUserResumes('user-id');

      expect(resumeRepository.getUserResumes).toHaveBeenCalledTimes(1);

      expect(resumeRepository.getUserResumes).toHaveBeenCalledWith('user-id');

      expect(result).toEqual(resumes);
    });

    it('should return an empty array when the user has no resumes', async () => {
      resumeRepository.getUserResumes.mockResolvedValue([]);

      const result = await service.getUserResumes('user-id');

      expect(resumeRepository.getUserResumes).toHaveBeenCalledWith('user-id');

      expect(result).toEqual([]);
    });
  });

  // ======================================================
  // getResumeById
  // ======================================================

  describe('getResumeById', () => {
    it('should return the resume when it exists', async () => {
      resumeRepository.getResumeById.mockResolvedValue(mockResume);

      const result = await service.getResumeById('resume-id', 'user-id');

      expect(resumeRepository.getResumeById).toHaveBeenCalledTimes(1);

      expect(resumeRepository.getResumeById).toHaveBeenCalledWith(
        'resume-id',
        'user-id',
      );

      expect(result).toEqual(mockResume);
    });

    it('should throw NotFoundException when resume does not exist', async () => {
      resumeRepository.getResumeById.mockResolvedValue(null);

      await expect(
        service.getResumeById('resume-id', 'user-id'),
      ).rejects.toThrow(NotFoundException);

      expect(resumeRepository.getResumeById).toHaveBeenCalledWith(
        'resume-id',
        'user-id',
      );
    });
  });

  // ======================================================
  // deleteResume
  // ======================================================

  describe('deleteResume', () => {
    it('should soft delete the resume successfully', async () => {
      resumeRepository.softDeleteResume.mockResolvedValue({
        count: 1,
      });

      const result = await service.deleteResume('resume-id', 'user-id');

      expect(resumeRepository.softDeleteResume).toHaveBeenCalledTimes(1);

      expect(resumeRepository.softDeleteResume).toHaveBeenCalledWith(
        'resume-id',
        'user-id',
      );

      expect(result).toEqual({
        deleted: true,
      });
    });

    it('should throw NotFoundException when resume does not exist', async () => {
      resumeRepository.softDeleteResume.mockResolvedValue({
        count: 0,
      });

      await expect(
        service.deleteResume('resume-id', 'user-id'),
      ).rejects.toThrow(NotFoundException);

      expect(resumeRepository.softDeleteResume).toHaveBeenCalledWith(
        'resume-id',
        'user-id',
      );
    });
  });
});
