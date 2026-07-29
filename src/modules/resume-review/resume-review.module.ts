import { Module } from '@nestjs/common';
import { ResumeReviewController } from './resume-review.controller';
import { ResumeReviewService } from './resume-review.service';
import { AuthModule } from '../auth/auth.module';
import { ResumeModule } from '../resumes/resume.module';
import { JobDescriptionModule } from '../job-description/job-description.module';
import { AnalysisModule } from '../analysis/analysis.module';
import { LLMModule } from '@/infrastructure/llm/llm.module';
import { ResumeReviewRepository } from './resume-review.repository';

@Module({
  imports: [
    AuthModule,
    ResumeModule,
    JobDescriptionModule,
    AnalysisModule,
    LLMModule,
  ],
  controllers: [ResumeReviewController],
  providers: [ResumeReviewService, ResumeReviewRepository],
})
export class ResumeReviewModule {}
