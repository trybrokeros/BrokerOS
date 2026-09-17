// ============================================================================
// BrokerOS — Retell AI Outbound Phone Call Dispatcher
// ============================================================================

import type { SendVoiceOptions, SendVoiceResult } from '@brokeros/types';

export async function dispatchRetellOutboundCall(
  apiKey: string,
  options: SendVoiceOptions,
): Promise<SendVoiceResult> {
  let targetAgentId = options.assistantId || null;
  if (!targetAgentId) {
    const isAgentId = options.llmModel?.startsWith('agent_') || options.voiceId?.startsWith('agent_');
    targetAgentId = isAgentId ? (options.llmModel?.startsWith('agent_') ? options.llmModel : options.voiceId) : null;
  }

  if (!targetAgentId) {
    try {
      const aRes = await fetch('https://api.retellai.com/list-agents', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (aRes.ok) {
        const agents = (await aRes.json()) as any[];
        if (Array.isArray(agents) && agents.length > 0) {
          targetAgentId = agents[0].agent_id || agents[0].id;
        }
      }
    } catch {
      // fallback
    }
  }

  if (!targetAgentId) {
    return {
      success: false,
      error: 'No active Retell Agent found. Please create an agent in Retell AI Studio first.',
    };
  }

  // Resolve from_number against registered numbers in Retell account
  let fromNumber = options.fromNumber || '';
  try {
    const numRes = await fetch('https://api.retellai.com/list-phone-numbers', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (numRes.ok) {
      const numbers = (await numRes.json()) as any[];
      if (Array.isArray(numbers) && numbers.length > 0) {
        const cleanFrom = (fromNumber || '').replace(/[^\d+]/g, '');
        const match = cleanFrom
          ? numbers.find(
            (n) =>
              (n.phone_number && n.phone_number.replace(/[^\d+]/g, '') === cleanFrom) ||
              n.phone_number === fromNumber,
          )
          : null;
        fromNumber = match ? match.phone_number : numbers[0].phone_number;
      } else {
        fromNumber = '';
      }
    }
  } catch {
    // continue
  }

  if (!fromNumber) {
    return {
      success: false,
      error: 'Retell Direct call requires a registered outbound phone number in Retell AI. Please purchase or import a number in your Retell dashboard (Phone Numbers tab).',
    };
  }

  const agentOverrideProps: Record<string, any> = {};

  const voiceModel = options.retellVoiceModel || options.voiceModel;
  if (voiceModel) agentOverrideProps.voice_model = voiceModel;

  if (options.voiceSpeed !== undefined && options.voiceSpeed !== 1.0) {
    agentOverrideProps.voice_speed = options.voiceSpeed;
  }

  const emotion = options.retellEmotion || options.voiceEmotion;
  if (emotion && emotion !== 'normal' && emotion !== 'none') {
    agentOverrideProps.voice_emotion = emotion;
  }

  const ambSound = options.retellAmbientSound || options.ambientSound;
  if (ambSound && ambSound !== 'none' && ambSound !== 'off') {
    agentOverrideProps.ambient_sound = ambSound;
    agentOverrideProps.ambient_sound_volume = options.ambientSoundVolume ?? 0.8;
  }

  const backchannel = options.retellBackchannel ?? options.enableBackchannel;
  if (backchannel !== undefined) {
    agentOverrideProps.enable_backchannel = backchannel;
  }

  const reminderMs = options.retellReminderMs ?? options.reminderTriggerMs;
  if (reminderMs !== undefined && reminderMs > 0) {
    agentOverrideProps.reminder_trigger_ms = reminderMs;
  }

  const lang = options.retellLanguage || options.language;
  if (lang) {
    agentOverrideProps.language = lang;
  }

  if (options.maxDurationSeconds && options.maxDurationSeconds > 0) {
    agentOverrideProps.max_call_duration_ms = options.maxDurationSeconds * 1000;
  }

  const payload: any = {
    agent_id: targetAgentId,
    override_agent_id: targetAgentId,
    to_number: options.toPhone,
    from_number: fromNumber,
    retell_llm_dynamic_variables: {
      ...options.variables,
      system_prompt: options.scriptPrompt,
    },
  };

  if (Object.keys(agentOverrideProps).length > 0) {
    payload.agent_override = {
      agent: agentOverrideProps,
    };
  }

  try {
    const res = await fetch('https://api.retellai.com/v2/create-phone-call', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = (await res.json()) as any;

    if (res.status >= 200 && res.status < 300) {
      return {
        success: true,
        providerCallId: data.call_id || `retell_${Date.now()}`,
      };
    }

    return {
      success: false,
      error: data.message || `Retell dispatch failed with HTTP ${res.status}`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to dispatch call via Retell AI',
    };
  }
}
