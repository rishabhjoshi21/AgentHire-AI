import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

import { ChatOptions, LLMProvider } from '../llm.dto';
import { parseLLMResponse } from '../llm-response-parser';
import { handleLLMError } from '../llm-error-handler';

@Injectable()
export class GeminiProvider implements LLMProvider {
  private readonly client: GoogleGenAI;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new GoogleGenAI({
      apiKey: this.configService.getOrThrow<string>('GEMINI_API_KEY'),
    });

    this.model =
      this.configService.get<string>('GEMINI_MODEL') ?? 'gemini-2.5-flash';
  }

  async chat<T>(options: ChatOptions): Promise<T> {
    const prompt = `
        System:
        ${options.systemPrompt}

        User:
        ${options.userPrompt}

        Return ONLY valid JSON.
      `;

    try {
      const response = await this.client.models.generateContent({
        model: this.model,
        contents: prompt,
      });

      return parseLLMResponse<T>(response.text ?? '');
    } catch (error) {
      handleLLMError('Gemini', error);
    }
  }

  getModel(): string {
    return this.model;
  }
}
