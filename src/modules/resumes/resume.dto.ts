import { ApiProperty } from '@nestjs/swagger';
export interface CreateResumeInput {
  userId: string;

  title: string;

  rawContent?: string;

  optimizedContent?: string;

  originalFileName: string;

  mimeType: string;

  storagePath: string;

  fileSize: number;

  fileHash: string;
}

export interface UploadedFile {
  fieldname: string;

  originalname: string;

  encoding: string;

  mimetype: string;

  size: number;

  destination: string;

  filename: string;

  path: string;

  buffer: Buffer;
}

export interface ResumeFile {
  originalname: string;

  mimetype: string;

  size: number;

  path: string;
}

export interface ResumeLink {
  type: 'linkedin' | 'github' | 'portfolio' | 'other';

  url: string;
}

export interface ResumeMetadata {
  emails: string[];

  phones: string[];

  links: ResumeLink[];
}

export interface ParsedResume {
  content: string;

  metadata: ResumeMetadata;
}

export class CreateResumeDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Resume file (PDF or DOCX)',
  })
  file!: Express.Multer.File;
}

export class ResumeResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  originalFileName!: string;

  @ApiProperty()
  mimeType!: string;

  @ApiProperty()
  storagePath!: string;

  @ApiProperty()
  fileSize!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
