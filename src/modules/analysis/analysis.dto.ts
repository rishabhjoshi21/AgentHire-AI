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
    description: 'Job Description ID',
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
    description: 'ATS compatibility score (0-100)',
    example: 86,
  })
  @IsInt()
  @Min(0)
  @Max(100)
  atsScore!: number;

  @ApiProperty({
    description: 'Overall resume match score (0-100)',
    example: 82,
  })
  @IsInt()
  @Min(0)
  @Max(100)
  resumeMatchScore!: number;

  @ApiProperty({
    description: 'Overall AI summary of the resume',
    example:
      'Strong backend profile with good Node.js experience. Missing cloud-native deployment experience.',
  })
  @IsString()
  summary!: string;

  @ApiProperty({
    description: 'Skills successfully matched with the job description',
    example: ['Node.js', 'TypeScript', 'MongoDB'],
  })
  @IsArray()
  @IsString({ each: true })
  matchedSkills!: string[];

  @ApiProperty({
    description: 'Required skills missing from the resume',
    example: ['Docker', 'Kubernetes'],
  })
  @IsArray()
  @IsString({ each: true })
  missingSkills!: string[];

  @ApiProperty({
    description: 'Important ATS keywords not found in the resume',
    example: ['Microservices', 'Redis'],
  })
  @IsArray()
  @IsString({ each: true })
  missingKeywords!: string[];

  @ApiProperty({
    description: 'AI suggestions to improve the resume',
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
    example: 'gemini-flash-latest',
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
  })
  createdAt!: Date;

  @ApiProperty({
    type: Date,
    example: '2023-08-01T12:34:56.789Z',
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

/**
 * Alias to keep a single source of truth.
 * The AI response should match AnalyzeResumeResultDto.
 */
export type AnalyzeResumeResponse = AnalyzeResumeResultDto;
