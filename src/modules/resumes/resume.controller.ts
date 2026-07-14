import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';

import type { JwtPayload } from '../auth/auth.dto';
import type { UploadedFile as UploadFileType } from './resume.dto';
import { ResumeService } from './resume.service';
import { createUploadConfig } from '@/shared/utils/file-upload.util';

@Controller('resumes')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor(
      'file',
      createUploadConfig({
        destination: './uploads/resumes',
        allowedMimeTypes: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        maxFileSizeInMB: 5,
      }),
    ),
  )
  uploadResume(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: UploadFileType,
  ) {
    return this.resumeService.uploadResume(user.userId, file);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getMyResumes(@CurrentUser() user: JwtPayload) {
    return this.resumeService.getUserResumes(user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getResume(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.resumeService.getResumeById(id, user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteResume(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.resumeService.deleteResume(id, user.userId);
  }
}
