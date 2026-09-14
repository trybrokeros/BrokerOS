// ============================================================================
// BrokerOS — Bolna AI Models & Dynamic Agent Loader
// ============================================================================

import type { VoiceModelItem } from '@brokeros/types';

export const STANDARD_BOLNA_MODELS: VoiceModelItem[] = [
  { id: 'azure/gpt-4.1-mini', name: 'Azure GPT-4.1 Mini (Bolna Low Latency)', provider: 'Azure OpenAI', badge: 'Recommended', description: 'Ultra-low latency conversational engine for Indian languages' },
  { id: 'azure/gpt-4o', name: 'Azure GPT-4o (Bolna Intelligent)', provider: 'Azure OpenAI', badge: 'High Intelligence', description: 'Enterprise sales qualification & objection handling' },
  { id: 'openai/gpt-4o-mini', name: 'OpenAI GPT-4o Mini', provider: 'OpenAI', badge: 'Fast', description: 'Real-time multilingual dialogue synthesis' },
  { id: 'anthropic/claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', badge: 'High Nuance', description: 'Complex conversational reasoning & empathy' },
  { id: 'deepseek/deepseek-v3', name: 'DeepSeek V3 (Bolna Speed)', provider: 'DeepSeek', badge: 'Speed Leader', description: 'Cost-effective high-speed conversational LLM' },
];

export async function fetchBolnaDynamicAgents(apiKey: string): Promise<VoiceModelItem[]> {
  if (!apiKey) return [];
  const dynamicAgents: VoiceModelItem[] = [];
  try {
    const res = await fetch('https://api.bolna.ai/v2/agent/all', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (res.ok) {
      const data = (await res.json()) as any;
      const agentsList = Array.isArray(data) ? data : data?.items || [];
      for (const ag of agentsList) {
        dynamicAgents.push({
          id: ag.id || ag.agent_id,
          name: `${ag.agent_name || 'Bolna Agent'} (${ag.id?.slice(0, 8)}...)`,
          provider: 'Bolna Custom Agent',
          badge: ag.agent_status === 'processed' ? 'Active Agent' : 'Configured',
          description: `Live Bolna Agent (${ag.agent_name || ag.id}) · LLM: ${ag.tasks?.[0]?.tools_config?.llm_agent?.llm_config?.model || 'azure/gpt-4.1-mini'}`,
        });
      }
    }
  } catch {
    // fallback
  }
  return dynamicAgents;
}
