"use client";

import React, { useState, useRef, useEffect } from "react";
import { Volume2, Sparkles, Brain, ArrowLeft, ArrowRight } from "lucide-react";
import { normalizeVoiceLeadVariables, interpolateVoiceTemplate } from "@brokeros/constants";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { VoiceModelSelector } from "../components/VoiceModelSelector";
import { VoicePickerModal } from "../components/VoicePickerModal";
import { InBrowserAudioPlayer } from "../components/InBrowserAudioPlayer";
import {
  AgentPlatformSelector,
  StudioVapiSettings,
  StudioRetellSettings,
  StudioSarvamSettings,
  VoiceScriptEditor,
} from "../components/composer";
import type { VoiceAgentIntegrationRecord, CsvLeadRow } from "@/features/marketing/types";

export interface VoiceStep4AgentComposerProps {
  formData: {
    agentPlatformId?: string;
    llmModel: string;
    voiceProvider: string;
    voiceId: string;
    voiceName: string;
    scriptPrompt: string;
    firstMessage?: string;
    transcriberModel?: string;
    transcriberLanguage?: string;
    maxTurnSilenceMs?: number;
    voiceSpeed?: number;
    firstMessageMode?: "assistant-speaks-first" | "assistant-waits-for-user";
    voicemailDetection?: "off" | "machine_detection";
    backgroundSound?: "off" | "office";
    maxDurationSeconds?: number;
    // Retell Specific Parameters
    retellVoiceModel?: string;
    retellEmotion?: string;
    enableExpressiveMode?: boolean;
    retellAmbientSound?: string;
    retellLanguage?: string;
    retellBackchannel?: boolean;
    retellReminderMs?: number;
  };
  onChange: (fields: Partial<VoiceStep4AgentComposerProps["formData"]>) => void;
  agentIntegrations?: VoiceAgentIntegrationRecord[];
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
  csvRecipients = [],
  selectedProject,
  apiBaseUrl = "",
  onBack,
  onNext,
}: VoiceStep4AgentComposerProps) {
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [dynamicModels, setDynamicModels] = useState<any[]>([]);
  const [dynamicVoices, setDynamicVoices] = useState<any[]>([]);
  const [dynamicAssistants, setDynamicAssistants] = useState<any[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isSpeakingCustom, setIsSpeakingCustom] = useState<"first_message" | "prompt" | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Dynamic Variable Interpolation from 1st Lead / Project
  const firstLead = csvRecipients?.[0];
  const dynamicVars = normalizeVoiceLeadVariables(
    firstLead,
    selectedProject
      ? {
        name: selectedProject.name,
        city: selectedProject.city || undefined,
      }
      : undefined,
  );

  const sampleLead = {
    firstName: dynamicVars["lead.firstName"],
    fullName: dynamicVars["lead.fullName"],
    budget: dynamicVars["lead.budget"],
  };
  const sampleProject = selectedProject || {
    name: dynamicVars["project.name"],
    city: dynamicVars["project.city"],
  };

  const interpolateVariables = (template: string) => {
    return interpolateVoiceTemplate(template, dynamicVars);
  };

  const selectedIntegration = agentIntegrations.find((a) => a.id === formData.agentPlatformId);
  const currentPlatform = selectedIntegration?.platform || "VAPI";

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Fetch Live Models, Voices, and Assistants for the active AI platform
  useEffect(() => {
    async function loadCatalog() {
      try {
        setIsLoadingCatalog(true);
        const endpoint = formData.agentPlatformId
          ? `${apiBaseUrl}/api/marketing/voice/integrations/agents/${formData.agentPlatformId}/catalog`
          : `${apiBaseUrl}/api/marketing/voice/integrations/catalog/${currentPlatform}`;

        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          if (data.assistants && Array.isArray(data.assistants)) {
            setDynamicAssistants(data.assistants);
          }
          if (data.models && Array.isArray(data.models)) {
            setDynamicModels(data.models);
            if (!data.models.some((m: any) => m.id === formData.llmModel)) {
              onChange({ llmModel: data.models[0]?.id || "" });
            }
          }
          if (data.voices && Array.isArray(data.voices)) {
            setDynamicVoices(data.voices);
            if (!data.voices.some((v: any) => v.id === formData.voiceId)) {
              onChange({
                voiceId: data.voices[0]?.id || "",
                voiceName: data.voices[0]?.name || "",
                voiceProvider: data.voices[0]?.provider || "",
              });
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch live AI platform catalog", err);
      } finally {
        setIsLoadingCatalog(false);
      }
    }

    loadCatalog();
  }, [formData.agentPlatformId, currentPlatform, apiBaseUrl]);

  const applyWorkspaceAssistant = (asst: any) => {
    if (currentPlatform === "RETELL") {
      onChange({
        llmModel: asst.id,
        voiceId: asst.voice?.voiceId || formData.voiceId,
        voiceName: `${asst.name} (${asst.voice?.voiceId || "Voice"})`,
        voiceProvider: "Retell",
        retellVoiceModel: asst.voice?.model || "eleven_flash_v2_5",
        retellEmotion: asst.voice?.emotion || "calm",
        retellAmbientSound: asst.ambientSound || "call-center",
        retellLanguage: asst.language || "hi-IN",
        voiceSpeed: asst.voice?.speed ?? formData.voiceSpeed,
        retellBackchannel: asst.enableBackchannel !== false,
        retellReminderMs: asst.reminderTriggerMs || 10000,
        maxDurationSeconds: asst.maxCallDurationMs
          ? Math.round(asst.maxCallDurationMs / 1000)
          : formData.maxDurationSeconds,
      });
    } else {
      onChange({
        llmModel: asst.model?.model || formData.llmModel,
        voiceId: asst.voice?.voiceId || formData.voiceId,
        voiceName: `${asst.name} Voice`,
        voiceProvider: asst.voice?.provider || formData.voiceProvider,
        scriptPrompt: asst.model?.systemPrompt || formData.scriptPrompt,
        firstMessage: asst.firstMessage || formData.firstMessage,
        voiceSpeed: asst.voice?.speed ?? formData.voiceSpeed,
        transcriberModel: asst.transcriber?.model || "nova-3",
        transcriberLanguage: asst.transcriber?.language || "en",
        maxTurnSilenceMs: asst.transcriber?.maxTurnSilence || 400,
        backgroundSound: asst.backgroundSound || "off",
        voicemailDetection: asst.voicemailDetection || "off",
        maxDurationSeconds: asst.maxDurationSeconds || 600,
        firstMessageMode: asst.firstMessageMode || "assistant-speaks-first",
      });
    }
  };

  const speakCustomText = async (textToSpeak: string, mode: "first_message" | "prompt") => {
    if (typeof window === "undefined") return;

    if (isSpeakingCustom) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        currentAudioRef.current = null;
      }
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      setIsSpeakingCustom(null);
      return;
    }

    const interpolated = interpolateVariables(
      (textToSpeak || "Hello! How may I assist you with your luxury property search today?").trim(),
    );

    const resolvedBase =
      apiBaseUrl && apiBaseUrl.trim().length > 0
        ? apiBaseUrl
        : typeof window !== "undefined"
          ? process.env.NEXT_PUBLIC_API_URL || "/api/proxy"
          : "/api/proxy";
    const previewEndpoint = `${resolvedBase.replace(/\/$/, "")}/api/marketing/voice/audio/preview`;

    try {
      setIsSynthesizing(true);
      const res = await fetch(previewEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: interpolated,
          voiceId: formData.voiceId,
          voiceProvider: formData.voiceProvider,
          agentPlatformId: formData.agentPlatformId,
        }),
      });

      if (res.ok) {
        const blob = await res.blob();
        if (blob.size > 500) {
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          currentAudioRef.current = audio;
          audio.playbackRate = formData.voiceSpeed || 1.0;
          setIsSynthesizing(false);
          setIsSpeakingCustom(mode);

          audio.onended = () => {
            setIsSpeakingCustom(null);
            currentAudioRef.current = null;
          };
          audio.onerror = () => {
            setIsSpeakingCustom(null);
            currentAudioRef.current = null;
          };

          await audio.play();
          return;
        }
      }
    } catch (e) {
      console.warn("Backend TTS preview fallback to client speech synthesis", e);
    } finally {
      setIsSynthesizing(false);
    }

    // Fallback to client-side speech synthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(interpolated);
      utterance.rate = formData.voiceSpeed || 1.0;
      utterance.onstart = () => setIsSpeakingCustom(mode);
      utterance.onend = () => setIsSpeakingCustom(null);
      utterance.onerror = () => setIsSpeakingCustom(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  const isNextDisabled = !formData.scriptPrompt?.trim() || !formData.llmModel || !formData.voiceId;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-black tracking-tight text-[var(--text-primary)]">
          Step 4: AI Voice Persona & Script Composer
        </h2>
        <p className="text-xs font-medium text-[var(--text-tertiary)] mt-0.5">
          Select your conversational engine, neural voice persona, and compose human-grade consultative sales scripts.
        </p>
      </div>

      {/* Section 1: Active AI Voice Platform */}
      <AgentPlatformSelector
        selectedPlatformId={formData.agentPlatformId}
        onSelectPlatform={(agentPlatformId) => onChange({ agentPlatformId })}
        agentIntegrations={agentIntegrations}
        dynamicAssistants={dynamicAssistants}
        onApplyAssistant={applyWorkspaceAssistant}
        currentPlatform={currentPlatform}
      />

      {/* Section 2: Conversational Reasoning Engine (LLM Model) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div>
          <label className="text-xs font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-indigo-600" />
            <span>
              Conversational Reasoning Engine (LLM Model) <span className="text-rose-500">*</span>
            </span>
          </label>
          <p className="text-[11px] font-medium text-[var(--text-tertiary)] mt-0.5">
            Select the active AI reasoning model for real-time dialogue, low latency, and turn-taking.
          </p>
        </div>

        <VoiceModelSelector
          selectedModel={formData.llmModel}
          models={dynamicModels}
          onSelectModel={(modelId) => onChange({ llmModel: modelId })}
          loading={isLoadingCatalog}
        />
      </div>

      {/* Section 2.5: Platform-Specific Cadence & Studio Settings */}
      {currentPlatform === "VAPI" && (
        <StudioVapiSettings
          transcriberModel={formData.transcriberModel}
          transcriberLanguage={formData.transcriberLanguage}
          voiceSpeed={formData.voiceSpeed}
          maxTurnSilenceMs={formData.maxTurnSilenceMs}
          backgroundSound={formData.backgroundSound}
          voicemailDetection={formData.voicemailDetection}
          maxDurationSeconds={formData.maxDurationSeconds}
          onChange={onChange}
        />
      )}

      {currentPlatform === "RETELL" && (
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
      )}

      {currentPlatform === "SARVAM" && (
        <StudioSarvamSettings
          voiceSpeed={formData.voiceSpeed}
          maxDurationSeconds={formData.maxDurationSeconds}
          onChange={onChange}
        />
      )}

      {/* Section 3: Synthetic Voice Persona & Audio Test */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label className="text-xs font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                Synthetic Voice Persona & Audio Test <span className="text-rose-500">*</span>
              </span>
            </label>
            <p className="text-[11px] font-medium text-[var(--text-tertiary)] mt-0.5">
              Choose the accent, gender, and speaking cadence for your conversational sales agent.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowVoiceModal(true)}
            className="text-xs font-bold gap-1.5 border-indigo-200 hover:bg-indigo-50 text-indigo-700 shadow-2xs self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Browse {dynamicVoices.length} Voices</span>
          </Button>
        </div>

        {/* Selected Voice Card & In-Browser Audio Player */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          <div
            onClick={() => setShowVoiceModal(true)}
            className="lg:col-span-5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between hover:bg-slate-100/80 transition-colors cursor-pointer shadow-2xs group"
          >
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-[var(--text-primary)] group-hover:text-indigo-600 transition-colors">
                  {formData.voiceName || "Select Voice Persona"}
                </span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 uppercase">
                  {formData.voiceProvider || "Voice"}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                ID: {formData.voiceId || "None"}
              </p>
            </div>

            <Badge variant="default" className="text-[10px] shrink-0">
              Change
            </Badge>
          </div>

          {/* Audio Player Preview */}
          <div className="lg:col-span-7 space-y-2">
            <InBrowserAudioPlayer
              text={interpolateVariables(
                formData.firstMessage ||
                formData.scriptPrompt ||
                "Hello! I am calling regarding your recent luxury real estate inquiry.",
              )}
              voiceId={formData.voiceId}
              voiceName={formData.voiceName}
              voiceProvider={formData.voiceProvider}
              voiceSpeed={formData.voiceSpeed ?? 1.0}
              gender={dynamicVoices.find((v) => v.id === formData.voiceId)?.gender}
              accent={dynamicVoices.find((v) => v.id === formData.voiceId)?.accent}
              agentPlatformId={formData.agentPlatformId}
              apiBaseUrl={apiBaseUrl}
            />
          </div>
        </div>
      </div>

      {/* Section 4: Opening Greeting & AI Script Composer */}
      <VoiceScriptEditor
        scriptPrompt={formData.scriptPrompt}
        firstMessage={formData.firstMessage}
        currentPlatform={currentPlatform}
        isSynthesizing={isSynthesizing}
        isSpeakingCustom={isSpeakingCustom}
        onSpeakCustomText={speakCustomText}
        onChange={onChange}
      />

      {/* Voice Picker Modal */}
      <VoicePickerModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        selectedVoiceId={formData.voiceId}
        voices={dynamicVoices}
        apiBaseUrl={apiBaseUrl}
        agentPlatformId={formData.agentPlatformId}
        onSelectVoice={(voice) => {
          onChange({
            voiceId: voice.id,
            voiceName: voice.name,
            voiceProvider: voice.provider,
          });
        }}
      />

      {/* Navigation Footer */}
      {(onBack || onNext) && (
        <div className="flex items-center justify-between pt-2">
          {onBack ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onBack}
              className="gap-2 text-xs font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </Button>
          ) : (
            <div />
          )}

          {onNext && (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={onNext}
              disabled={isNextDisabled}
              className="gap-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 shadow-sm"
            >
              <span>Continue to Review & Launch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
