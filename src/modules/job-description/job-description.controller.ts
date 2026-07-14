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
  UpdateJobDescriptionDto,
} from './job-description.dto';
import { ParseUUIDPipe } from '@nestjs/common';
@Controller('job-descriptions')
@UseGuards(JwtAuthGuard)
export class JobDescriptionController {
  constructor(private readonly jobDescriptionService: JobDescriptionService) {}

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Body() body: CreateJobDescriptionDto,
  ) {
    return this.jobDescriptionService.create(user.userId, body);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.jobDescriptionService.findAll(user.userId);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.jobDescriptionService.findOne(id, user.userId);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.jobDescriptionService.delete(id, user.userId);
  }

  @Patch(':id')
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
