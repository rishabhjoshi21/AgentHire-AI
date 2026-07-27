export function parseLLMResponse<T>(response: string): T {
  if (!response?.trim()) {
    throw new Error('LLM returned an empty response.');
  }

  const cleaned = response
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error(
      `Failed to parse LLM response as JSON.\n\nReceived:\n${cleaned}`,
    );
  }
}
