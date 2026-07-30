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
  CreateResumeReviewDto,
  ResumeReviewResponseDto,
} from './resume-review.dto';
import { ResumeReviewService } from './resume-review.service';

@ApiTags('Resume Reviews')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('resume-reviews')
export class ResumeReviewController {
  constructor(private readonly resumeReviewService: ResumeReviewService) {}

  @Post()
  @ApiOperation({
    summary: 'Generate resume review',
    description:
      'Generate an AI-powered resume review for an existing completed analysis.',
  })
  @ApiCreated(ResumeReviewResponseDto)
  @ApiBadRequestResponse({
    description: 'Invalid request payload.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required.',
  })
  @ApiConflictResponse({
    description: 'Resume review already exists for the provided analysis.',
  })
  @ApiNotFoundResponse({
    description: 'Completed analysis not found.',
  })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateResumeReviewDto) {
    return this.resumeReviewService.create(user.userId, dto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get resume review by ID',
    description: 'Retrieve a resume review owned by the authenticated user.',
  })
  @ApiSuccess(ResumeReviewResponseDto)
  @ApiUnauthorizedResponse({
    description: 'Authentication required.',
  })
  @ApiNotFoundResponse({
    description: 'Resume review not found.',
  })
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.resumeReviewService.findById(id, user.userId);
  }

  @Get('analysis/:analysisId')
  @ApiOperation({
    summary: 'Get resume review by analysis ID',
    description: 'Retrieve the resume review associated with an analysis.',
  })
  @ApiSuccess(ResumeReviewResponseDto)
  @ApiUnauthorizedResponse({
    description: 'Authentication required.',
  })
  @ApiNotFoundResponse({
    description: 'Resume review not found.',
  })
  findByAnalysisId(
    @CurrentUser() user: JwtPayload,
    @Param('analysisId', ParseUUIDPipe)
    analysisId: string,
  ) {
    return this.resumeReviewService.findByAnalysisId(analysisId, user.userId);
  }
}
