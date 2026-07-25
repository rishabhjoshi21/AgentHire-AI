import { Inject, Injectable } from '@nestjs/common';

import { ChatOptions } from './llm.dto';
import type { LLMProvider } from './llm.dto';
import { LLM_PROVIDER } from './llm.constants';

@Injectable()
export class LLMService {
  constructor(
    @Inject(LLM_PROVIDER)
    private readonly provider: LLMProvider,
  ) {}

  async chat<T>(options: ChatOptions): Promise<T> {
    return this.provider.chat<T>(options);
  }

  getModel(): string {
    return this.provider.getModel();
  }
}
