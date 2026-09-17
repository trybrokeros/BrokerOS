// ============================================================================
// BrokerOS — Voice Audio Preview & TTS Synthesis Service
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { prismaClient } from '@brokeros/prisma';
import { getVoiceAgentProvider } from '@brokeros/int-voice';
import type { PreviewAudioTtsDto } from '../dto/voice.dto.js';
import type { VoiceAgentPlatform } from '@brokeros/types';

import {
  ELEVEN_VOICE_MAP,
  DEEPGRAM_MAP,
  SARVAM_SPEAKERS,
} from './tts/tts-providers.constants.js';
import { synthesizeElevenLabs } from './tts/elevenlabs-tts.js';
import { synthesizeSarvam } from './tts/sarvam-tts.js';
import { synthesizeDeepgram } from './tts/deepgram-tts.js';
import { synthesizeCartesia } from './tts/cartesia-tts.js';
import { synthesizeOpenAi } from './tts/openai-tts.js';
import { synthesizeMiniMax, synthesizeFishAudio } from './tts/minimax-tts.js';

@Injectable()
export class VoiceAudioService {
  private readonly logger = new Logger(VoiceAudioService.name);
  private readonly prisma = prismaClient;

  async previewTtsAudio(
    dto: PreviewAudioTtsDto,
  ): Promise<{ audioBuffer: Buffer; contentType: string }> {
    let apiKey = '';
    let platform: VoiceAgentPlatform = 'VAPI';

    if (dto.agentPlatformId) {
      const integration = await this.prisma.voiceAgentIntegration.findUnique({
        where: { id: dto.agentPlatformId },
      });
      if (integration) {
        apiKey = integration.apiKey;
        platform = integration.platform;
      }
    }

    const rawVoiceId = (dto.voiceId || '').trim();
    const rawProvider = (dto.voiceProvider || '').toLowerCase().trim();

    // 1. Detect provider from prefix
    let cleanVoiceId = rawVoiceId;
    let effectiveProvider = rawProvider;

    if (/^(11labs|elevenlabs|eleven)[-_]/i.test(rawVoiceId)) {
      effectiveProvider = '11labs';
      cleanVoiceId = rawVoiceId.replace(/^(11labs|elevenlabs|eleven)[-_]/i, '');
    } else if (/^deepgram[-_]/i.test(rawVoiceId)) {
      effectiveProvider = 'deepgram';
      cleanVoiceId = rawVoiceId.replace(/^deepgram[-_]/i, '');
    } else if (/^cartesia[-_]/i.test(rawVoiceId)) {
      effectiveProvider = 'cartesia';
      cleanVoiceId = rawVoiceId.replace(/^cartesia[-_]/i, '');
    } else if (/^openai[-_]/i.test(rawVoiceId)) {
      effectiveProvider = 'openai';
      cleanVoiceId = rawVoiceId.replace(/^openai[-_]/i, '');
    } else if (/^sarvam[-_]/i.test(rawVoiceId)) {
      effectiveProvider = 'sarvam';
      cleanVoiceId = rawVoiceId.replace(/^sarvam[-_]/i, '');
    }

    const voiceIdLower = cleanVoiceId.toLowerCase();
    const providerLower = effectiveProvider.replace(/[\s-_]/g, '');

    const isSarvam =
      providerLower.includes('sarvam') ||
      platform === 'SARVAM' ||
      SARVAM_SPEAKERS.includes(voiceIdLower);
    const isEleven =
      providerLower.includes('11labs') ||
      providerLower.includes('eleven') ||
      platform === 'ELEVENLABS' ||
      !!ELEVEN_VOICE_MAP[voiceIdLower];
    const isOpenai =
      providerLower.includes('openai') || platform === 'OPENAI_REALTIME';
    const isDeepgram =
      providerLower.includes('deepgram') ||
      voiceIdLower.startsWith('aura-') ||
      !!DEEPGRAM_MAP[voiceIdLower];
    const isCartesia =
      providerLower.includes('cartesia') ||
      platform === 'PIPECAT' ||
      (cleanVoiceId.includes('-') && cleanVoiceId.length === 36);

    const isMale =
      /male|adrian|adam|antoni|josh|michael|george|callum|liam|will|brian|orion|zeus|helios|orpheus|arcas|perseus|james|elliot|nico|kai|sagar|godfrey|neil|sid|rohan|rahul|shubh|kabir|aditya|varun|manan|sumit/i.test(
        cleanVoiceId,
      );

    // 1. Sarvam AI Cloud TTS (Bulbul v3)
    let sarvamKey = process.env.SARVAM_API_KEY;
    if (!sarvamKey) {
      const sInt = await this.prisma.voiceAgentIntegration.findFirst({
        where: { platform: 'SARVAM', isActive: true },
      });
      if (sInt) sarvamKey = sInt.apiKey;
    }
    if (isSarvam && sarvamKey) {
      try {
        const audio = await synthesizeSarvam(dto.text, cleanVoiceId, sarvamKey);
        if (audio) return audio;
      } catch (err: any) {
        this.logger.warn(`Sarvam TTS failed: ${err?.message}`);
      }
    }

    // 2. ElevenLabs Cloud TTS
    let elevenKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenKey && platform === 'ELEVENLABS') elevenKey = apiKey;
    if (!elevenKey) {
      const eInt = await this.prisma.voiceAgentIntegration.findFirst({
        where: { platform: 'ELEVENLABS', isActive: true },
      });
      if (eInt) elevenKey = eInt.apiKey;
    }
    if (isEleven && elevenKey) {
      try {
        const audio = await synthesizeElevenLabs(dto.text, cleanVoiceId, elevenKey, isMale);
        if (audio) return audio;
      } catch (err: any) {
        this.logger.warn(`ElevenLabs TTS failed: ${err?.message}`);
      }
    }

