import { Module } from '@nestjs/common';

import { LLMModule } from '@/infrastructure/llm/llm.module';

import { AnalysisRepository } from '../analysis/analysis.repository';

import { InterviewQuestionController } from './interview-question.controller';
import { InterviewQuestionRepository } from './interview-question.repository';
import { InterviewQuestionService } from './interview-question.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [LLMModule, AuthModule],

  controllers: [InterviewQuestionController],

  providers: [
    InterviewQuestionService,
    InterviewQuestionRepository,
    AnalysisRepository,
  ],

  exports: [InterviewQuestionService],
})
export class InterviewQuestionModule {}
