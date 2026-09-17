"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles, Bot, Brain, Volume2, Mic, Sliders, PhoneCall, Save,
  CheckCircle2, AlertCircle, Loader2, Plus, RefreshCw, Zap,
  DollarSign, Search, X, Hash, Play, Pause,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CreateAgentModal } from "./CreateAgentModal";
import { DualModeTestCallModal } from "./DualModeTestCallModal";

// ── Constants ──────────────────────────────────────────────────────────────

const DEFAULT_RETELL_VOICES = [
  {
    id: "11labs-rachel",
    name: "Rachel (ElevenLabs)",
    gender: "Female",
    accent: "American Professional",
    provider: "ElevenLabs",
    previewText: "Hello! I am Rachel calling with an update on your luxury property inquiry.",
    description: "Warm, authentic narrative voice ideal for sales consultations.",
  },
  {
    id: "11labs-adam",
    name: "Adam (ElevenLabs)",
    gender: "Male",
    accent: "American Deep",
    provider: "ElevenLabs",
    previewText: "Good day. Presenting the exclusive penthouse collection at Signature Towers.",
    description: "Authoritative, confident tone for luxury real estate.",
  },
  {
    id: "11labs-viraj",
    name: "Viraj (ElevenLabs Indic)",
    gender: "Male",
    accent: "Indian English / Hindi",
    provider: "ElevenLabs",
    previewText: "Namaste! Main Skyline Realty team se call kar raha hoon.",
    description: "Warm Indic conversational tone with bilingual fluency.",
  },
  {
    id: "deepgram-asteria",
    name: "Asteria (Deepgram Aura)",
    gender: "Female",
    accent: "American Clear",
    provider: "Deepgram",
    previewText: "Hello, this is Asteria following up on your luxury real estate inquiry.",
    description: "Ultra fast sub-120ms telephony response speed.",
  },
  {
    id: "deepgram-orion",
    name: "Orion (Deepgram Aura)",
    gender: "Male",
    accent: "American Deep",
    provider: "Deepgram",
    previewText: "Good day! Let me guide you through the latest payment plans and inventory.",
    description: "Confident corporate tone for outbound qualification.",
  },
  {
    id: "retell-Cimo",
    name: "Cimo (Retell Native)",
    gender: "Female",
    accent: "American Casual",
    provider: "Retell",
    previewText: "Hi there! I have all the details on your selected unit.",
    description: "Friendly and modern real estate assistant.",
  },
];

// Models from Retell API docs (POST /create-retell-llm). Default: gpt-5.6-terra
const RETELL_LLM_MODELS: { id: string; label: string; provider: string; badge: string; group: string }[] = [
  // GPT-4.1
  { id: "gpt-4.1", label: "GPT-4.1", provider: "openai", badge: "Stable", group: "GPT-4.1" },
  { id: "gpt-4.1-mini", label: "GPT-4.1 Mini", provider: "openai", badge: "Fast", group: "GPT-4.1" },
  { id: "gpt-4.1-nano", label: "GPT-4.1 Nano", provider: "openai", badge: "Cheapest", group: "GPT-4.1" },
  // GPT-5
  { id: "gpt-5", label: "GPT-5", provider: "openai", badge: "Most Capable", group: "GPT-5" },
  { id: "gpt-5-mini", label: "GPT-5 Mini", provider: "openai", badge: "Balanced", group: "GPT-5" },
  { id: "gpt-5-nano", label: "GPT-5 Nano", provider: "openai", badge: "Ultra Fast", group: "GPT-5" },
  { id: "gpt-5.1", label: "GPT-5.1", provider: "openai", badge: "Updated", group: "GPT-5" },
  { id: "gpt-5.2", label: "GPT-5.2", provider: "openai", badge: "Updated", group: "GPT-5" },
  { id: "gpt-5.4", label: "GPT-5.4", provider: "openai", badge: "Advanced", group: "GPT-5" },
  { id: "gpt-5.4-mini", label: "GPT-5.4 Mini", provider: "openai", badge: "Fast", group: "GPT-5" },
  { id: "gpt-5.4-nano", label: "GPT-5.4 Nano", provider: "openai", badge: "Lightest", group: "GPT-5" },
  { id: "gpt-5.5", label: "GPT-5.5", provider: "openai", badge: "Latest Stable", group: "GPT-5" },
  { id: "gpt-5.6-terra", label: "GPT-5.6 Terra", provider: "openai", badge: "Retell Default ★", group: "GPT-5" },
  { id: "gpt-5.6-luna", label: "GPT-5.6 Luna", provider: "openai", badge: "Latest", group: "GPT-5" },
  // Claude
  { id: "claude-4.5-sonnet", label: "Claude 4.5 Sonnet", provider: "anthropic", badge: "Empathetic", group: "Claude" },
  { id: "claude-4.6-sonnet", label: "Claude 4.6 Sonnet", provider: "anthropic", badge: "Updated", group: "Claude" },
  { id: "claude-5-sonnet", label: "Claude 5 Sonnet", provider: "anthropic", badge: "Most Capable", group: "Claude" },
  { id: "claude-4.5-haiku", label: "Claude 4.5 Haiku", provider: "anthropic", badge: "Ultra Fast", group: "Claude" },
  // Gemini
  { id: "gemini-3.0-flash", label: "Gemini 3.0 Flash", provider: "google", badge: "Flash", group: "Gemini" },
  { id: "gemini-3.1-flash-lite", label: "Gemini 3.1 Flash Lite", provider: "google", badge: "Lightest", group: "Gemini" },
  { id: "gemini-3.5-flash", label: "Gemini 3.5 Flash", provider: "google", badge: "Multimodal", group: "Gemini" },
  { id: "gemini-3.5-flash-lite", label: "Gemini 3.5 Flash Lite", provider: "google", badge: "Lite", group: "Gemini" },
  { id: "gemini-3.6-flash", label: "Gemini 3.6 Flash", provider: "google", badge: "Updated", group: "Gemini" },
  { id: "gemini-3.7-flash", label: "Gemini 3.7 Flash", provider: "google", badge: "Latest", group: "Gemini" },
  { id: "gemini-3.8-flash", label: "Gemini 3.8 Flash", provider: "google", badge: "Newest", group: "Gemini" },
];

