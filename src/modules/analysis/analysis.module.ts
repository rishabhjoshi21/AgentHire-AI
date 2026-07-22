import { Module } from '@nestjs/common';

import { LLMModule } from '@/infrastructure/llm/llm.module';
import { JobDescriptionModule } from '../job-description/job-description.module';
import { ResumeModule } from '../resumes/resume.module';

import { AnalysisController } from './analysis.controller';
import { AnalysisRepository } from './analysis.repository';
import { AnalysisService } from './analysis.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, ResumeModule, JobDescriptionModule, LLMModule],

  controllers: [AnalysisController],

  providers: [AnalysisService, AnalysisRepository],

  exports: [AnalysisService],
})
export class AnalysisModule {}
