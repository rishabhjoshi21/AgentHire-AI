import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type {
  CreateJobDescriptionDto,
  UpdateJobDescriptionDto,
  UpdateJobDescriptionInput,
} from './job-description.dto';
import { JobDescriptionRepository } from './job-description.repository';
import { createHash } from 'crypto';
@Injectable()
export class JobDescriptionService {
  constructor(
    private readonly jobDescriptionRepository: JobDescriptionRepository,
  ) {}

  async create(userId: string, dto: CreateJobDescriptionDto) {
    let contentHash: string | undefined;
    let rawContent: string | undefined;

    if (dto.rawContent) {
      rawContent = dto.rawContent.trim();

      contentHash = this.generateHash(rawContent);

      const existing = await this.jobDescriptionRepository.findByContentHash(
        userId,
        contentHash,
      );

      if (existing) {
        throw new ConflictException('Job description already exists.');
      }
    }

    if (dto.jobUrl) {
      const existing = await this.jobDescriptionRepository.findByJobUrl(
        userId,
        dto.jobUrl,
      );

      if (existing) {
        throw new ConflictException('Job URL already exists.');
      }
    }

    return this.jobDescriptionRepository.create({
      userId,

      title: dto.title,

      company: dto.company,

      jobUrl: dto.jobUrl,

      rawContent,

      contentHash,
    });
  }

  findAll(userId: string) {
    return this.jobDescriptionRepository.findAllByUserId(userId);
  }

  async findOne(id: string, userId: string) {
    const jobDescription = await this.jobDescriptionRepository.findById(
      id,
      userId,
    );

    if (!jobDescription) {
      throw new NotFoundException('Job description not found.');
    }

    return jobDescription;
  }

  async delete(id: string, userId: string) {
    const result = await this.jobDescriptionRepository.softDelete(id, userId);

    if (!result.count) {
      throw new NotFoundException('Job description not found.');
    }

    return {
      deleted: true,
    };
  }

  async update(
    id: string,
    userId: string,
    updateJobDescriptionDto: UpdateJobDescriptionDto,
  ) {
    const payload: UpdateJobDescriptionInput = {
      ...updateJobDescriptionDto,
    };

    if (updateJobDescriptionDto.rawContent) {
      const normalizedContent = updateJobDescriptionDto.rawContent.trim();

      const contentHash = this.generateHash(normalizedContent);

      const existingJobDescription =
        await this.jobDescriptionRepository.findByContentHash(
          userId,
          contentHash,
        );

      if (existingJobDescription && existingJobDescription.id !== id) {
        throw new ConflictException('Job description already exists.');
      }

      payload.rawContent = normalizedContent;

      payload.contentHash = contentHash;
    }

    const result = await this.jobDescriptionRepository.update(
      id,
      userId,
      payload,
    );

    if (!result.count) {
      throw new NotFoundException('Job description not found.');
    }

    return {
      updated: true,
    };
  }

  private generateHash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
}
