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
  CreateInterviewQuestionDto,
  InterviewQuestionResponseDto,
} from './interview-question.dto';
import { InterviewQuestionService } from './interview-question.service';

@ApiTags('Interview Questions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('interview-questions')
export class InterviewQuestionController {
  constructor(
    private readonly interviewQuestionService: InterviewQuestionService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Generate interview questions',
    description:
      'Generate AI-powered interview questions from an existing completed analysis.',
  })
  @ApiCreated(InterviewQuestionResponseDto)
  @ApiBadRequestResponse({
    description: 'Invalid request payload.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required.',
  })
  @ApiConflictResponse({
    description: 'Interview questions already exist for the provided analysis.',
  })
  @ApiNotFoundResponse({
    description: 'Completed analysis not found.',
  })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateInterviewQuestionDto,
  ) {
    return this.interviewQuestionService.create(user.userId, dto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get interview questions by ID',
    description:
      'Retrieve interview questions owned by the authenticated user.',
  })
  @ApiSuccess(InterviewQuestionResponseDto)
  @ApiUnauthorizedResponse({
    description: 'Authentication required.',
  })
  @ApiNotFoundResponse({
    description: 'Interview questions not found.',
  })
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.interviewQuestionService.findById(id, user.userId);
  }

  @Get('analysis/:analysisId')
  @ApiOperation({
    summary: 'Get interview questions by Analysis ID',
    description:
      'Retrieve interview questions associated with a completed analysis.',
  })
  @ApiSuccess(InterviewQuestionResponseDto)
  @ApiUnauthorizedResponse({
    description: 'Authentication required.',
  })
  @ApiNotFoundResponse({
    description: 'Interview questions not found.',
  })
  findByAnalysisId(
    @CurrentUser() user: JwtPayload,
    @Param('analysisId', ParseUUIDPipe)
    analysisId: string,
  ) {
    return this.interviewQuestionService.findByAnalysisId(
      analysisId,
      user.userId,
    );
  }
}
