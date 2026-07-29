import { ApiProperty } from '@nestjs/swagger';
import { Prisma, ResumeReview } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { AnalyzeResumeResponse } from '../analysis/analysis.dto';

/* -------------------------------------------------------------------------- */
/*                                Request DTO                                 */
/* -------------------------------------------------------------------------- */

export class CreateResumeReviewDto {
  @ApiProperty({
    description: 'Analysis ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  analysisId!: string;
}

/* -------------------------------------------------------------------------- */
/*                               Response DTOs                                */
/* -------------------------------------------------------------------------- */

export class ResumeReviewSectionDto {
  @ApiProperty({
    description: 'Resume section name as identified in the resume',
    example: 'Professional Summary',
  })
  @IsString()
  @IsNotEmpty()
  section!: string;

  @ApiProperty({
    description: 'Improved content for the resume section',
    example:
      'Backend Software Engineer with 3+ years of experience building scalable cloud-native applications using Node.js, TypeScript, AWS, Azure, Docker, and PostgreSQL.',
  })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({
    description: 'Reason for improving this section',
    example:
      'Added ATS keywords, improved readability, and highlighted cloud technologies.',
  })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

export class ResumeReviewResultDto {
  @ApiProperty({
    description: 'Overall summary of the resume review',
    example:
      'The resume is well aligned with the job description but can be improved by emphasizing measurable achievements and cloud-native experience.',
  })
  @IsString()
  @IsNotEmpty()
  overallSummary!: string;

  @ApiProperty({
    description: 'Sections that were improved',
    type: [ResumeReviewSectionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResumeReviewSectionDto)
  sections!: ResumeReviewSectionDto[];

  @ApiProperty({
    description: 'General recommendations for improving the resume',
    type: [String],
    example: [
      'Quantify achievements wherever possible.',
      'Mention Docker and CI/CD experience.',
      'Highlight system scalability and performance improvements.',
    ],
  })
  @IsArray()
  @IsString({ each: true })
  recommendations!: string[];
}

export class ResumeReviewResponseDto {
  @ApiProperty({
    description: 'Resume Review ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  id!: string;

  @ApiProperty({
    description: 'Associated Analysis ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  analysisId!: string;

  @ApiProperty({
    type: ResumeReviewResultDto,
  })
  reviewResult!: ResumeReviewResultDto;

  @ApiProperty({
    description: 'LLM model used to generate the review',
    example: 'gemini-2.5-pro',
    nullable: true,
  })
  aiModel!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

/* -------------------------------------------------------------------------- */
/*                              Internal Types                                */
/* -------------------------------------------------------------------------- */

export interface CreateResumeReviewInput {
  analysisId: string;
  reviewResult: Prisma.InputJsonValue;
  aiModel: string;
}

export interface CompleteResumeReviewInput {
  id: string;
  reviewResult: GenerateResumeReviewResponse;
  aiModel: string;
}

export interface GenerateResumeReviewRequest {
  resumeContent: string;
  jobDescription: string;
  analysis: AnalyzeResumeResponse;
}

export interface GenerateResumeReviewResponse {
  overallSummary: string;
  sections: ResumeReviewSectionDto[];
  recommendations: string[];
}

export type ResumeReviewEntity = ResumeReview;
