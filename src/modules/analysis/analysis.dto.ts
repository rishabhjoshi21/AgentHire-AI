import { ApiProperty } from '@nestjs/swagger';
import { AnalysisStatus, Prisma } from '@prisma/client';
import { IsArray, IsInt, IsString, IsUUID, Max, Min } from 'class-validator';

// ======================================================
// Request DTOs
// ======================================================

export class CreateAnalysisDto {
  @ApiProperty({
    description: 'Resume ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  resumeId!: string;

  @ApiProperty({
    description: 'Job description ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  jobDescriptionId!: string;
}

// ======================================================
// Response DTOs
// ======================================================

export class AnalyzeResumeResultDto {
  @ApiProperty({
    example: 86,
  })
  @IsInt()
  @Min(0)
  @Max(100)
  atsScore!: number;

  @ApiProperty({
    example: 82,
  })
  @IsInt()
  @Min(0)
  @Max(100)
  resumeMatchScore!: number;

  @ApiProperty({
    example:
      'Strong backend profile with good Node.js experience. Missing cloud-native deployment experience.',
  })
  @IsString()
  summary!: string;

  @ApiProperty({
    example: ['Node.js', 'TypeScript', 'MongoDB'],
  })
  @IsArray()
  @IsString({ each: true })
  matchedSkills!: string[];

  @ApiProperty({
    example: ['Docker', 'Kubernetes'],
  })
  @IsArray()
  @IsString({ each: true })
  missingSkills!: string[];

  @ApiProperty({
    example: ['Microservices', 'Redis'],
  })
  @IsArray()
  @IsString({ each: true })
  keywordGaps!: string[];

  @ApiProperty({
    example: ['Add Docker experience.', 'Highlight scalable backend projects.'],
  })
  @IsArray()
  @IsString({ each: true })
  recommendations!: string[];
}

export class AnalysisResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  resumeId!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  jobDescriptionId!: string;

  @ApiProperty({
    enum: AnalysisStatus,
    example: AnalysisStatus.COMPLETED,
  })
  status!: AnalysisStatus;

  @ApiProperty({
    example: 'gpt-4.1-mini',
    nullable: true,
  })
  aiModel!: string | null;

  @ApiProperty({
    type: AnalyzeResumeResultDto,
    nullable: true,
  })
  analysisResult!: AnalyzeResumeResultDto | null;

  @ApiProperty({
    type: Date,
    example: '2023-08-01T12:34:56.789Z',
    description: 'The date and time when the analysis was created',
  })
  createdAt!: Date;

  @ApiProperty({
    type: Date,
    example: '2023-08-01T12:34:56.789Z',
    description: 'The date and time when the analysis was last updated',
  })
  updatedAt!: Date;
}

// ======================================================
// Internal Types / Interfaces
// ======================================================

export type CreateAnalysisInput = Prisma.AnalysisCreateInput;

export type CompleteAnalysisInput = Prisma.AnalysisUpdateInput;

export interface AnalyzeResumeRequest {
  resumeContent: string;
  jobDescriptionContent: string;
}

export interface AnalyzeResumeResponse {
  atsScore: number;
  resumeMatchScore: number;
  summary: string;
  matchedSkills: string[];
  missingSkills: string[];
  keywordGaps: string[];
  recommendations: string[];
}
