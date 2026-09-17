"use client";

import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Radio, CheckCircle2, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { VOICE_AGENT_PLATFORMS } from "@brokeros/constants";
import { Badge } from "@/components/ui/Badge";
import {
  VoiceScriptEditor,
  StudioRetellSettings,
  StudioSarvamSettings,
} from "../components/composer";
import { VapiAssistantStudio } from "../components/composer/VapiAssistantStudio";
import { RetellAssistantStudio } from "../components/composer/RetellAssistantStudio";
import { ElevenLabsAssistantStudio } from "../components/composer/ElevenLabsAssistantStudio";
import type { VoiceAgentIntegrationRecord, CsvLeadRow } from "@/features/marketing/types";

export interface VoiceStep4AgentComposerProps {
  formData: {
    agentPlatformId?: string;
    telephonyId?: string;
    callerIdNumber?: string;
    assistantId?: string;
    assistantName?: string;
    modelProvider?: string;
    llmModel: string;
    voiceProvider: string;
    voiceId: string;
    voiceName: string;
    scriptPrompt: string;
    firstMessage?: string;
    transcriberProvider?: string;
    transcriberModel?: string;
    transcriberLanguage?: string;
    maxTurnSilenceMs?: number;
    voiceSpeed?: number;
    voiceStability?: number;
    voiceSimilarityBoost?: number;
    firstMessageMode?: string;
    voicemailDetection?: string;
    voicemailMessage?: string;
    backgroundSound?: string;
    backgroundVolume?: number;
    maxDurationSeconds?: number;
    silenceTimeoutSeconds?: number;
    backchannelingEnabled?: boolean;
    backgroundDenoisingEnabled?: boolean;
    temperature?: number;
    maxTokens?: number;
    // Retell Specific Parameters
    retellVoiceModel?: string;
    retellEmotion?: string;
    enableExpressiveMode?: boolean;
    retellAmbientSound?: string;
    retellLanguage?: string;
    retellBackchannel?: boolean;
    retellReminderMs?: number;
    // ElevenLabs Specific Parameters
    ttsModel?: string;
    elevenLanguage?: string;
    turnTimeout?: number;
    turnEagerness?: string;
    silenceEndCallTimeout?: number;
    speculativeTurn?: boolean;
    asrQuality?: string;
    asrProvider?: string;
    asrKeywords?: string[];
    [key: string]: any;
  };
  onChange: (fields: Record<string, any>) => void;
  agentIntegrations?: VoiceAgentIntegrationRecord[];
  telephonyIntegrations?: Array<{ id: string; name: string; provider: string; fromNumbers?: string[] }>;
  csvRecipients?: CsvLeadRow[];
  selectedProject?: { id: string; name: string; city?: string };
  apiBaseUrl?: string;
  onBack?: () => void;
  onNext?: () => void;
}

