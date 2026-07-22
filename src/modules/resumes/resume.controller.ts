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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  ApiCreated,
  ApiPaginated,
  ApiSuccess,
} from '@/shared/utils/swagger.util';

import { CreateResumeDto, ResumeResponseDto } from './resume.dto';
@ApiTags('Resume')
@Controller('resumes')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post('upload')
  @ApiOperation({
    summary: 'Upload resume',
    description: 'Upload a PDF or DOCX resume for analysis.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreateResumeDto,
  })
  @ApiCreated(ResumeResponseDto)
  @ApiBearerAuth('JWT-auth')
  @ApiBadRequestResponse({
    description: 'Invalid file.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required.',
  })
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
  @ApiOperation({
    summary: 'Get all resumes',
    description: 'Retrieve all resumes uploaded by the authenticated user.',
  })
  @ApiPaginated(ResumeResponseDto)
  @ApiBearerAuth('JWT-auth')
  @ApiUnauthorizedResponse({
    description: 'Authentication required.',
  })
  @UseGuards(JwtAuthGuard)
  getMyResumes(@CurrentUser() user: JwtPayload) {
    return this.resumeService.getUserResumes(user.userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get resume by ID',
    description: 'Retrieve a specific resume owned by the authenticated user.',
  })
  @ApiSuccess(ResumeResponseDto)
  @ApiBearerAuth('JWT-auth')
  @ApiUnauthorizedResponse({
    description: 'Authentication required.',
  })
  @ApiNotFoundResponse({
    description: 'Resume not found.',
  })
  @UseGuards(JwtAuthGuard)
  getResume(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.resumeService.getResumeById(id, user.userId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete resume',
    description: 'Delete a resume owned by the authenticated user.',
  })
  @ApiSuccess(ResumeResponseDto)
  @ApiBearerAuth('JWT-auth')
  @ApiUnauthorizedResponse({
    description: 'Authentication required.',
  })
  @ApiNotFoundResponse({
    description: 'Resume not found.',
  })
  @UseGuards(JwtAuthGuard)
  deleteResume(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.resumeService.deleteResume(id, user.userId);
  }
}
