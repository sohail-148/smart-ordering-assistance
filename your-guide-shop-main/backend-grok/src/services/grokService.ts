import { config } from '../config/env';
import { GrokMessage, GrokChatRequest, GrokChatResponse } from '../types';

export class GrokService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = config.GROK_API_KEY;
    this.apiUrl = config.GROK_API_URL;
  }

  /**
   * Send chat request to Grok API
   */
  async chat(messages: GrokMessage[]): Promise<string> {
    try {
      const request: GrokChatRequest = {
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
        max_tokens: 500,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Grok API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json() as GrokChatResponse;
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from Grok API');
      }

      return data.choices[0].message.content;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new Error('Grok API request timeout');
      }
      console.error('Grok API error:', error);
      throw error;
    }
  }

  /**
   * Check if Grok API is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export const grokService = new GrokService();
