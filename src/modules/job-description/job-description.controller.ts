import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';

import type { JwtPayload } from '../auth/auth.dto';

import { JobDescriptionService } from './job-description.service';
import {
  CreateJobDescriptionDto,
  JobDescriptionResponseDto,
  UpdateJobDescriptionDto,
} from './job-description.dto';
import { ParseUUIDPipe } from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
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
@ApiTags('Job Descriptions')
@Controller('job-descriptions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class JobDescriptionController {
  constructor(private readonly jobDescriptionService: JobDescriptionService) {}
  // Create a new job description
  @Post()
  @ApiOperation({
    summary: 'Create job description',
    description: 'Create a new job description.',
  })
  @ApiCreated(JobDescriptionResponseDto)
  @ApiBadRequestResponse({
    description: 'Invalid request payload.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required.',
  })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() body: CreateJobDescriptionDto,
  ) {
    return this.jobDescriptionService.create(user.userId, body);
  }

  // Get all job descriptions for the authenticated user
  @Get()
  @ApiOperation({
    summary: 'Get all job descriptions',
    description: 'Retrieve all job descriptions for the authenticated user.',
  })
  @ApiPaginated(JobDescriptionResponseDto)
  @ApiUnauthorizedResponse({
    description: 'Authentication required.',
  })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.jobDescriptionService.findAll(user.userId);
  }

  // Get a specific job description by ID
  @Get(':id')
  @ApiOperation({
    summary: 'Get job description by ID',
    description: 'Retrieve a specific job description by its ID.',
  })
  @ApiSuccess(JobDescriptionResponseDto)
  @ApiUnauthorizedResponse({
    description: 'Authentication required.',
  })
  @ApiNotFoundResponse({
    description: 'Job description not found.',
  })
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.jobDescriptionService.findOne(id, user.userId);
  }

  // Delete a specific job description by ID
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete job description',
    description: 'Delete a specific job description by its ID.',
  })
  @ApiSuccess(JobDescriptionResponseDto)
  @ApiUnauthorizedResponse({
    description: 'Authentication required.',
  })
  @ApiNotFoundResponse({
    description: 'Job description not found.',
  })
  remove(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.jobDescriptionService.delete(id, user.userId);
  }

  // Update a specific job description by ID
  @Patch(':id')
  @ApiOperation({
    summary: 'Update job description',
    description: 'Update a specific job description by its ID.',
  })
  @ApiSuccess(JobDescriptionResponseDto)
  @ApiBadRequestResponse({
    description: 'Invalid request payload.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required.',
  })
  @ApiNotFoundResponse({
    description: 'Job description not found.',
  })
  update(
    @Param('id', new ParseUUIDPipe())
    id: string,

    @CurrentUser()
    user: JwtPayload,

    @Body()
    updateJobDescriptionDto: UpdateJobDescriptionDto,
  ) {
    return this.jobDescriptionService.update(
      id,
      user.userId,
      updateJobDescriptionDto,
    );
  }
}
