import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { ApiCreated, ApiSuccess } from '@/shared/utils/swagger.util';

import type { JwtPayload } from '../auth/auth.dto';

import {
  CoverLetterResponseDto,
  CreateCoverLetterDto,
} from './cover-letter.dto';
import { CoverLetterService } from './cover-letter.service';

@ApiTags('Cover Letters')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('cover-letters')
export class CoverLetterController {
  constructor(private readonly coverLetterService: CoverLetterService) {}

  @Post()
  @ApiOperation({
    summary: 'Generate cover letter',
    description:
      'Generate an AI-powered cover letter from an existing completed analysis.',
  })
  @ApiCreated(CoverLetterResponseDto)
  @ApiBadRequestResponse({
    description: 'Invalid request payload.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required.',
  })
  @ApiConflictResponse({
    description: 'Cover letter already exists for the provided analysis.',
  })
  @ApiNotFoundResponse({
    description: 'Completed analysis not found.',
  })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateCoverLetterDto) {
    return this.coverLetterService.create(user.userId, dto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get cover letter by ID',
    description: 'Retrieve a cover letter owned by the authenticated user.',
  })
  @ApiSuccess(CoverLetterResponseDto)
  @ApiUnauthorizedResponse({
    description: 'Authentication required.',
  })
  @ApiNotFoundResponse({
    description: 'Cover letter not found.',
  })
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.coverLetterService.findById(id, user.userId);
  }

  @Get('analysis/:analysisId')
  @ApiOperation({
    summary: 'Get cover letter by Analysis ID',
    description:
      'Retrieve the cover letter associated with a completed analysis.',
  })
  @ApiSuccess(CoverLetterResponseDto)
  @ApiUnauthorizedResponse({
    description: 'Authentication required.',
  })
  @ApiNotFoundResponse({
    description: 'Cover letter not found.',
  })
  findByAnalysisId(
    @CurrentUser() user: JwtPayload,
    @Param('analysisId', ParseUUIDPipe) analysisId: string,
  ) {
    return this.coverLetterService.findByAnalysisId(analysisId, user.userId);
  }
}
