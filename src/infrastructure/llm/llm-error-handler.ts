export function handleLLMError(provider: string, error: unknown): never {
  if (error instanceof Error) {
    throw new Error(`${provider} request failed: ${error.message}`, {
      cause: error,
    });
  }

  throw new Error(`${provider} request failed due to an unknown error.`);
}
