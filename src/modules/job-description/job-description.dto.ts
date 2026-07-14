import { RequireOne } from '@/shared/utils/validation.util';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateJobDescriptionDto {
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
