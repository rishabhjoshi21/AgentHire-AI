import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

import { ChatOptions, LLMProvider } from '../llm.dto';

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

    const content = response.choices[0]?.message.content;

    if (!content) {
      throw new Error('LLM returned an empty response.');
    }

    return JSON.parse(content) as T;
  }
  getModel(): string {
    return this.configService.getOrThrow<string>('OPENAI_MODEL');
  }
}
