// ============================================================================
// BrokerOS — Retell AI Voice Personas Catalog
// ============================================================================

import type { VoicePersonaItem } from '@brokeros/types';

export const RETELL_VOICES: VoicePersonaItem[] = [
  {
    id: '11labs-rachel',
    name: 'Rachel (ElevenLabs via Retell)',
    provider: 'retell',
    accent: 'American Professional',
    gender: 'Female',
    tags: ['ElevenLabs', 'Warm', 'Default'],
    previewText: 'Hello! I am calling with an update on your luxury property inquiry.',
  },
  {
    id: '11labs-adam',
    name: 'Adam (ElevenLabs via Retell)',
    provider: 'retell',
    accent: 'American Deep',
    gender: 'Male',
    tags: ['ElevenLabs', 'Authoritative', 'Executive'],
    previewText: 'Good day. Presenting the exclusive penthouse collection at Signature Towers.',
  },
  {
    id: '11labs-viraj',
    name: 'Viraj (ElevenLabs Indic via Retell)',
    provider: 'retell',
    accent: 'Indian English / Hindi',
    gender: 'Male',
    tags: ['ElevenLabs', 'Indic English', 'Warm'],
    previewText: 'Namaste! Main Skyline Realty team se call kar raha hoon.',
  },
  {
    id: 'deepgram-asteria',
    name: 'Asteria (Deepgram Aura via Retell)',
    provider: 'retell',
    accent: 'American Clear',
    gender: 'Female',
    tags: ['Deepgram', 'Ultra Fast', 'Crisp'],
    previewText: 'Hello, this is Asteria following up on your luxury real estate inquiry.',
  },
  {
    id: 'deepgram-orion',
    name: 'Orion (Deepgram Aura via Retell)',
    provider: 'retell',
    accent: 'American Deep',
    gender: 'Male',
    tags: ['Deepgram', 'Corporate', 'Confident'],
    previewText: 'Good day! Let me guide you through the latest payment plans and inventory.',
  },
];

export async function fetchRetellAccountVoices(apiKey?: string): Promise<VoicePersonaItem[]> {
  if (!apiKey) return RETELL_VOICES;
  try {
    const res = await fetch('https://api.retellai.com/list-voices', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) return RETELL_VOICES;
    const rawVoices = (await res.json()) as any[];
    if (!Array.isArray(rawVoices) || rawVoices.length === 0) return RETELL_VOICES;

    return rawVoices.map((v: any) => {
      const prov = v.provider || 'Retell';
      const cleanName = v.voice_name || v.name || v.voice_id || v.id;
      const displayName = cleanName.includes('(') ? cleanName : `${cleanName} (${prov})`;
      return {
        id: v.voice_id || v.id,
        name: displayName,
        provider: 'retell',
        accent: v.accent ? `${v.accent.charAt(0).toUpperCase()}${v.accent.slice(1)}` : 'Global',
        gender: (v.gender ? `${v.gender.charAt(0).toUpperCase()}${v.gender.slice(1)}` : 'Unspecified') as 'Male' | 'Female' | 'Unspecified',
        tags: [prov, v.gender || 'Voice', v.accent || 'Natural'].filter(Boolean),
        previewText: 'Hello! I am calling from Retell AI to assist with your property inquiry.',
        previewUrl: v.preview_audio_url || v.audio_url || undefined,
        description: v.description || `${prov} voice with ${v.accent || 'natural'} articulation.`,
      };
    });
  } catch {
    return RETELL_VOICES;
  }
}

