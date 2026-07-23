import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';

import { CurrentUser } from '@/shared/decorators/current-user.decorator';

import { AnalysisService } from './analysis.service';
import { AnalysisResponseDto, CreateAnalysisDto } from './analysis.dto';
import type { JwtPayload } from '../auth/auth.dto';
import { PaginationQueryDto } from '@/shared/utils/pagination.util';
import { UseGuards } from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

import {
  ApiCreated,
  ApiPaginated,
  ApiSuccess,
} from '@/shared/utils/swagger.util';

import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';

@ApiTags('Analyses')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('analyses')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post()
  @ApiOperation({
    summary: 'Create analysis',
    description: 'Analyze a resume against a job description.',
  })
  @ApiCreated(AnalysisResponseDto)
  @ApiBadRequestResponse({
    description: 'Invalid request payload.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required.',
  })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateAnalysisDto) {
    return this.analysisService.create(user.userId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get analyses',
    description: 'Retrieve all analyses created by the authenticated user.',
  })
  @ApiPaginated(AnalysisResponseDto)
  @ApiUnauthorizedResponse({
    description: 'Authentication required.',
  })
  findAll(@CurrentUser() user: JwtPayload, @Query() query: PaginationQueryDto) {
    return this.analysisService.findAll(user.userId, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get analysis by ID',
    description:
      'Retrieve a specific analysis owned by the authenticated user.',
  })
  @ApiSuccess(AnalysisResponseDto)
  @ApiUnauthorizedResponse({
    description: 'Authentication required.',
  })
  @ApiNotFoundResponse({
    description: 'Analysis not found.',
  })
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.analysisService.findById(id, user.userId);
  }

  @Post(':id/retry')
  @ApiOperation({
    summary: 'Retry failed analysis',
    description: 'Retries a previously failed analysis.',
  })
  @ApiSuccess(AnalysisResponseDto)
  @ApiBadRequestResponse({
    description: 'Only failed analyses can be retried.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required.',
  })
  @ApiNotFoundResponse({
    description: 'Analysis not found.',
  })
  retry(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.analysisService.retry(id, user.userId);
  }
}
