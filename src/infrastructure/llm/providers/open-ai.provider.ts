import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

import { ChatOptions, LLMProvider } from '../llm.dto';
import { handleLLMError } from '../llm-error-handler';
import { parseLLMResponse } from '../llm-response-parser';

@Injectable()
export class OpenAIProvider implements LLMProvider {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.configService.getOrThrow<string>('OPENAI_API_KEY'),
    });

    this.model =
      this.configService.get<string>('OPENAI_MODEL') ?? 'gpt-4.1-mini';
  }

  async chat<T>(options: ChatOptions): Promise<T> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: options.systemPrompt,
          },
          {
            role: 'user',
            content: options.userPrompt,
          },
        ],
        response_format: {
          type: 'json_object',
        },
      });

      const content = response.choices[0]?.message.content ?? '';

      return parseLLMResponse<T>(content);
    } catch (error) {
      handleLLMError('OpenAI', error);
    }
  }

  getModel(): string {
    return this.model;
  }
}