const RETELL_S2S_MODELS = [
  { id: 'gpt-realtime-2.1', label: 'GPT Realtime 2.1', badge: 'Latest · Recommended' },
  { id: 'gpt-realtime-2.1-mini', label: 'GPT Realtime 2.1 Mini', badge: 'Fast Realtime' },
  { id: 'gpt-realtime-2', label: 'GPT Realtime 2', badge: 'Stable' },
  { id: 'gpt-realtime-1.5', label: 'GPT Realtime 1.5', badge: 'Previous Gen' },
];

const RETELL_EMOTIONS = [
  { id: "calm", label: "Calm & Composed" },
  { id: "sympathetic", label: "Sympathetic & Empathetic" },
  { id: "happy", label: "Happy & Upbeat" },
  { id: "sad", label: "Sad" },
  { id: "angry", label: "Firm & Assertive" },
  { id: "fearful", label: "Cautious" },
  { id: "surprised", label: "Surprised & Engaged" },
];

const RETELL_AMBIENT = [
  { id: "call-center", label: "Call Center" },
  { id: "coffee-shop", label: "Coffee Shop" },
  { id: "convention-hall", label: "Convention Hall" },
  { id: "summer-outdoor", label: "Summer Outdoor" },
  { id: "mountain-outdoor", label: "Mountain Outdoor" },
  { id: "static-noise", label: "Static Noise" },
];

const RETELL_LANGUAGES = [
  { id: "hi-IN", label: "Hindi — hi-IN (India)" },
  { id: "en-IN", label: "English — en-IN (India Accent)" },
  { id: "en-US", label: "English — en-US (Global)" },
  { id: "en-GB", label: "English — en-GB (British)" },
  { id: "mr-IN", label: "Marathi — mr-IN" },
  { id: "ta-IN", label: "Tamil — ta-IN" },
  { id: "kn-IN", label: "Kannada — kn-IN" },
  { id: "es-ES", label: "Spanish — es-ES" },
  { id: "de-DE", label: "German — de-DE" },
  { id: "fr-FR", label: "French — fr-FR" },
  { id: "pt-BR", label: "Portuguese — pt-BR" },
  { id: "zh-CN", label: "Chinese — zh-CN" },
  { id: "ja-JP", label: "Japanese — ja-JP" },
];

const STT_MODES = [
  { id: "fast", label: "Fast (Recommended)", desc: "Optimised for low-latency real-time conversations" },
  { id: "accurate", label: "Accurate", desc: "Better for accents and technical vocabulary" },
  { id: "custom", label: "Custom Provider", desc: "Azure / Deepgram / AssemblyAI with custom endpointing" },
];

const CRM_TAGS = [
  { tag: "lead.firstName", label: "First Name" },
  { tag: "lead.fullName", label: "Full Name" },
  { tag: "project.name", label: "Project" },
  { tag: "project.city", label: "City" },
  { tag: "lead.budget", label: "Budget" },
];

// ── Types ──────────────────────────────────────────────────────────────────

export interface RetellAssistantStudioProps {
  formData: any;
  onChange: (fields: any) => void;
  agentIntegrations?: any[];
  telephonyIntegrations?: any[];
  selectedProject?: any;
  apiBaseUrl?: string;
}

// ── Component ───────────────────────────────────────────────────────────────

