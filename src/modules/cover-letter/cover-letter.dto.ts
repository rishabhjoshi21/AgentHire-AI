import { ApiProperty } from '@nestjs/swagger';
import { CoverLetter } from '@prisma/client';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

import { AnalyzeResumeResponse } from '../analysis/analysis.dto';

/* -------------------------------------------------------------------------- */
/*                                Request DTO                                 */
/* -------------------------------------------------------------------------- */

export class CreateCoverLetterDto {
  @ApiProperty({
    description: 'Analysis ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  analysisId!: string;
}

/* -------------------------------------------------------------------------- */
/*                               Response DTO                                 */
/* -------------------------------------------------------------------------- */

export class CoverLetterResponseDto {
  @ApiProperty({
    description: 'Cover Letter ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  id!: string;

  @ApiProperty({
    description: 'Associated Analysis ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  analysisId!: string;

  @ApiProperty({
    description: 'Generated cover letter content',
    example:
      'Dear Hiring Manager,\n\nI am excited to apply for the Backend Software Engineer position...',
  })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({
    description: 'LLM model used to generate the cover letter',
    example: 'gemini-2.5-flash',
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

export interface CreateCoverLetterInput {
  analysisId: string;
  content: string;
  aiModel: string;
}

export interface GenerateCoverLetterRequest {
  resumeContent: string;
  jobDescription: string;
  analysis: AnalyzeResumeResponse;
}

export interface GenerateCoverLetterResponse {
  content: string;
}

export class GenerateCoverLetterResponseDto {
  @ApiProperty({
    description: 'Generated cover letter content',
    example:
      'Dear Hiring Manager,\n\nI am excited to apply for the Backend Software Engineer position...',
  })
  @IsString()
  @IsNotEmpty()
  content!: string;
}

export type CoverLetterEntity = CoverLetter;
