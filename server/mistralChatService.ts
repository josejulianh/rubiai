// Chat service using Mistral AI
import { getMistralClient, getMistralModel } from './mistralClient';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  model?: string;
}

export class MistralChatService {
  /**
   * Generate a chat completion using Mistral AI
   */
  async generateChatCompletion(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {}
  ) {
    const client = getMistralClient();
    const model = options.model || getMistralModel();

    try {
      const response = await client.chat.complete({
        model: model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: options.temperature ?? 0.7,
        maxTokens: options.maxTokens ?? 1000,
        topP: options.topP ?? 1,
      });

      return {
        content: response.choices[0]?.message?.content || '',
        model: response.model,
        usage: {
          promptTokens: response.usage?.promptTokens || 0,
          completionTokens: response.usage?.completionTokens || 0,
          totalTokens: response.usage?.totalTokens || 0,
        },
      };
    } catch (error) {
      console.error('Mistral AI error:', error);
      throw new Error('Failed to generate chat completion');
    }
  }

  /**
   * Stream a chat completion (for real-time responses)
   */
  async *streamChatCompletion(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {}
  ) {
    const client = getMistralClient();
    const model = options.model || getMistralModel();

    try {
      const stream = await client.chat.stream({
        model: model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: options.temperature ?? 0.7,
        maxTokens: options.maxTokens ?? 1000,
        topP: options.topP ?? 1,
      });

      for await (const chunk of stream) {
        const content = chunk.data.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      console.error('Mistral AI streaming error:', error);
      throw new Error('Failed to stream chat completion');
    }
  }

  /**
   * Generate embeddings using Mistral
   */
  async generateEmbeddings(texts: string[]) {
    const client = getMistralClient();

    try {
      const response = await client.embeddings.create({
        model: 'mistral-embed',
        inputs: texts,
      });

      return response.data.map(item => item.embedding);
    } catch (error) {
      console.error('Mistral embeddings error:', error);
      throw new Error('Failed to generate embeddings');
    }
  }
}

export const mistralChatService = new MistralChatService();
