// ============================================================================
// BrokerOS — ElevenLabs ConvAI Conversation Dispatcher
// ============================================================================

import type { SendVoiceOptions, SendVoiceResult } from '@brokeros/types';

export async function dispatchElevenLabsCall(
  apiKey: string,
  options: SendVoiceOptions,
): Promise<SendVoiceResult> {
  const targetAgentId = options.assistantId || (options.voiceId && options.voiceId.length >= 10 ? options.voiceId : null);
  if (!targetAgentId) {
    return {
      success: false,
      error: 'No ElevenLabs Agent ID specified for outbound call.',
    };
  }

  try {
    const res = await fetch('https://api.elevenlabs.io/v1/convai/conversations', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id: targetAgentId,
        dynamic_variables: options.variables || {},
      }),
    });

    const data = (await res.json().catch(() => ({}))) as any;

    if (res.status >= 200 && res.status < 300) {
      return {
        success: true,
        providerCallId: data.conversation_id || `11labs_${Date.now()}`,
      };
    }

    return {
      success: false,
      error: data.detail?.message || data.message || `ElevenLabs dispatch failed with HTTP ${res.status}`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to dispatch call via ElevenLabs',
    };
  }
}
