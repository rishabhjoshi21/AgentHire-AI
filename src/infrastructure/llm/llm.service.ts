import { Injectable } from '@nestjs/common';

import { ChatOptions } from './llm.dto';
import { GeminiProvider } from './providers/gemini.provider';

@Injectable()
export class LLMService {
  constructor(private readonly provider: GeminiProvider) {}

  async chat<T>(options: ChatOptions): Promise<T> {
    return this.provider.chat<T>(options);
  }

  getModel(): string {
    return this.provider.getModel();
  }
}
