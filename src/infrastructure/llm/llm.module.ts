import { Module } from '@nestjs/common';

import { LLMService } from './llm.service';
import { GeminiProvider } from './providers/gemini.provider';

@Module({
  providers: [LLMService, GeminiProvider],
  exports: [LLMService],
})
export class LLMModule {}
