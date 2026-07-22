export interface ChatOptions {
  systemPrompt: string;
  userPrompt: string;
}

export interface LLMProvider {
  chat<T>(options: ChatOptions): Promise<T>;
  getModel(): string;
}
