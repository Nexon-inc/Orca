export interface AIClientResponse {
  content: string;
}

export interface HybridAIClient {
  invoke(prompt: string | any[]): Promise<AIClientResponse>;
  stream?(prompt: string | any[]): AsyncGenerator<string, void, unknown>;
}
