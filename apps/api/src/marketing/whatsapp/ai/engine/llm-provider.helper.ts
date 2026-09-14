import { Logger, BadRequestException } from '@nestjs/common';

export interface LlmCompletionRequest {
  provider: string;
  model: string;
  apiKey: string;
  systemPrompt: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  logger: Logger;
  temperature?: number;
}

export async function callLlmChatCompletion(
  req: LlmCompletionRequest,
): Promise<string> {
  const { provider, model, apiKey, systemPrompt, messages, logger, temperature = 0.8 } = req;

  let endpoint = 'https://api.groq.com/openai/v1/chat/completions';
  if (provider === 'openai') {
    endpoint = 'https://api.openai.com/v1/chat/completions';
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        max_tokens: 500,
        temperature,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const errBody = await response.text();
      logger.error(
        `AI draft completion failed: ${response.status} - ${errBody}`,
      );
      throw new BadRequestException(`AI completion error: ${response.status}`);
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content?.trim() || '';
  } catch (err: any) {
    logger.error(`AI generation error: ${err?.message}`);
    throw new BadRequestException(
      `AI draft generation failed: ${err?.message}`,
    );
  }
}
