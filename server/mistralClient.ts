// Mistral AI Client for Rubi Assistant
import { Mistral } from '@mistralai/mistralai';

let mistralClient: Mistral | null = null;

export function getMistralClient(): Mistral {
  if (!mistralClient) {
    const apiKey = process.env.MISTRAL_API_KEY;
    
    if (!apiKey) {
      throw new Error('MISTRAL_API_KEY environment variable is required');
    }

    mistralClient = new Mistral({
      apiKey: apiKey,
    });
  }

  return mistralClient;
}

export function getMistralModel(): string {
  return process.env.MISTRAL_MODEL || 'mistral-large-latest';
}

// Available Mistral models:
// - mistral-large-latest (most capable)
// - mistral-medium-latest (balanced)
// - mistral-small-latest (faster, cheaper)
// - mistral-tiny (fastest, cheapest)
// - codestral-latest (for code generation)

export const MISTRAL_MODELS = {
  LARGE: 'mistral-large-latest',
  MEDIUM: 'mistral-medium-latest', 
  SMALL: 'mistral-small-latest',
  TINY: 'mistral-tiny',
  CODESTRAL: 'codestral-latest',
} as const;