export function RetellAssistantStudio({
  formData,
  onChange,
  agentIntegrations = [],
  telephonyIntegrations = [],
  selectedProject,
  apiBaseUrl = "",
}: RetellAssistantStudioProps) {
  const [activeTab, setActiveTab] = useState<"script" | "engine" | "voice" | "stt" | "ambient">("script");

  // Agent management
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>(formData.assistantId || "");
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"synced" | "dirty" | "saving" | "error">("synced");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTestCallModalOpen, setIsTestCallModalOpen] = useState(false);

  // Voice Catalog & Audio Preview State
  const [availableVoices, setAvailableVoices] = useState<any[]>(DEFAULT_RETELL_VOICES);
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);
  const [voiceSearchQuery, setVoiceSearchQuery] = useState("");
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Retell integration record
  const retellIntegration =
    agentIntegrations.find((a) => a.platform === "RETELL" && a.id === formData.agentPlatformId) ||
    agentIntegrations.find((a) => a.platform === "RETELL") ||
    null;

  useEffect(() => {
    if (retellIntegration && formData.agentPlatformId !== retellIntegration.id) {
      onChange({ agentPlatformId: retellIntegration.id });
    }
  }, [retellIntegration?.id]);

  useEffect(() => {
    fetchAgents();
    fetchVoices();
  }, [retellIntegration?.id]);

  useEffect(() => { return () => { audioRef.current?.pause(); audioRef.current = null; }; }, []);

  // ── Fetch Voices Catalog ──
  const fetchVoices = async () => {
    if (!retellIntegration?.id) return;
    setIsLoadingVoices(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/marketing/voice/integrations/agents/${retellIntegration.id}/catalog`);
      if (res.ok) {
        const cat = await res.json();
        if (Array.isArray(cat.voices) && cat.voices.length > 0) {
          setAvailableVoices(cat.voices);
          if (!formData.voiceId) {
            onChange({ voiceId: cat.voices[0].id, voiceName: cat.voices[0].name });
          }
        }
      }
    } catch (e) {
      console.error("Failed to load Retell voices catalog", e);
    } finally {
      setIsLoadingVoices(false);
    }
  };

  // ── Audio Preview Handler ──
  const handlePlayPreview = async (voice: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === "undefined") return;

    if (playingVoiceId === voice.id) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      setPlayingVoiceId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    const sampleText =
      voice.previewText ||
      `Hello! I am ${voice.name}. How may I assist your luxury property inquiry today?`;

    const fallbackSpeech = () => {
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(sampleText);
        utterance.onstart = () => setPlayingVoiceId(voice.id);
        utterance.onend = () => setPlayingVoiceId(null);
        utterance.onerror = () => setPlayingVoiceId(null);
        window.speechSynthesis.speak(utterance);
      } else {
        setPlayingVoiceId(null);
      }
    };

    if (voice.previewUrl && voice.previewUrl.startsWith("http")) {
      try {
        const audio = new Audio(voice.previewUrl);
        audioRef.current = audio;
        setPlayingVoiceId(voice.id);
        audio.onended = () => {
          setPlayingVoiceId(null);
          audioRef.current = null;
        };
        audio.onerror = () => {
          fallbackSpeech();
        };
        await audio.play();
        return;
      } catch {
        fallbackSpeech();
        return;
      }
    }

    fallbackSpeech();
  };

  // ── Fetch agents ──
  const fetchAgents = async () => {
    if (!retellIntegration?.id) return;
    setIsLoadingAgents(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/marketing/voice/integrations/agents/${retellIntegration.id}/assistants`);
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list)) {
          setAgents(list);
          if (!selectedAgentId && list.length > 0) applyAgent(list[0]);
        }
      }
    } catch (e) { console.error("Failed to load Retell agents", e); }
    finally { setIsLoadingAgents(false); }
  };

  // ── Apply agent config to form ──
  const applyAgent = (agent: any) => {
    if (!agent) return;
    const id = agent.id || agent.agent_id;
    setSelectedAgentId(id);
    onChange({
      assistantId: id,
      assistantName: agent.name || agent.agent_name || "Retell Agent",
      voiceId: agent.voice?.voiceId || agent.voiceId || formData.voiceId,
      retellVoiceModel: agent.voice?.model || formData.retellVoiceModel,
      voiceSpeed: agent.voice?.speed ?? formData.voiceSpeed,
      retellEmotion: agent.voice?.emotion || formData.retellEmotion,
      retellLanguage: agent.language || formData.retellLanguage,
      retellAmbientSound: agent.ambientSound || formData.retellAmbientSound,
      retellBackchannel: agent.enableBackchannel ?? formData.retellBackchannel,
      retellReminderMs: agent.reminderTriggerMs ?? formData.retellReminderMs,
      maxDurationSeconds: agent.maxCallDurationMs ? Math.round(agent.maxCallDurationMs / 1000) : formData.maxDurationSeconds,
      ...(agent.scriptPrompt ? { scriptPrompt: agent.scriptPrompt } : {}),
      ...(agent.firstMessage ? { firstMessage: agent.firstMessage } : {}),
      ...(agent.llmModel ? { llmModel: agent.llmModel } : {}),
    });
    setSyncStatus("synced");
  };

  // ── Save & Sync ──
  const handleSaveAndSync = async () => {
    if (!retellIntegration?.id) return;
    const targetId = selectedAgentId || formData.assistantId || "default";
    setIsSaving(true); setSyncStatus("saving"); setStatusMessage("Pushing config to Retell...");
    try {
      const res = await fetch(
        `${apiBaseUrl}/api/marketing/voice/integrations/agents/${retellIntegration.id}/assistants/${targetId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.assistantName,
            voiceId: formData.voiceId,
            retellVoiceModel: formData.retellVoiceModel,
            voiceSpeed: formData.voiceSpeed,
            retellEmotion: formData.retellEmotion,
            retellLanguage: formData.retellLanguage,
            retellAmbientSound: formData.retellAmbientSound,
            retellBackchannel: formData.retellBackchannel,
            retellReminderMs: formData.retellReminderMs,
            maxDurationSeconds: formData.maxDurationSeconds,
            scriptPrompt: formData.scriptPrompt,
            firstMessage: formData.firstMessage,
            llmModel: formData.llmModel,
          }),
        }
      );
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.message || "Retell sync failed"); }
      const syncedAgent = await res.json().catch(() => null);
      if (syncedAgent && (syncedAgent.agent_id || syncedAgent.id)) {
        const newId = syncedAgent.agent_id || syncedAgent.id;
        setSelectedAgentId(newId);
        onChange({ assistantId: newId });
      }
      setSyncStatus("synced");
      setStatusMessage("Agent synced with Retell.");
      setTimeout(() => setStatusMessage(null), 4000);
      fetchAgents();
    } catch (err: any) {
      setSyncStatus("error");
      setStatusMessage(err?.message || "Sync error");
    } finally { setIsSaving(false); }
  };

  const mark = () => setSyncStatus("dirty");
  const insertTag = (tag: string, field: "scriptPrompt" | "firstMessage") => {
    const cur = field === "scriptPrompt" ? (formData.scriptPrompt || "") : (formData.firstMessage || "");
    onChange({ [field]: `${cur}{{${tag}}}` }); mark();
  };

  // ── Derived values ──
  const agentName = formData.assistantName || "BrokerOS Retell Sales AI";
  const scriptPrompt = formData.scriptPrompt || "";
  const firstMessage = formData.firstMessage || "";
  const llmModel = formData.llmModel || "gpt-5.6-terra";
  const useS2sMode = Boolean(formData.useS2sMode);
  const s2sModel = formData.s2sModel || "gpt-realtime-2.1";
  const modelTemperature = formData.modelTemperature ?? formData.temperature ?? 0.0;
  const modelHighPriority = Boolean(formData.modelHighPriority);
  const voiceId = formData.voiceId || "11labs-rachel";
  const voiceSpeed = formData.voiceSpeed ?? 1.0;
  const voiceTemperature = formData.voiceTemperature ?? 1.0;
  const retellVoiceModel = formData.retellVoiceModel || "eleven_flash_v2_5";
  const retellEmotion = formData.retellEmotion || "calm";
  const retellLanguage = formData.retellLanguage || "en-IN";
  const retellAmbientSound = formData.retellAmbientSound || "";
  const retellBackchannel = formData.retellBackchannel ?? true;
  const retellReminderMs = formData.retellReminderMs ?? 10000;
  const maxDurationSeconds = formData.maxDurationSeconds ?? 600;
  const enableExpressiveMode = Boolean(formData.enableExpressiveMode);
  const enableDynamicResponsiveness = Boolean(formData.enableDynamicResponsiveness);
  const enableDynamicVoiceSpeed = Boolean(formData.enableDynamicVoiceSpeed);
  const responsiveness = formData.responsiveness ?? 1.0;
  const interruptionSensitivity = formData.interruptionSensitivity ?? 1.0;
  const sttMode = formData.sttMode || "fast";
  const vocabSpecialization = formData.vocabSpecialization || "general";
  const denoisingMode = formData.denoisingMode || "noise-cancellation";
  const ambientVolume = formData.ambientSoundVolume ?? formData.ambientVolume ?? 0.8;
  const endCallAfterSilenceMs = formData.endCallAfterSilenceMs ?? 600000;
  const voicemailAction = formData.voicemailAction || "hangup";
  const voicemailMessage = formData.voicemailMessage || "";
  const beginMessageDelayMs = formData.beginMessageDelayMs ?? 1000;

  // Cost estimate (rough per-min)
  const ttsPerMin = retellVoiceModel.startsWith("eleven") ? 0.030
    : retellVoiceModel.startsWith("sonic") ? 0.020
      : retellVoiceModel.startsWith("speech") ? 0.015
        : 0.020;
  const totalCostPerMin = (0.005 + 0.002 + ttsPerMin).toFixed(3);
  const latencyMs = sttMode === "fast" ? "700" : "1100";

  return (
    <div className="space-y-6">

      {/* ── TOP HUD ── */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold uppercase tracking-wider">Retell AI Agent</span>
            {syncStatus === "synced" && <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> Synced</span>}
            {syncStatus === "dirty" && <span className="flex items-center gap-1 text-[11px] text-amber-600 font-bold"><AlertCircle className="w-3.5 h-3.5" /> Unsaved Changes</span>}
            {syncStatus === "error" && <span className="flex items-center gap-1 text-[11px] text-rose-600 font-bold"><AlertCircle className="w-3.5 h-3.5" /> Sync Failed</span>}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedAgentId}
              onChange={(e) => { const f = agents.find((a) => (a.id || a.agent_id) === e.target.value); if (f) applyAgent(f); }}
              disabled={isLoadingAgents || agents.length === 0}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 max-w-sm flex-1 shadow-xs"
            >
              {agents.length === 0
                ? <option value="">{isLoadingAgents ? "Loading Retell Agents..." : "No Agents — Create One Below"}</option>
                : agents.map((a) => { const id = a.id || a.agent_id; return <option key={id} value={id}>{a.name || a.agent_name} ({id.slice(0, 10)}…)</option>; })}
            </select>
            <Button type="button" onClick={fetchAgents} disabled={isLoadingAgents} size="sm" variant="outline" className="h-9 w-9 p-0 rounded-xl border-slate-200" title="Refresh">
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAgents ? "animate-spin" : ""}`} />
            </Button>
            <Button type="button" onClick={() => setIsCreateModalOpen(true)} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 h-9 px-3.5 rounded-xl shadow-xs shrink-0">
              <Plus className="w-3.5 h-3.5" /><span>New Agent</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-5">
          <div className="bg-slate-50/80 border border-slate-200/80 p-3 rounded-xl min-w-[120px]">
            <div className="flex items-center gap-1 text-slate-500 text-[10px] font-extrabold uppercase"><DollarSign className="w-3.5 h-3.5 text-emerald-600" /><span>Est. Cost</span></div>
            <p className="text-base font-black text-slate-900 mt-0.5">${totalCostPerMin}<span className="text-[10px] text-slate-400 font-medium">/min</span></p>
            <p className="text-[9px] text-slate-400 font-medium">STT + LLM + TTS + Retell</p>
          </div>
          <div className="bg-slate-50/80 border border-slate-200/80 p-3 rounded-xl min-w-[120px]">
            <div className="flex items-center gap-1 text-slate-500 text-[10px] font-extrabold uppercase"><Zap className="w-3.5 h-3.5 text-amber-500" /><span>Turn Latency</span></div>
            <p className="text-base font-black text-slate-900 mt-0.5">~{latencyMs}<span className="text-[10px] text-slate-400 font-medium">ms</span></p>
            <p className="text-[9px] text-slate-400 font-medium">First-token response</p>
          </div>
          <div className="flex flex-col gap-1.5 shrink-0">
            <Button type="button" onClick={handleSaveAndSync} disabled={isSaving || !selectedAgentId} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 rounded-xl h-8.5 shadow-xs">
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save &amp; Sync</span>
            </Button>
            <Button type="button" onClick={() => setIsTestCallModalOpen(true)} variant="outline" size="sm" className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs gap-1.5 rounded-xl h-8.5 shadow-xs cursor-pointer">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" /><span>Live Test Call</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ── No Retell Integration Warning ── */}
      {!retellIntegration && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900">No Retell Integration Connected</p>
              <p className="text-[11px] text-amber-700 font-medium">Connect your Retell API Key in Voice Settings to load and sync live agents.</p>
            </div>
          </div>
          <Link href="/dashboard/marketing/voice/settings" className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 transition-colors shadow-xs">Connect Retell Key</Link>
        </div>
      )}

      {/* ── Toast ── */}
      {statusMessage && (
        <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${syncStatus === "error" ? "bg-rose-50 border border-rose-200 text-rose-800" : "bg-emerald-50 border border-emerald-200 text-emerald-800"}`}>
          {syncStatus === "error" ? <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          <span>{statusMessage}</span>
        </div>
      )}

      {/* ── Tab Navigation ── */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200 overflow-x-auto">
        {([
          { id: "script", label: "Dialogue & Prompt", icon: Sparkles },
          { id: "engine", label: "Response Engine", icon: Brain },
          { id: "voice", label: "Voice Persona", icon: Volume2 },
          { id: "stt", label: "STT & Behavior", icon: Mic },
          { id: "ambient", label: "Ambient & Advanced", icon: Sliders },
        ] as const).map((tab) => {
          const Icon = tab.icon; const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${isActive ? "bg-white text-emerald-700 shadow-xs border border-slate-200/80" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"}`}>
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-600" : "text-slate-400"}`} /><span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: DIALOGUE & SYSTEM PROMPT ── */}
      {activeTab === "script" && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Agent Name</label>
            <input type="text" value={agentName} onChange={(e) => { onChange({ assistantName: e.target.value }); mark(); }} placeholder="e.g. Luxury Sales Concierge – Retell" className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all text-slate-900" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">System Prompt <span className="text-slate-400 font-medium">(general_prompt)</span></label>
              <span className="text-[10px] text-slate-400 font-medium">{scriptPrompt.length} chars</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {CRM_TAGS.map((t) => (
                <button key={t.tag} type="button" onClick={() => insertTag(t.tag, "scriptPrompt")} className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold hover:bg-emerald-100 transition-colors">+ {t.label}</button>
              ))}
            </div>
            <textarea value={scriptPrompt} onChange={(e) => { onChange({ scriptPrompt: e.target.value }); mark(); }} rows={8} placeholder="You are a luxury real estate advisor representing {{project.name}} in {{project.city}}..." className="w-full px-3.5 py-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all text-slate-900 resize-none leading-relaxed" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">Begin Message <span className="text-slate-400 font-medium">(agent speaks first)</span></label>
              <span className="text-[10px] text-slate-400 font-medium">{firstMessage.length} chars</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {CRM_TAGS.slice(0, 3).map((t) => (
                <button key={t.tag} type="button" onClick={() => insertTag(t.tag, "firstMessage")} className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold hover:bg-emerald-100 transition-colors">+ {t.label}</button>
              ))}
            </div>
            <textarea value={firstMessage} onChange={(e) => { onChange({ firstMessage: e.target.value }); mark(); }} rows={3} placeholder="Hello! Calling from BrokerOS regarding {{project.name}}. Am I speaking with {{lead.firstName}}?" className="w-full px-3.5 py-3 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all text-slate-900 resize-none" />
            <p className="text-[10px] text-slate-400 font-medium">Leave empty for agent to wait for user to speak first.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Begin Message Delay</label>
            <select value={beginMessageDelayMs} onChange={(e) => { onChange({ beginMessageDelayMs: parseInt(e.target.value) }); mark(); }} className="w-full sm:w-48 px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20">
              <option value={0}>Immediate (0ms)</option>
              <option value={500}>0.5 seconds</option>
              <option value={1000}>1 second (Default)</option>
              <option value={2000}>2 seconds</option>
              <option value={3000}>3 seconds</option>
              <option value={5000}>5 seconds (Max)</option>
            </select>
          </div>
        </div>
      )}

      {/* ── TAB 2: RESPONSE ENGINE ── */}
      {activeTab === "engine" && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5"><Brain className="w-3.5 h-3.5 text-emerald-600" /> LLM Model <span className="text-slate-400 font-medium">(Retell /create-retell-llm)</span></h4>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Retell auto-provisions a Retell LLM with your system prompt on agent creation. Default: <code className="text-emerald-700 font-mono">gpt-5.6-terra</code>.</p>
          </div>

          {/* S2S mode toggle */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-800">Speech-to-Speech Mode (S2S)</p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">Uses GPT Realtime — bypasses TTS entirely for ultra-low latency. When ON, voice model is ignored.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const nextVal = !useS2sMode;
                onChange({ useS2sMode: nextVal });
                mark();
              }}
              className={`shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${useS2sMode ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
            >
              {useS2sMode ? "S2S On" : "S2S Off"}
            </button>
          </div>

          {/* S2S model picker */}
          {useS2sMode && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800">GPT Realtime Model (s2s_model)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {RETELL_S2S_MODELS.map((m) => {
                  const isSel = s2sModel === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        onChange({ s2sModel: m.id });
                        mark();
                      }}
                      className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${isSel ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20" : "border-slate-200 bg-slate-50/50 hover:bg-slate-100"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">{m.label}</span>
                        {isSel && <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 ml-1" />}
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600">{m.badge}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Standard LLM picker — grouped by provider */}
          {!useS2sMode && (
            <div className="space-y-4">
              {(["GPT-4.1", "GPT-5", "Claude", "Gemini"] as const).map((group) => {
                const groupModels = RETELL_LLM_MODELS.filter((m) => m.group === group);
                return (
                  <div key={group} className="space-y-1.5">
                    <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">{group}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {groupModels.map((m) => {
                        const isSel = llmModel === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              onChange({ llmModel: m.id, modelProvider: m.provider });
                              mark();
                            }}
                            className={`p-2.5 text-left rounded-xl border transition-all cursor-pointer ${isSel ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20" : "border-slate-200 bg-slate-50/50 hover:bg-slate-100"
                              }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[11px] font-bold text-slate-900 truncate">{m.label}</span>
                              {isSel && <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />}
                            </div>
                            <span className="text-[9px] font-bold text-emerald-600">{m.badge}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Model Temperature */}
          {!useS2sMode && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-extrabold text-slate-700">
                  Model Temperature <span className="text-slate-400 font-normal">(model_temperature)</span>
                </label>
                <span className="text-[10px] font-mono font-bold text-emerald-600">
                  {modelTemperature.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={modelTemperature}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onChange({ modelTemperature: val, temperature: val });
                  mark();
                }}
                className="w-full h-2 bg-slate-100 rounded-lg accent-emerald-600 cursor-pointer mt-1"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                <span>0 Deterministic (Recommended for tools)</span>
                <span>1 Creative</span>
              </div>
            </div>
          )}

          {/* High Priority toggle */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-800">
                High Priority Pool <span className="text-slate-400 font-normal">(model_high_priority)</span>
              </p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                Dedicated resource for lower & more consistent latency. Comes at higher cost.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onChange({ modelHighPriority: !modelHighPriority });
                mark();
              }}
              className={`shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${modelHighPriority ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
            >
              {modelHighPriority ? "Enabled" : "Disabled"}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <p className="text-[11px] font-bold text-blue-900">How Retell Response Engines work</p>
            <ul className="mt-1.5 space-y-1 text-[10px] text-blue-700 font-medium list-disc list-inside">
              <li><strong>Retell LLM</strong> — Prompt-driven agent. Auto-provisioned with your system prompt on Create Agent.</li>
              <li><strong>S2S (Speech-to-Speech)</strong> — GPT Realtime API. Ultra-low latency, no TTS step. Use for fastest response.</li>
              <li><strong>Custom LLM</strong> — Your own LLM via WebSocket URL (configure in Retell dashboard).</li>
            </ul>
          </div>
        </div>
      )}

      {/* ── TAB 3: VOICE PERSONA ── */}
      {activeTab === "voice" && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          {/* Voice Personas with Search, Refresh & Inline Audio Preview */}
          {(() => {
            const filteredVoices = availableVoices.filter((v: any) => {
              if (!voiceSearchQuery.trim()) return true;
              const q = voiceSearchQuery.toLowerCase();
              return (
                (v.name && v.name.toLowerCase().includes(q)) ||
                (v.accent && v.accent.toLowerCase().includes(q)) ||
                (v.gender && v.gender.toLowerCase().includes(q)) ||
                (v.provider && v.provider.toLowerCase().includes(q)) ||
                (v.description && v.description.toLowerCase().includes(q)) ||
                (v.id && v.id.toLowerCase().includes(q)) ||
                (Array.isArray(v.tags) && v.tags.some((t: string) => t.toLowerCase().includes(q)))
              );
            });

            return (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Retell AI Voice Personas</span>
                    </label>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Showing {filteredVoices.length} of {availableVoices.length} available voices in your account
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Inline Search */}
                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={voiceSearchQuery}
                        onChange={(e) => setVoiceSearchQuery(e.target.value)}
                        placeholder="Search voice, accent, gender..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400"
                      />
                    </div>

                    <Button
                      type="button"
                      onClick={fetchVoices}
                      disabled={isLoadingVoices}
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 rounded-xl border-slate-200"
                      title="Refresh voice list from Retell"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingVoices ? "animate-spin" : ""}`} />
                    </Button>
                  </div>
                </div>

                {/* Scrollable Voice Cards Grid */}
                <div className="max-h-[500px] overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 custom-scrollbar">
                  {filteredVoices.map((v) => {
                    const isVoiceSelected = voiceId === v.id;
                    const isPlaying = playingVoiceId === v.id;

                    return (
                      <div
                        key={`${v.provider || 'retell'}-${v.id}`}
                        onClick={() => {
                          onChange({ voiceId: v.id, voiceName: v.name });
                          mark();
                        }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${isVoiceSelected
                          ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-xs"
                          : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/80"
                          }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-900 truncate leading-snug">
                                {v.name}
                              </p>
                              <div className="flex items-center gap-1 mt-1 flex-wrap">
                                {v.gender && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 font-semibold">
                                    {v.gender}
                                  </span>
                                )}
                                {v.accent && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100/80 text-emerald-800 font-semibold truncate max-w-[120px]">
                                    {v.accent}
                                  </span>
                                )}
                                {v.provider && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">
                                    {v.provider}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Inline Audio Preview Button */}
                            <button
                              type="button"
                              onClick={(e) => handlePlayPreview(v, e)}
                              className={`p-2 rounded-xl transition-all shrink-0 cursor-pointer ${isPlaying
                                ? "bg-emerald-600 text-white shadow-xs animate-pulse"
                                : "bg-white border border-slate-200 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700"
                                }`}
                              title={isPlaying ? "Stop audio preview" : "Listen to voice preview"}
                            >
                              {isPlaying ? (
                                <Pause className="w-3.5 h-3.5" />
                              ) : (
                                <Play className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                          <p className="text-[11px] text-slate-500 font-normal line-clamp-2 mt-2 leading-snug">
                            {v.description || "High-fidelity conversational voice for real estate inquiries."}
                          </p>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-mono truncate max-w-[140px]">ID: {v.id}</span>
                          {isVoiceSelected && (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Selected
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {filteredVoices.length === 0 && (
                    <div className="col-span-full py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                      No voices found matching &quot;{voiceSearchQuery}&quot;.
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Active Voice Summary Bar */}
          {(() => {
            const activeVoice =
              availableVoices.find((v: any) => v.id === voiceId) || {
                id: voiceId,
                name: formData.voiceName || voiceId,
                gender: "Voice",
                accent: "Natural",
                provider: "Retell",
              };

            return (
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-900">{activeVoice.name}</p>
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-200 text-emerald-800 text-[10px] font-bold">Active Voice</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {activeVoice.gender} &middot; {activeVoice.accent} &middot; <span className="font-mono text-slate-400">{activeVoice.id}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => handlePlayPreview(activeVoice, e)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-emerald-200 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  {playingVoiceId === activeVoice.id ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Play Sample</span>
                    </>
                  )}
                </button>
              </div>
            );
          })()}

          {/* Voice Fine-Tuning Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-extrabold text-slate-700">Voice Speed</label>
                <span className="text-[10px] font-mono font-bold text-emerald-600">{voiceSpeed.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.05"
                value={voiceSpeed}
                onChange={(e) => {
                  onChange({ voiceSpeed: parseFloat(e.target.value) });
                  mark();
                }}
                className="w-full h-2 bg-slate-100 rounded-lg accent-emerald-600 cursor-pointer mt-1"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                <span>0.5x Slow</span>
                <span>1.0x Default</span>
                <span>2.0x Fast</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-extrabold text-slate-700">Voice Temperature</label>
                <span className="text-[10px] font-mono font-bold text-emerald-600">{voiceTemperature.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={voiceTemperature}
                onChange={(e) => {
                  onChange({ voiceTemperature: parseFloat(e.target.value) });
                  mark();
                }}
                className="w-full h-2 bg-slate-100 rounded-lg accent-emerald-600 cursor-pointer mt-1"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                <span>0 Stable</span>
                <span>1 Balanced</span>
                <span>2 Expressive</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-extrabold text-slate-700">Voice Emotion</label>
              <select
                value={retellEmotion}
                onChange={(e) => {
                  onChange({ retellEmotion: e.target.value });
                  mark();
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
              >
                {RETELL_EMOTIONS.map((em) => (
                  <option key={em.id} value={em.id}>{em.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-xs font-bold text-slate-800">Expressive Mode</p>
                <p className="text-[10px] text-slate-400">Dynamic [excited],[sigh] tags</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onChange({ enableExpressiveMode: !enableExpressiveMode });
                  mark();
                }}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${enableExpressiveMode
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
              >
                {enableExpressiveMode ? "On" : "Off"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: STT & BEHAVIOR ── */}
      {activeTab === "stt" && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800">Speech-to-Text Mode</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {STT_MODES.map((m) => {
                const isSel = sttMode === m.id; return (
                  <button key={m.id} type="button" onClick={() => { onChange({ sttMode: m.id }); mark(); }} className={`p-3 text-left rounded-xl border transition-all ${isSel ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20" : "border-slate-200 bg-slate-50/50 hover:bg-slate-100"}`}>
                    <div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-900">{m.label}</span>{isSel && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}</div>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">{m.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-extrabold text-slate-700">Agent Language</label>
              <select value={retellLanguage} onChange={(e) => { onChange({ retellLanguage: e.target.value }); mark(); }} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                {RETELL_LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-extrabold text-slate-700">Vocab Specialization</label>
              <select value={vocabSpecialization} onChange={(e) => { onChange({ vocabSpecialization: e.target.value }); mark(); }} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                <option value="general">General (Default)</option>
                <option value="medical">Medical Terminology</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between"><label className="text-[11px] font-extrabold text-slate-700">Responsiveness</label><span className="text-[10px] font-mono font-bold text-emerald-600">{responsiveness.toFixed(1)}</span></div>
              <input type="range" min="0" max="1" step="0.1" value={responsiveness} onChange={(e) => { onChange({ responsiveness: parseFloat(e.target.value) }); mark(); }} className="w-full h-2 bg-slate-100 rounded-lg accent-emerald-600 cursor-pointer mt-1" />
              <div className="flex justify-between text-[9px] text-slate-400 font-bold"><span>0 Slow</span><span>1 Fast (Default)</span></div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between"><label className="text-[11px] font-extrabold text-slate-700">Interruption Sensitivity</label><span className="text-[10px] font-mono font-bold text-emerald-600">{interruptionSensitivity.toFixed(1)}</span></div>
              <input type="range" min="0" max="1" step="0.1" value={interruptionSensitivity} onChange={(e) => { onChange({ interruptionSensitivity: parseFloat(e.target.value) }); mark(); }} className="w-full h-2 bg-slate-100 rounded-lg accent-emerald-600 cursor-pointer mt-1" />
              <div className="flex justify-between text-[9px] text-slate-400 font-bold"><span>0 Never interrupt</span><span>1 Easy</span></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div><p className="text-xs font-bold text-slate-800">Backchanneling</p><p className="text-[10px] text-slate-400">"yeah", "uh-huh" nods</p></div>
              <button type="button" onClick={() => { onChange({ retellBackchannel: !retellBackchannel }); mark(); }} className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${retellBackchannel ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>{retellBackchannel ? "Active" : "Off"}</button>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div><p className="text-xs font-bold text-slate-800">Dynamic Responsiveness</p><p className="text-[10px] text-slate-400">Adapts to user speech rate</p></div>
              <button type="button" onClick={() => { onChange({ enableDynamicResponsiveness: !enableDynamicResponsiveness }); mark(); }} className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${enableDynamicResponsiveness ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>{enableDynamicResponsiveness ? "On" : "Off"}</button>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-extrabold text-slate-700">Silence Reminder</label>
              <select value={retellReminderMs} onChange={(e) => { onChange({ retellReminderMs: parseInt(e.target.value) }); mark(); }} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none">
                <option value={5000}>After 5s</option><option value={10000}>After 10s (Default)</option><option value={15000}>After 15s</option><option value={20000}>After 20s</option><option value={0}>Disabled</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-extrabold text-slate-700">Max Call Duration</label>
              <select value={maxDurationSeconds} onChange={(e) => { onChange({ maxDurationSeconds: parseInt(e.target.value) }); mark(); }} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none">
                <option value={300}>5 mins</option><option value={600}>10 mins</option><option value={900}>15 mins</option><option value={1800}>30 mins</option><option value={3600}>60 mins</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-extrabold text-slate-700">End Call After User Silence</label>
            <select value={endCallAfterSilenceMs} onChange={(e) => { onChange({ endCallAfterSilenceMs: parseInt(e.target.value) }); mark(); }} className="w-full sm:w-56 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none">
              <option value={15000}>15 seconds</option><option value={30000}>30 seconds</option><option value={60000}>1 minute</option><option value={300000}>5 minutes</option><option value={600000}>10 minutes (Default)</option>
            </select>
            <p className="text-[10px] text-slate-400 font-medium">Minimum 10s enforced by Retell.</p>
          </div>
        </div>
      )}

      {/* ── TAB 5: AMBIENT & ADVANCED ── */}
      {activeTab === "ambient" && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800">Ambient Background Sound</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {[...RETELL_AMBIENT, { id: "", label: "Off (Clean Studio)" }].map((s) => {
                const isSel = (retellAmbientSound || "") === s.id;
                return (
                  <button key={s.id} type="button" onClick={() => { onChange({ retellAmbientSound: s.id }); mark(); }} className={`p-3 text-left rounded-xl border transition-all text-xs font-bold cursor-pointer ${isSel ? "border-emerald-600 bg-emerald-50/60 text-emerald-900 ring-2 ring-emerald-500/20" : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100"}`}>
                    <div className="flex items-center justify-between"><span className="truncate">{s.label}</span>{isSel && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {retellAmbientSound && (
            <div className="space-y-1">
              <div className="flex items-center justify-between"><label className="text-[11px] font-extrabold text-slate-700">Ambient Volume</label><span className="text-[10px] font-mono font-bold text-emerald-600">{ambientVolume.toFixed(1)}</span></div>
              <input type="range" min="0" max="2" step="0.1" value={ambientVolume} onChange={(e) => { onChange({ ambientSoundVolume: parseFloat(e.target.value) }); mark(); }} className="w-full h-2 bg-slate-100 rounded-lg accent-emerald-600 cursor-pointer mt-1" />
              <div className="flex justify-between text-[9px] text-slate-400 font-bold"><span>0 Silent</span><span>1 Normal</span><span>2 Loud</span></div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800">Denoising Mode</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: "no-denoise", label: "No Denoising", desc: "Bypass all audio processing" },
                { id: "noise-cancellation", label: "Noise Cancellation", desc: "Remove background noise (Default)" },
                { id: "noise-and-background-speech-cancellation", label: "Full Cancellation", desc: "Remove noise + speech" },
              ].map((d) => {
                const isSel = denoisingMode === d.id; return (
                  <button key={d.id} type="button" onClick={() => { onChange({ denoisingMode: d.id }); mark(); }} className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${isSel ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20" : "border-slate-200 bg-slate-50/50 hover:bg-slate-100"}`}>
                    <div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-900">{d.label}</span>{isSel && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}</div>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">{d.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-extrabold text-slate-700">Voicemail Action</label>
              <select value={voicemailAction} onChange={(e) => { onChange({ voicemailAction: e.target.value }); mark(); }} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                <option value="hangup">Hang Up</option>
                <option value="static_text">Leave a Voicemail Message</option>
              </select>
            </div>
            {voicemailAction === "static_text" && (
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-700">Voicemail Message</label>
                <input type="text" value={voicemailMessage} onChange={(e) => { onChange({ voicemailMessage: e.target.value }); mark(); }} placeholder="Please call us back at your convenience." className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-800">Dynamic Voice Speed</p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">Retell adjusts speaking speed based on user speech patterns and conversation context.</p>
            </div>
            <button type="button" onClick={() => { onChange({ enableDynamicVoiceSpeed: !enableDynamicVoiceSpeed }); mark(); }} className={`shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${enableDynamicVoiceSpeed ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>{enableDynamicVoiceSpeed ? "Enabled" : "Disabled"}</button>
          </div>
        </div>
      )}

      {/* ── Create Agent Modal ── */}
      <CreateAgentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        platform="RETELL"
        agentPlatformId={retellIntegration?.id}
        apiBaseUrl={apiBaseUrl}
        onAgentCreated={(created) => {
          setIsCreateModalOpen(false);
          const id = created.agent_id || created.id;
          const name = created.agent_name || created.name || "New Retell Agent";
          onChange({ assistantId: id, assistantName: name });
          fetchAgents();
        }}
      />

      {/* ── Dual Mode Live Test Call Modal ── */}
      <DualModeTestCallModal
        isOpen={isTestCallModalOpen}
        onClose={() => setIsTestCallModalOpen(false)}
        assistantName={agentName}
        assistantId={selectedAgentId}
        agentPlatformId={retellIntegration?.id}
        platform="RETELL"
        telephonyIntegrations={telephonyIntegrations}
        selectedTelephonyId={formData.telephonyId}
        formData={formData}
        apiBaseUrl={apiBaseUrl}
      />
    </div>
  );
}
