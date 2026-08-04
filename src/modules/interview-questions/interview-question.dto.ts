import { ApiProperty } from '@nestjs/swagger';
import { Prisma, InterviewQuestion } from '@prisma/client';
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

export class CreateInterviewQuestionDto {
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

export class InterviewQuestionCategoryDto {
  @ApiProperty({
    description: 'Interview question category',
    example: 'Technical',
  })
  @IsString()
  @IsNotEmpty()
  category!: string;

  @ApiProperty({
    description: 'Interview questions',
    example: [
      'Explain the Node.js Event Loop.',
      'How does Redis improve application performance?',
      'What are Worker Threads?',
    ],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  questions!: string[];
}

export class InterviewQuestionResultDto {
  @ApiProperty({
    description: 'Overall summary of the generated interview questions',
    example:
      'The interview questions focus on backend engineering, distributed systems, cloud technologies, and project discussions.',
  })
  @IsString()
  @IsNotEmpty()
  overallSummary!: string;

  @ApiProperty({
    description: 'Interview questions grouped by category',
    type: [InterviewQuestionCategoryDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InterviewQuestionCategoryDto)
  categories!: InterviewQuestionCategoryDto[];
}

export class InterviewQuestionResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  id!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  analysisId!: string;

  @ApiProperty({
    type: InterviewQuestionResultDto,
  })
  result!: InterviewQuestionResultDto;

  @ApiProperty({
    description: 'LLM model used to generate interview questions',
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

export interface CreateInterviewQuestionInput {
  analysisId: string;
  result: Prisma.InputJsonValue;
  aiModel: string;
}

export interface GenerateInterviewQuestionRequest {
  resumeContent: string;
  jobDescription: string;
  analysis: AnalyzeResumeResponse;
}

export type GenerateInterviewQuestionResponse = InterviewQuestionResultDto;

export type InterviewQuestionEntity = InterviewQuestion;