    // 3. Deepgram Aura Cloud TTS
    const deepgramKey = process.env.DEEPGRAM_API_KEY;
    if (isDeepgram && deepgramKey) {
      try {
        const audio = await synthesizeDeepgram(dto.text, cleanVoiceId, deepgramKey);
        if (audio) return audio;
      } catch (err: any) {
        this.logger.warn(`Deepgram TTS failed: ${err?.message}`);
      }
    }

    // 4. Cartesia Cloud TTS (Sonic 3.5)
    const cartesiaKey = process.env.CARTESIA_API_KEY;
    if (isCartesia && cartesiaKey) {
      try {
        const audio = await synthesizeCartesia(dto.text, cleanVoiceId, cartesiaKey, isMale);
        if (audio) return audio;
      } catch (err: any) {
        this.logger.warn(`Cartesia TTS failed: ${err?.message}`);
      }
    }

    // 5. OpenAI Cloud TTS
    const openaiKey = process.env.OPENAI_API_KEY;
    if (isOpenai && openaiKey) {
      try {
        const audio = await synthesizeOpenAi(dto.text, cleanVoiceId, openaiKey);
        if (audio) return audio;
      } catch (err: any) {
        this.logger.warn(`OpenAI TTS failed: ${err?.message}`);
      }
    }

    // 6. MiniMax Cloud TTS
    const minimaxKey = process.env.MINIMAX_API_KEY;
    const isMinimax =
      providerLower.includes('minimax') ||
      rawVoiceId.toLowerCase().startsWith('minimax');
    if (isMinimax && minimaxKey) {
      try {
        const audio = await synthesizeMiniMax(dto.text, cleanVoiceId, minimaxKey, isMale);
        if (audio) return audio;
      } catch (err: any) {
        this.logger.warn(`MiniMax TTS failed: ${err?.message}`);
      }
    }

    // 7. Fish Audio Cloud TTS
    const fishKey = process.env.FISH_AUDIO_API_KEY;
    const isFishAudio =
      providerLower.includes('fish') ||
      rawVoiceId.toLowerCase().startsWith('fishaudio');
    if (isFishAudio && fishKey) {
      try {
        const audio = await synthesizeFishAudio(dto.text, cleanVoiceId, fishKey);
        if (audio) return audio;
      } catch (err: any) {
        this.logger.warn(`Fish Audio TTS failed: ${err?.message}`);
      }
    }

    // 8. Persona Synthesis Fallback
    if (cartesiaKey) {
      try {
        const cartesiaFallback = isMale
          ? 'a0e99841-438c-4a64-b679-ae501e7d6091' // Barbershop Man / Sonic
          : '79a125e8-cd45-4c13-8a67-188112f4dd22'; // British Lady / Sonic
        const audio = await synthesizeCartesia(dto.text, cartesiaFallback, cartesiaKey, isMale);
        if (audio) return audio;
      } catch {
        // Fallback gracefully
      }
    }

    if (deepgramKey) {
      try {
        const auraVoice = isMale ? 'aura-orion-en' : 'aura-asteria-en';
        const audio = await synthesizeDeepgram(dto.text, auraVoice, deepgramKey);
        if (audio) return audio;
      } catch {
        // Fallback gracefully
      }
    }

    if (elevenKey) {
      try {
        const elevenFallback = isMale ? 'pNInz6obpgDQGcFmaJgB' : '21m00Tcm4TlvDq8ikWAM';
        const audio = await synthesizeElevenLabs(dto.text, elevenFallback, elevenKey, isMale);
        if (audio) return audio;
      } catch {
        // Fallback gracefully
      }
    }

    // 9. Provider instance previewAudio fallback
    const provider = getVoiceAgentProvider(platform, { apiKey });
    try {
      const result = await provider.previewAudio(dto.text, dto.voiceId, {
        apiKey,
      });

      if (result.audioBuffer && result.audioBuffer.length > 500) {
        return result;
      }

      return {
        audioBuffer: Buffer.alloc(0),
        contentType: 'audio/mpeg',
      };
    } catch (err: any) {
      this.logger.warn(`TTS audio synthesis fallback triggered: ${err?.message}`);
      return {
        audioBuffer: Buffer.alloc(0),
        contentType: 'audio/mpeg',
      };
    }
  }
}
