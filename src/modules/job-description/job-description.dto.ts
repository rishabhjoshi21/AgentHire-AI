import { RequireOne } from '@/shared/utils/validation.util';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateJobDescriptionDto {
  @ApiPropertyOptional({
    example: 'Senior Backend Engineer',
    description: 'Title of the job description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    example: 'OpenAI',
    description: 'Company name associated with the job description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  company?: string;

  @ApiPropertyOptional({
    example: 'https://careers.company.com/job/123',
    description: 'URL of the job description',
  })
  @IsOptional()
  @IsUrl()
  jobUrl?: string;

  @ApiPropertyOptional({
    example: 'We are looking for a Senior Node.js Developer...',
    description: 'Raw content of the job description',
  })
  @IsOptional()
  @IsString()
  rawContent?: string;

  @RequireOne(['rawContent', 'jobUrl'], {
    message: 'Either job description content or job URL is required.',
  })
  private readonly validateContent!: boolean;
}
export class UpdateJobDescriptionDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  company?: string;

  @IsOptional()
  @IsUrl()
  jobUrl?: string;

  @IsOptional()
  @IsString()
  rawContent?: string;
}

export interface CreateJobDescriptionInput {
  userId: string;

  title?: string;

  company?: string;

  jobUrl?: string;

  rawContent?: string;

  contentHash?: string;
}

export interface UpdateJobDescriptionInput {
  title?: string;

  company?: string;

  jobUrl?: string;

  rawContent?: string;

  contentHash?: string;
}

export class JobDescriptionResponseDto {
  @ApiProperty({
    example: '1234567890',
    description: 'Unique identifier for the job description',
  })
  id!: string;

  @ApiProperty({
    example: 'Senior Backend Engineer',
    description: 'Title of the job description',
  })
  title!: string;

  @ApiProperty({
    example: 'OpenAI',
    description: 'Company name associated with the job description',
  })
  company!: string;

  @ApiProperty({
    example: 'https://careers.company.com/job/123',
    description: 'URL of the job description',
  })
  jobUrl!: string;

  @ApiProperty({
    example: 'We are looking for a Senior Node.js Developer...',
    description: 'Raw content of the job description',
  })
  rawContent!: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Timestamp when the job description was created',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Timestamp when the job description was last updated',
  })
  updatedAt!: Date;
}
