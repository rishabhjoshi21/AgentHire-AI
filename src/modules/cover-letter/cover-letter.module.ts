import { Module } from '@nestjs/common';

import { LLMModule } from '@/infrastructure/llm/llm.module';

import { AnalysisRepository } from '../analysis/analysis.repository';

import { CoverLetterController } from './cover-letter.controller';
import { CoverLetterRepository } from './cover-letter.repository';
import { CoverLetterService } from './cover-letter.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [LLMModule, AuthModule],

  controllers: [CoverLetterController],

  providers: [CoverLetterService, CoverLetterRepository, AnalysisRepository],

  exports: [CoverLetterService],
})
export class CoverLetterModule {}