export function VoiceStep4AgentComposer({
  formData,
  onChange,
  agentIntegrations = [],
  telephonyIntegrations = [],
  csvRecipients = [],
  selectedProject,
  apiBaseUrl = "",
  onBack,
  onNext,
}: VoiceStep4AgentComposerProps) {
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  // Detect which platform is currently selected
  const selectedIntegration = agentIntegrations.find((a) => a.id === formData.agentPlatformId);
  const currentPlatform = selectedIntegration?.platform || (agentIntegrations[0]?.platform ?? "VAPI");

  const isNextDisabled = !formData.scriptPrompt?.trim() && !formData.assistantId;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <h2 className="text-base font-black tracking-tight text-[var(--text-primary)]">
          Step 4: AI Voice Persona &amp; Script Composer
        </h2>
        <p className="text-xs font-medium text-[var(--text-tertiary)] mt-0.5">
          Select your AI voice platform, configure voice persona, system prompt, and speech behavior.
        </p>
      </div>

      {/* ── Platform Selector ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-[var(--text-primary)]">
            Active AI Voice Platform <span className="text-rose-500">*</span>
          </label>
          <Link
            href="/dashboard/marketing/voice/settings"
            className="text-[11px] font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            <span>Connect New Platform</span>
          </Link>
        </div>

        {agentIntegrations.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <AlertCircle className="w-6 h-6 mx-auto mb-1.5 text-slate-400" />
            <p className="text-xs font-bold text-slate-700">No AI Platforms Connected</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Connect Vapi, Retell, or Sarvam keys in Voice Settings to continue.
            </p>
            <Link href="/dashboard/marketing/voice/settings">
              <Button size="sm" variant="outline" className="mt-3 text-xs">
                Open Voice Settings
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {agentIntegrations.map((agent) => {
              const isSelected = formData.agentPlatformId === agent.id;
              const platformInfo = (VOICE_AGENT_PLATFORMS as any)[agent.platform] || {
                name: agent.platform,
                badge: "Voice Engine",
              };
              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => onChange({ agentPlatformId: agent.id })}
                  className={`p-4 rounded-2xl border text-left transition-all relative ${isSelected
                    ? "border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20"
                    : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs"
                    }`}
                >
                  {isSelected && (
                    <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-indigo-600" />
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Radio className="w-4 h-4" />
                    </div>
                    <Badge variant="default" className="text-[9px]">
                      {platformInfo.badge || agent.platform}
                    </Badge>
                  </div>
                  <h4 className="text-xs font-extrabold text-[var(--text-primary)]">{agent.name}</h4>
                  <p className="text-[10px] text-purple-600 font-bold uppercase mt-0.5">
                    {agent.platform} Engine
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Per-Platform Studio ── */}
      {currentPlatform === "VAPI" && (
        <VapiAssistantStudio
          formData={formData}
          onChange={onChange}
          agentIntegrations={agentIntegrations}
          telephonyIntegrations={telephonyIntegrations}
          selectedProject={selectedProject}
          apiBaseUrl={apiBaseUrl}
        />
      )}

      {currentPlatform === "RETELL" && (
        <RetellAssistantStudio
          formData={formData}
          onChange={onChange}
          agentIntegrations={agentIntegrations}
          telephonyIntegrations={telephonyIntegrations}
          selectedProject={selectedProject}
          apiBaseUrl={apiBaseUrl}
        />
      )}

      {currentPlatform === "ELEVENLABS" && (
        <ElevenLabsAssistantStudio
          formData={formData}
          onChange={onChange}
          agentIntegrations={agentIntegrations}
          telephonyIntegrations={telephonyIntegrations}
          selectedProject={selectedProject}
          apiBaseUrl={apiBaseUrl}
        />
      )}

      {currentPlatform === "SARVAM" && (
        <StudioSarvamSettings
          voiceSpeed={formData.voiceSpeed}
          maxDurationSeconds={formData.maxDurationSeconds}
          onChange={onChange}
        />
      )}

      {/* Fallback: unknown platform — show generic script + retell settings */}
      {currentPlatform !== "VAPI" && currentPlatform !== "RETELL" && currentPlatform !== "ELEVENLABS" && currentPlatform !== "SARVAM" && (
        <div className="space-y-4">
          <VoiceScriptEditor
            scriptPrompt={formData.scriptPrompt}
            firstMessage={formData.firstMessage || ""}
            onSpeakCustomText={() => { }}
            onChange={(fields) => onChange(fields)}
          />
          <StudioRetellSettings
            retellVoiceModel={formData.retellVoiceModel}
            retellEmotion={formData.retellEmotion}
            retellLanguage={formData.retellLanguage}
            voiceSpeed={formData.voiceSpeed}
            retellAmbientSound={formData.retellAmbientSound}
            retellBackchannel={formData.retellBackchannel}
            retellReminderMs={formData.retellReminderMs}
            maxDurationSeconds={formData.maxDurationSeconds}
            onChange={onChange}
          />
        </div>
      )}

      {/* ── Navigation Footer ── */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="gap-2 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Telephony Carrier</span>
        </Button>

        <Button
          type="button"
          onClick={onNext}
          disabled={isNextDisabled}
          className="gap-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
        >
          <span>Continue to Pre-Flight Review</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
