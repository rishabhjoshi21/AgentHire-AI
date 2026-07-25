import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { LLMService } from './llm.service';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAIProvider } from './providers/open-ai.provider';
import { LLM_PROVIDER, LLMProviderType } from './llm.constants';
import { LLMProvider } from './llm.dto';

@Module({
  providers: [
    GeminiProvider,
    OpenAIProvider,

    {
      provide: LLM_PROVIDER,
      useFactory: (
        configService: ConfigService,
        geminiProvider: GeminiProvider,
        openAIProvider: OpenAIProvider,
      ): LLMProvider => {
        const provider =
          configService.getOrThrow<LLMProviderType>('LLM_PROVIDER');

        if (provider === LLMProviderType.GEMINI) {
          return geminiProvider;
        }

        if (provider === LLMProviderType.OPENAI) {
          return openAIProvider;
        }

        throw new Error(`Unsupported LLM provider: ${provider as string}`);
      },
      inject: [ConfigService, GeminiProvider, OpenAIProvider],
    },

    LLMService,
  ],
  exports: [LLMService],
})
export class LLMModule {}
