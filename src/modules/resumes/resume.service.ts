import { Injectable, NotFoundException } from '@nestjs/common';

import type { UploadedFile } from './resume.dto';

import { ResumeRepository } from './resume.repository';
import { ResumeParser } from './parsers/resume.parser';
import { unlink } from 'fs/promises';
import { generateFileHash } from '@/shared/utils/file-upload.util';

@Injectable()
export class ResumeService {
  constructor(
    private readonly resumeRepository: ResumeRepository,
    private readonly resumeParser: ResumeParser,
  ) {}

  async uploadResume(userId: string, file: UploadedFile) {
    try {
      const fileHash = await generateFileHash(file.path);

      const existingResume = await this.resumeRepository.getResumeByHash(
        userId,
        fileHash,
      );

      if (existingResume) {
        await unlink(file.path);

        return existingResume;
      }

      const parsedResume = await this.resumeParser.extractText(
        file.path,
        file.mimetype,
      );
      const title = file.originalname.replace(/\.[^/.]+$/, '');

      return this.resumeRepository.createResume({
        userId,
        title,
        rawContent: JSON.stringify(parsedResume),
        fileHash,
        originalFileName: file.originalname,
        mimeType: file.mimetype,
        storagePath: file.path,
        fileSize: file.size,
      });
    } catch (error) {
      await unlink(file.path);
      throw error;
    }
  }

  getUserResumes(userId: string) {
    return this.resumeRepository.getUserResumes(userId);
  }

  async getResumeById(resumeId: string, userId: string) {
    const resume = await this.resumeRepository.getResumeById(resumeId, userId);

    if (!resume) {
      throw new NotFoundException('Resume not found.');
    }

    return resume;
  }

  async deleteResume(resumeId: string, userId: string) {
    const result = await this.resumeRepository.softDeleteResume(
      resumeId,
      userId,
    );

    if (!result.count) {
      throw new NotFoundException('Resume not found.');
    }

    return {
      deleted: true,
    };
  }
}
