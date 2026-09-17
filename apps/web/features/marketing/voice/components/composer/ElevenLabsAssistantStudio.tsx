"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles, Bot, Brain, Volume2, Mic, Sliders, PhoneCall, Save,
  CheckCircle2, AlertCircle, Loader2, Plus, RefreshCw, Zap,
  DollarSign, Search, X, Hash, Radio, VolumeX, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CreateAgentModal } from "./CreateAgentModal";

// ── Constants ──────────────────────────────────────────────────────────────

export const ELEVENLABS_LLM_MODELS: { id: string; label: string; provider: string; badge: string; group: string }[] = [
  // ── GPT-5 Series ──
  { id: "gpt-5.6-terra", label: "GPT-5.6 Terra", provider: "OpenAI", badge: "Default ★", group: "GPT-5" },
  { id: "gpt-5.6-sol", label: "GPT-5.6 Sol", provider: "OpenAI", badge: "High Reasoning", group: "GPT-5" },
  { id: "gpt-5.6-luna", label: "GPT-5.6 Luna", provider: "OpenAI", badge: "Conversational", group: "GPT-5" },
  { id: "gpt-6-astra", label: "GPT-6 Astra", provider: "OpenAI", badge: "Next-Gen", group: "GPT-5" },
  { id: "gpt-5.5", label: "GPT-5.5", provider: "OpenAI", badge: "Stable Flagship", group: "GPT-5" },
  { id: "gpt-5", label: "GPT-5", provider: "OpenAI", badge: "Flagship", group: "GPT-5" },
  { id: "gpt-5-mini", label: "GPT-5 Mini", provider: "OpenAI", badge: "Fast & Smart", group: "GPT-5" },
  { id: "gpt-5-nano", label: "GPT-5 Nano", provider: "OpenAI", badge: "Ultra Fast", group: "GPT-5" },

  // ── GPT-4.1 Series ──
  { id: "gpt-4.1", label: "GPT-4.1", provider: "OpenAI", badge: "Stable", group: "GPT-4.1" },
  { id: "gpt-4.1-mini", label: "GPT-4.1 Mini", provider: "OpenAI", badge: "Lowest Latency", group: "GPT-4.1" },
  { id: "gpt-4.1-nano", label: "GPT-4.1 Nano", provider: "OpenAI", badge: "Economy", group: "GPT-4.1" },

  // ── Claude Series ──
  { id: "claude-sonnet-5", label: "Claude Sonnet 5", provider: "Anthropic", badge: "Most Capable", group: "Claude" },
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", provider: "Anthropic", badge: "High EQ", group: "Claude" },
  { id: "claude-opus-4-7", label: "Claude Opus 4.7", provider: "Anthropic", badge: "Advanced Reasoning", group: "Claude" },
  { id: "claude-opus-4-8", label: "Claude Opus 4.8", provider: "Anthropic", badge: "Master Consultant", group: "Claude" },
  { id: "claude-haiku-4-5", label: "Claude Haiku 4.5", provider: "Anthropic", badge: "Ultra Speed", group: "Claude" },

  // ── Gemini Series ──
  { id: "gemini-3.8-flash", label: "Gemini 3.8 Flash", provider: "Google", badge: "Latest Flash", group: "Gemini" },
  { id: "gemini-3.7-flash", label: "Gemini 3.7 Flash", provider: "Google", badge: "Fast & Accurate", group: "Gemini" },
  { id: "gemini-3.5-flash", label: "Gemini 3.5 Flash", provider: "Google", badge: "Multilingual", group: "Gemini" },
  { id: "gemini-3-pro-preview", label: "Gemini 3 Pro Preview", provider: "Google", badge: "Deep Analysis", group: "Gemini" },
  { id: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro Preview", provider: "Google", badge: "Frontier Pro", group: "Gemini" },
];

export const ELEVENLABS_TTS_MODELS = [
  { id: "eleven_flash_v2_5", label: "Eleven Flash v2.5", badge: "75ms · Recommended ★", desc: "Ultra-low latency streaming model designed specifically for real-time conversational agents." },
  { id: "eleven_turbo_v2_5", label: "Eleven Turbo v2.5", badge: "High Fidelity", desc: "Fast response with nuanced vocal emotion and natural breathing pauses." },
  { id: "eleven_multilingual_v2", label: "Eleven Multilingual v2", badge: "29 Languages", desc: "Cross-lingual mastery for Indian & global multilingual sales campaigns." },
  { id: "eleven_v3_conversational", label: "Eleven v3 Conversational", badge: "Next-Gen v3", desc: "State-of-the-art conversational voice model with expressive controls." },
];

export const ELEVENLABS_LANGUAGES = [
  { id: "en", label: "English (Global / US / UK / India)" },
  { id: "hi", label: "Hindi — हिन्दी (India)" },
  { id: "es", label: "Spanish — Español" },
  { id: "fr", label: "French — Français" },
  { id: "de", label: "German — Deutsch" },
  { id: "pt", label: "Portuguese — Português" },
  { id: "ar", label: "Arabic — العربية" },
  { id: "zh", label: "Chinese — 中文" },
  { id: "ja", label: "Japanese — 日本語" },
  { id: "it", label: "Italian — Italiano" },
  { id: "nl", label: "Dutch — Nederlands" },
  { id: "ru", label: "Russian — Русский" },
];

export const ELEVENLABS_BACKGROUND_SOUNDS = [
  { id: "none", label: "None (Silent Studio)", icon: VolumeX },
  { id: "office2", label: "Active Real Estate Office (Recommended ★)", icon: Radio },
  { id: "office1", label: "Quiet Corporate Office", icon: Radio },
  { id: "restaurant", label: "Executive Cafe / Restaurant", icon: Radio },
  { id: "city", label: "Urban Ambient / Cityscape", icon: Radio },
  { id: "typing", label: "Gentle Keyboard Typing", icon: Radio },
  { id: "elevator1", label: "Elevator Soundscape 1", icon: Radio },
  { id: "elevator2", label: "Elevator Soundscape 2", icon: Radio },
  { id: "elevator3", label: "Elevator Soundscape 3", icon: Radio },
  { id: "elevator4", label: "Elevator Soundscape 4", icon: Radio },
];

export const CRM_TAGS = [
  { tag: "lead.firstName", label: "First Name" },
  { tag: "lead.fullName", label: "Full Name" },
  { tag: "project.name", label: "Project Name" },
  { tag: "project.city", label: "City" },
  { tag: "lead.budget", label: "Budget" },
  { tag: "lead.preferredConfiguration", label: "Config (2BHK/3BHK)" },
];

// ── Types ──────────────────────────────────────────────────────────────────

export interface ElevenLabsAssistantStudioProps {
  formData: any;
  onChange: (fields: any) => void;
  agentIntegrations?: any[];
  telephonyIntegrations?: any[];
  selectedProject?: any;
  apiBaseUrl?: string;
}

// ── Main Component ─────────────────────────────────────────────────────────

export function ElevenLabsAssistantStudio({
  formData,
  onChange,
  agentIntegrations = [],
  telephonyIntegrations = [],
  selectedProject,
  apiBaseUrl = "",
}: ElevenLabsAssistantStudioProps) {
  const [activeTab, setActiveTab] = useState<"dialogue" | "engine" | "voice" | "asr" | "ambient">("dialogue");

  // Remote agent management
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>(formData.assistantId || "");
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"synced" | "dirty" | "saving" | "error">("synced");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Test call state
  const [showTestCall, setShowTestCall] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [selectedFromNumber, setSelectedFromNumber] = useState("");
  const [isDialing, setIsDialing] = useState(false);
  const [callStatus, setCallStatus] = useState<"idle" | "ringing" | "connected" | "failed">("idle");
  const [callMessage, setCallMessage] = useState<string | null>(null);

  // Voice catalog
  const [voices, setVoices] = useState<any[]>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);
  const [voiceSearchQuery, setVoiceSearchQuery] = useState("");

  // Keyword tag entry
  const [newKeyword, setNewKeyword] = useState("");

  // ElevenLabs Integration Record
  const elevenLabsIntegration =
    agentIntegrations.find((a) => a.platform === "ELEVENLABS" && a.id === formData.agentPlatformId) ||
    agentIntegrations.find((a) => a.platform === "ELEVENLABS") ||
    null;

  useEffect(() => {
    if (elevenLabsIntegration && formData.agentPlatformId !== elevenLabsIntegration.id) {
      onChange({ agentPlatformId: elevenLabsIntegration.id });
    }
  }, [elevenLabsIntegration?.id]);

  useEffect(() => {
    fetchAgents();
    fetchVoices();
  }, [elevenLabsIntegration?.id]);

  // ── Fetch Agents ──
  const fetchAgents = async () => {
    if (!elevenLabsIntegration?.id) return;
    setIsLoadingAgents(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/marketing/voice/integrations/agents/${elevenLabsIntegration.id}/assistants`);
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list)) {
          setAgents(list);
          if (!selectedAgentId && list.length > 0) {
            applyAgent(list[0]);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load ElevenLabs agents", e);
    } finally {
      setIsLoadingAgents(false);
    }
  };

  // ── Fetch Voices ──
  const fetchVoices = async () => {
    if (!elevenLabsIntegration?.id) return;
    setIsLoadingVoices(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/marketing/voice/integrations/agents/${elevenLabsIntegration.id}/voices`);
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list)) {
          setVoices(list);
        }
      }
    } catch {
      // fallback
    } finally {
      setIsLoadingVoices(false);
    }
  };

  // ── Apply Agent Config ──
  const applyAgent = (agent: any) => {
    if (!agent) return;
    const id = agent.id || agent.agent_id;
    setSelectedAgentId(id);

    const voiceConfig = agent.voice || {};
    const modelConfig = agent.model || {};
    const turnConfig = agent.turn || {};
    const asrConfig = agent.asr || {};
    const convConfig = agent.conversation || {};

    onChange({
      assistantId: id,
      assistantName: agent.name || "ElevenLabs Conversational Agent",
      scriptPrompt: modelConfig.systemPrompt || agent.raw?.conversation_config?.agent?.prompt?.prompt || formData.scriptPrompt,
      firstMessage: agent.firstMessage || agent.raw?.conversation_config?.agent?.first_message || formData.firstMessage,
      llmModel: modelConfig.model || agent.raw?.conversation_config?.agent?.prompt?.llm || formData.llmModel || "gpt-5.6-terra",
      temperature: modelConfig.temperature ?? agent.raw?.conversation_config?.agent?.prompt?.temperature ?? 0.0,
      elevenLanguage: agent.language || agent.raw?.conversation_config?.agent?.language || "en",
      voiceId: voiceConfig.voiceId || agent.raw?.conversation_config?.tts?.voice_id || formData.voiceId || "cjVigY5qzO86Huf0OWal",
      ttsModel: voiceConfig.model || agent.raw?.conversation_config?.tts?.model_id || "eleven_flash_v2_5",
      voiceStability: voiceConfig.stability ?? agent.raw?.conversation_config?.tts?.stability ?? 0.5,
      voiceSimilarityBoost: voiceConfig.similarityBoost ?? agent.raw?.conversation_config?.tts?.similarity_boost ?? 0.8,
      voiceSpeed: voiceConfig.speed ?? agent.raw?.conversation_config?.tts?.speed ?? 1.0,
      turnTimeout: turnConfig.turn_timeout ?? agent.raw?.conversation_config?.turn?.turn_timeout ?? 7,
      turnEagerness: turnConfig.turn_eagerness || agent.raw?.conversation_config?.turn?.turn_eagerness || "normal",
      silenceEndCallTimeout: turnConfig.silence_end_call_timeout ?? agent.raw?.conversation_config?.turn?.silence_end_call_timeout ?? -1,
      speculativeTurn: turnConfig.speculative_turn ?? agent.raw?.conversation_config?.turn?.speculative_turn ?? true,
      asrQuality: asrConfig.quality || agent.raw?.conversation_config?.asr?.quality || "high",
      asrProvider: asrConfig.provider || agent.raw?.conversation_config?.asr?.provider || "elevenlabs",
      asrKeywords: asrConfig.keywords || agent.raw?.conversation_config?.asr?.keywords || [],
      maxDurationSeconds: convConfig.max_duration_seconds ?? agent.raw?.conversation_config?.conversation?.max_duration_seconds ?? 600,
      backgroundSound: convConfig.background_sound?.source_id || agent.raw?.conversation_config?.conversation?.background_sound?.source_id || "none",
      backgroundVolume: convConfig.background_sound?.volume ?? agent.raw?.conversation_config?.conversation?.background_sound?.volume ?? 0.15,
    });
    setSyncStatus("synced");
  };

  // ── Save & Sync to ElevenLabs ──
  const handleSaveAndSync = async () => {
    if (!elevenLabsIntegration?.id || !selectedAgentId) return;
    setIsSaving(true);
    setSyncStatus("saving");
    setStatusMessage("Pushing configuration to ElevenLabs ConvAI...");
    try {
      const res = await fetch(
        `${apiBaseUrl}/api/marketing/voice/integrations/agents/${elevenLabsIntegration.id}/assistants/${selectedAgentId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.assistantName,
            prompt: formData.scriptPrompt,
            firstMessage: formData.firstMessage,
            llmModel: formData.llmModel || "gpt-5.6-terra",
            temperature: formData.temperature ?? 0.0,
            elevenLanguage: formData.elevenLanguage || "en",
            voiceId: formData.voiceId || "cjVigY5qzO86Huf0OWal",
            ttsModel: formData.ttsModel || "eleven_flash_v2_5",
            voiceStability: formData.voiceStability ?? 0.5,
            voiceSimilarityBoost: formData.voiceSimilarityBoost ?? 0.8,
            voiceSpeed: formData.voiceSpeed ?? 1.0,
            turnTimeout: formData.turnTimeout ?? 7,
            turnEagerness: formData.turnEagerness || "normal",
            silenceEndCallTimeout: formData.silenceEndCallTimeout ?? -1,
            speculativeTurn: formData.speculativeTurn ?? true,
            asrQuality: formData.asrQuality || "high",
            asrProvider: formData.asrProvider || "elevenlabs",
            asrKeywords: formData.asrKeywords || [],
            maxDurationSeconds: formData.maxDurationSeconds || 600,
            backgroundSound: formData.backgroundSound || "none",
            backgroundVolume: formData.backgroundVolume ?? 0.15,
          }),
        }
      );

      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e?.message || "ElevenLabs agent sync failed");
      }

      setSyncStatus("synced");
      setStatusMessage("Agent synced with ElevenLabs.");
      setTimeout(() => setStatusMessage(null), 4000);
      fetchAgents();
    } catch (err: any) {
      setSyncStatus("error");
      setStatusMessage(err?.message || "Sync error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Dispatch Test Call ──
  const handleTestCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone.trim()) return;
    setIsDialing(true);
    setCallStatus("ringing");
    setCallMessage("Initiating test call via carrier bridge...");
    try {
      const payload: Record<string, any> = {
        toPhone: testPhone.trim(),
        agentPlatformId: elevenLabsIntegration?.id,
        assistantId: selectedAgentId,
        testMode: "elevenlabs-direct",
        llmModel: formData.llmModel || "gpt-5.6-terra",
        voiceProvider: "elevenlabs",
        voiceId: formData.voiceId || "cjVigY5qzO86Huf0OWal",
        scriptPrompt: formData.scriptPrompt || "You are an intelligent real estate advisor.",
        firstMessage: formData.firstMessage,
        ttsModel: formData.ttsModel || "eleven_flash_v2_5",
        elevenLanguage: formData.elevenLanguage || "en",
        maxDurationSeconds: formData.maxDurationSeconds || 600,
        backgroundSound: formData.backgroundSound || "none",
      };
      if (selectedFromNumber) payload.fromNumber = selectedFromNumber;

      const res = await fetch(`${apiBaseUrl}/api/marketing/voice/test/ai-call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) {
        const msg = Array.isArray(data?.message) ? data.message.join("; ") : data?.message || data?.error || `HTTP ${res.status}`;
        throw new Error(msg);
      }
      setCallStatus("connected");
      setCallMessage(`Call successfully dispatched! Call ID: ${data.providerCallId || data.call_id || "Live"}. Your phone will ring shortly.`);
    } catch (err: any) {
      setCallStatus("failed");
      setCallMessage(err?.message || "Test call failed. Check carrier gateway and phone format.");
    } finally {
      setIsDialing(false);
    }
  };

  const markDirty = () => setSyncStatus("dirty");

  const insertTag = (tag: string, field: "scriptPrompt" | "firstMessage") => {
    const currentVal = formData[field] || "";
    onChange({ [field]: `${currentVal}{{${tag}}}` });
    markDirty();
  };

  const addKeyword = () => {
    if (!newKeyword.trim()) return;
    const currentKeywords: string[] = formData.asrKeywords || [];
    if (!currentKeywords.includes(newKeyword.trim())) {
      onChange({ asrKeywords: [...currentKeywords, newKeyword.trim()] });
      markDirty();
    }
    setNewKeyword("");
  };

  const removeKeyword = (kw: string) => {
    const currentKeywords: string[] = formData.asrKeywords || [];
    onChange({ asrKeywords: currentKeywords.filter((k) => k !== kw) });
    markDirty();
  };

  // Form values with fallbacks
  const scriptPrompt = formData.scriptPrompt || "";
  const firstMessage = formData.firstMessage || "";
  const llmModel = formData.llmModel || "gpt-5.6-terra";
  const voiceId = formData.voiceId || "cjVigY5qzO86Huf0OWal";
  const ttsModel = formData.ttsModel || "eleven_flash_v2_5";
  const voiceStability = formData.voiceStability ?? 0.5;
  const voiceSimilarityBoost = formData.voiceSimilarityBoost ?? 0.8;
  const voiceSpeed = formData.voiceSpeed ?? 1.0;
  const elevenLanguage = formData.elevenLanguage || "en";
  const temperature = formData.temperature ?? 0.0;
  const turnTimeout = formData.turnTimeout ?? 7;
  const turnEagerness = formData.turnEagerness || "normal";
  const speculativeTurn = formData.speculativeTurn ?? true;
  const asrQuality = formData.asrQuality || "high";
  const asrProvider = formData.asrProvider || "elevenlabs";
  const asrKeywords: string[] = formData.asrKeywords || [];
  const maxDurationSeconds = formData.maxDurationSeconds ?? 600;
  const backgroundSound = formData.backgroundSound || "none";
  const backgroundVolume = formData.backgroundVolume ?? 0.15;

  const filteredVoices = voices.filter((v) =>
    v.name?.toLowerCase().includes(voiceSearchQuery.toLowerCase()) ||
    v.id?.toLowerCase().includes(voiceSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* ── TOP HUD ── */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold uppercase tracking-wider">
              ElevenLabs ConvAI Agent
            </span>
            {syncStatus === "synced" && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Synced
              </span>
            )}
            {syncStatus === "dirty" && (
              <span className="flex items-center gap-1 text-[11px] text-amber-600 font-bold">
                <AlertCircle className="w-3.5 h-3.5" /> Unsaved Changes
              </span>
            )}
            {syncStatus === "error" && (
              <span className="flex items-center gap-1 text-[11px] text-rose-600 font-bold">
                <AlertCircle className="w-3.5 h-3.5" /> Sync Failed
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedAgentId}
              onChange={(e) => {
                const found = agents.find((a) => (a.id || a.agent_id) === e.target.value);
                if (found) applyAgent(found);
              }}
              disabled={isLoadingAgents || agents.length === 0}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 max-w-sm flex-1 shadow-xs"
            >
              {agents.length === 0 ? (
                <option value="">{isLoadingAgents ? "Loading ElevenLabs Agents..." : "No Agents — Create One Below"}</option>
              ) : (
                agents.map((a) => {
                  const id = a.id || a.agent_id;
                  return (
                    <option key={id} value={id}>
                      {a.name || a.agent_name || "Agent"} ({id.slice(0, 10)}…)
                    </option>
                  );
                })
              )}
            </select>
            <Button
              type="button"
              onClick={fetchAgents}
              disabled={isLoadingAgents}
              size="sm"
              variant="outline"
              className="h-9 w-9 p-0 rounded-xl border-slate-200"
              title="Refresh Agents"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAgents ? "animate-spin" : ""}`} />
            </Button>
            <Button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 h-9 px-3.5 rounded-xl shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Agent</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-5">
          <div className="bg-slate-50/80 border border-slate-200/80 p-3 rounded-xl min-w-[120px]">
            <div className="flex items-center gap-1 text-slate-500 text-[10px] font-extrabold uppercase">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>Est. Cost</span>
            </div>
            <p className="text-base font-black text-slate-900 mt-0.5">
              $0.040<span className="text-[10px] text-slate-400 font-medium">/min</span>
            </p>
            <p className="text-[9px] text-slate-400 font-medium">Flash v2.5 + LLM + Bridge</p>
          </div>
          <div className="bg-slate-50/80 border border-slate-200/80 p-3 rounded-xl min-w-[120px]">
            <div className="flex items-center gap-1 text-slate-500 text-[10px] font-extrabold uppercase">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Streaming Turn</span>
            </div>
            <p className="text-base font-black text-slate-900 mt-0.5">
              ~75<span className="text-[10px] text-slate-400 font-medium">ms</span>
            </p>
            <p className="text-[9px] text-slate-400 font-medium">Flash Voice Pipeline</p>
          </div>
          <div className="flex flex-col gap-1.5 shrink-0">
            <Button
              type="button"
              onClick={handleSaveAndSync}
              disabled={isSaving || !selectedAgentId}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 rounded-xl h-8.5 shadow-xs"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save & Sync</span>
            </Button>
            <Button
              type="button"
              onClick={() => setShowTestCall(!showTestCall)}
              size="sm"
              variant="outline"
              className="text-xs font-bold gap-1.5 rounded-xl h-8.5 border-slate-200"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <span>{showTestCall ? "Hide Dialer" : "Test Call"}</span>
            </Button>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-3 rounded-xl text-xs font-bold border flex items-center gap-2 ${syncStatus === "error"
            ? "bg-rose-50 border-rose-200 text-rose-700"
            : "bg-emerald-50 border-emerald-200 text-emerald-700"
          }`}>
          {syncStatus === "error" ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{statusMessage}</span>
        </div>
      )}

      {/* ── TEST CALL DRAWER ── */}
      {showTestCall && (
        <div className="p-5 rounded-2xl bg-emerald-950 text-white border border-emerald-800 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-emerald-800/80 pb-3">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-200">
                PSTN Outbound Test Call Dialer
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setShowTestCall(false)}
              className="text-emerald-400 hover:text-white p-1 rounded-lg hover:bg-emerald-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleTestCall} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-emerald-300">Your Phone Number (E.164 format)</label>
              <input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+91 98765 43210 or +1 234 567 8900"
                className="w-full px-3 py-2 bg-emerald-900/60 border border-emerald-700/80 rounded-xl text-xs font-mono font-bold text-white placeholder:text-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-emerald-300">Caller ID (Telephony Carrier)</label>
              <select
                value={selectedFromNumber}
                onChange={(e) => setSelectedFromNumber(e.target.value)}
                className="w-full px-3 py-2 bg-emerald-900/60 border border-emerald-700/80 rounded-xl text-xs font-bold text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
              >
                <option value="">Default PSTN Outbound Route</option>
                {telephonyIntegrations.map((t) =>
                  (t.fromNumbers || []).map((num: string) => (
                    <option key={num} value={num}>
                      {num} ({t.provider})
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <Button
                type="submit"
                disabled={isDialing || !testPhone.trim()}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-xs gap-2 rounded-xl h-9 shadow-md"
              >
                {isDialing ? <Loader2 className="w-4 h-4 animate-spin" /> : <PhoneCall className="w-4 h-4" />}
                <span>{isDialing ? "Dialing PSTN Bridge..." : "Dial My Phone Now"}</span>
              </Button>
            </div>
          </form>

          {callMessage && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${callStatus === "failed" ? "bg-rose-900/60 text-rose-200 border border-rose-700" : "bg-emerald-900/80 text-emerald-200 border border-emerald-700"
              }`}>
              {callStatus === "failed" ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
              <span>{callMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* ── TAB NAVIGATION ── */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-2 gap-1 overflow-x-auto shadow-2xs">
        {[
          { id: "dialogue", label: "Dialogue & Script", icon: Bot },
          { id: "engine", label: "LLM Reasoning Engine", icon: Brain },
          { id: "voice", label: "Voice & Neural TTS", icon: Volume2 },
          { id: "asr", label: "Speech (ASR) & Turn", icon: Mic },
          { id: "ambient", label: "Ambient & Duration", icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold border-b-2 transition-all shrink-0 cursor-pointer ${isActive
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50/40"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
                }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: DIALOGUE & PROMPT ── */}
      {activeTab === "dialogue" && (
        <div className="p-6 rounded-b-2xl bg-white border border-t-0 border-slate-200/80 shadow-xs space-y-6">
          {/* Agent Identity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">Agent Display Name</label>
              <input
                type="text"
                value={formData.assistantName || ""}
                onChange={(e) => {
                  onChange({ assistantName: e.target.value });
                  markDirty();
                }}
                placeholder="e.g. Signature Towers Luxury Concierge"
                className="w-full px-3.5 py-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">Spoken Language</label>
              <select
                value={elevenLanguage}
                onChange={(e) => {
                  onChange({ elevenLanguage: e.target.value });
                  markDirty();
                }}
                className="w-full px-3.5 py-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {ELEVENLABS_LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* First Spoken Message */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-extrabold text-slate-900">First Spoken Greeting (Opening Line)</label>
                <p className="text-[11px] font-medium text-slate-500">
                  The exact words the ElevenLabs agent utters as soon as the lead answers the call.
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">Insert:</span>
                {CRM_TAGS.slice(0, 3).map((t) => (
                  <button
                    key={t.tag}
                    type="button"
                    onClick={() => insertTag(t.tag, "firstMessage")}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-md text-[10px] font-bold text-slate-700 transition-colors"
                  >
                    +{t.label}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={3}
              value={firstMessage}
              onChange={(e) => {
                onChange({ firstMessage: e.target.value });
                markDirty();
              }}
              placeholder="Hello! I am calling from BrokerOS regarding your inquiry for luxury 3BHK residences at Skyline Vista. Am I speaking with {{lead.firstName}}?"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-extrabold text-slate-900">System Persona & Conversational Directives</label>
                <p className="text-[11px] font-medium text-slate-500">
                  Defines the persona, sales objectives, objection handling, pricing guardrails, and closing strategy.
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">Tags:</span>
                {CRM_TAGS.map((t) => (
                  <button
                    key={t.tag}
                    type="button"
                    onClick={() => insertTag(t.tag, "scriptPrompt")}
                    className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-bold transition-colors"
                  >
                    +{t.label}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={12}
              value={scriptPrompt}
              onChange={(e) => {
                onChange({ scriptPrompt: e.target.value });
                markDirty();
              }}
              placeholder="You are an intelligent real estate sales advisor for {{project.name}} in {{project.city}}..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>
      )}

      {/* ── TAB 2: LLM ENGINE ── */}
      {activeTab === "engine" && (
        <div className="p-6 rounded-b-2xl bg-white border border-t-0 border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Frontier LLM Reasoning Models
              </h3>
              <p className="text-[11px] font-medium text-slate-500">
                Select the conversational intelligence engine backing your ElevenLabs agent.
              </p>
            </div>
            <div className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Active: {llmModel}
            </div>
          </div>

          {/* Grouped Models Grid */}
          <div className="space-y-4">
            {(["GPT-5", "GPT-4.1", "Claude", "Gemini"] as const).map((group) => {
              const groupModels = ELEVENLABS_LLM_MODELS.filter((m) => m.group === group);
              if (groupModels.length === 0) return null;
              return (
                <div key={group} className="space-y-1.5">
                  <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">{group}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {groupModels.map((m) => {
                      const isSelected = llmModel === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            onChange({ llmModel: m.id });
                            markDirty();
                          }}
                          className={`p-3 rounded-xl border text-left transition-all relative ${isSelected
                              ? "bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs"
                              : "bg-slate-50/50 border-slate-200/80 hover:bg-slate-100/70 hover:border-slate-300"
                            }`}
                        >
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <span className="text-xs font-black text-slate-900">{m.label}</span>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${isSelected ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                              }`}>
                              {m.badge}
                            </span>
                          </div>
                          <p className="text-[10px] font-mono text-slate-400 truncate">{m.id}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Temperature & Creativity Slider */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-800">Sampling Temperature (Creativity vs Determinism)</label>
                <p className="text-[10px] text-slate-500">Lower values (0.0) ensure strict adherence to price guardrails; higher values increase variety.</p>
              </div>
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-mono">
                {temperature.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1.0"
              step="0.05"
              value={temperature}
              onChange={(e) => {
                onChange({ temperature: parseFloat(e.target.value) });
                markDirty();
              }}
              className="w-full accent-emerald-600"
            />
          </div>
        </div>
      )}

      {/* ── TAB 3: VOICE & NEURAL TTS ── */}
      {activeTab === "voice" && (
        <div className="p-6 rounded-b-2xl bg-white border border-t-0 border-slate-200/80 shadow-xs space-y-6">
          {/* TTS Models */}
          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                ElevenLabs Neural Speech Synthesis Model
              </h3>
              <p className="text-[11px] font-medium text-slate-500">
                Choose the streaming TTS architecture driving vocal generation.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ELEVENLABS_TTS_MODELS.map((model) => {
                const isSelected = ttsModel === model.id;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => {
                      onChange({ ttsModel: model.id });
                      markDirty();
                    }}
                    className={`p-4 rounded-xl border text-left transition-all ${isSelected
                        ? "bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs"
                        : "bg-slate-50/50 border-slate-200/80 hover:bg-slate-100"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-slate-900">{model.label}</span>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${isSelected ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                        }`}>
                        {model.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{model.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Voice Picker / Search */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-800">Voice Persona Identifier</label>
                <p className="text-[10px] text-slate-500">Select a pre-made or cloned voice from your ElevenLabs voice library.</p>
              </div>
              <div className="w-48">
                <input
                  type="text"
                  placeholder="Search voice library..."
                  value={voiceSearchQuery}
                  onChange={(e) => setVoiceSearchQuery(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1">
              {filteredVoices.length === 0 ? (
                <div className="col-span-full p-4 text-center bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
                  {isLoadingVoices ? "Loading ElevenLabs Voices..." : "Using Default Voice ID: cjVigY5qzO86Huf0OWal (Rachel)"}
                </div>
              ) : (
                filteredVoices.map((v) => {
                  const isSelected = voiceId === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        onChange({ voiceId: v.id });
                        markDirty();
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${isSelected
                          ? "bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                        }`}
                    >
                      <p className="text-xs font-black text-slate-900 truncate">{v.name}</p>
                      <p className="text-[10px] font-mono text-slate-400 truncate">{v.id}</p>
                      {v.accent && <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-1 inline-block">{v.accent}</span>}
                    </button>
                  );
                })
              )}
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[11px] font-bold text-slate-600 shrink-0">Custom Voice ID:</label>
              <input
                type="text"
                value={voiceId}
                onChange={(e) => {
                  onChange({ voiceId: e.target.value });
                  markDirty();
                }}
                placeholder="e.g. cjVigY5qzO86Huf0OWal"
                className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>

          {/* Voice Inflection Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span>Stability</span>
                <span className="font-mono text-emerald-700">{voiceStability.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.0"
                step="0.05"
                value={voiceStability}
                onChange={(e) => {
                  onChange({ voiceStability: parseFloat(e.target.value) });
                  markDirty();
                }}
                className="w-full accent-emerald-600"
              />
              <p className="text-[10px] text-slate-400">Higher = more consistent tone</p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span>Similarity Boost</span>
                <span className="font-mono text-emerald-700">{voiceSimilarityBoost.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.0"
                step="0.05"
                value={voiceSimilarityBoost}
                onChange={(e) => {
                  onChange({ voiceSimilarityBoost: parseFloat(e.target.value) });
                  markDirty();
                }}
                className="w-full accent-emerald-600"
              />
              <p className="text-[10px] text-slate-400">Higher = closer to reference voice</p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span>Speaking Pace</span>
                <span className="font-mono text-emerald-700">{voiceSpeed.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.3"
                step="0.05"
                value={voiceSpeed}
                onChange={(e) => {
                  onChange({ voiceSpeed: parseFloat(e.target.value) });
                  markDirty();
                }}
                className="w-full accent-emerald-600"
              />
              <p className="text-[10px] text-slate-400">Optimal pace for cold sales: 1.0x</p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: SPEECH (ASR) & TURN TAKING ── */}
      {activeTab === "asr" && (
        <div className="p-6 rounded-b-2xl bg-white border border-t-0 border-slate-200/80 shadow-xs space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Turn Eagerness */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">Turn Eagerness (Interruption Sensitivity)</label>
              <select
                value={turnEagerness}
                onChange={(e) => {
                  onChange({ turnEagerness: e.target.value });
                  markDirty();
                }}
                className="w-full px-3.5 py-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="patient">Patient — Allows customer long pauses without interrupting</option>
                <option value="normal">Normal (Recommended ★) — Balanced conversational rhythm</option>
                <option value="eager">Eager — Snappy fast-turn responses</option>
              </select>
            </div>

            {/* Turn Timeout */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">Turn Timeout (Seconds)</label>
              <input
                type="number"
                min="3"
                max="20"
                value={turnTimeout}
                onChange={(e) => {
                  onChange({ turnTimeout: parseInt(e.target.value, 10) || 7 });
                  markDirty();
                }}
                className="w-full px-3.5 py-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Speculative Turn Toggle */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-extrabold text-slate-900">Speculative Turn Execution</p>
              <p className="text-[11px] text-slate-500">
                Pre-computes next sentence before customer completes utterance for sub-100ms conversational replies.
              </p>
            </div>
            <input
              type="checkbox"
              checked={speculativeTurn}
              onChange={(e) => {
                onChange({ speculativeTurn: e.target.checked });
                markDirty();
              }}
              className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
            />
          </div>

          {/* ASR Vocabulary & Keywords */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-900">Real Estate Vocabulary & Keyword Boosts</label>
            <p className="text-[11px] text-slate-500">
              Boost recognition of Indian real estate terminology, local builder brands, and unit configurations.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addKeyword(); } }}
                placeholder="e.g. DLF Privana, Godrej, RERA, 3BHK, Penthouse, Gurugram"
                className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
              <Button type="button" onClick={addKeyword} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl px-4">
                Add Keyword
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {asrKeywords.length === 0 ? (
                <span className="text-[11px] text-slate-400 italic">No custom keyword boosts configured.</span>
              ) : (
                asrKeywords.map((kw) => (
                  <span key={kw} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold">
                    {kw}
                    <button type="button" onClick={() => removeKeyword(kw)} className="text-emerald-500 hover:text-emerald-800">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: AMBIENT & ADVANCED ── */}
      {activeTab === "ambient" && (
        <div className="p-6 rounded-b-2xl bg-white border border-t-0 border-slate-200/80 shadow-xs space-y-6">
          {/* Ambient Sound presets */}
          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Preset Ambient Sound Layer
              </h3>
              <p className="text-[11px] font-medium text-slate-500">
                Adds realistic background room tone so the AI doesn't sound like a sterile soundproof studio.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {ELEVENLABS_BACKGROUND_SOUNDS.map((snd) => {
                const isSelected = backgroundSound === snd.id;
                const Icon = snd.icon;
                return (
                  <button
                    key={snd.id}
                    type="button"
                    onClick={() => {
                      onChange({ backgroundSound: snd.id });
                      markDirty();
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${isSelected
                        ? "bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20 text-emerald-900 font-bold"
                        : "bg-slate-50/50 border-slate-200/80 hover:bg-slate-100 text-slate-700 font-semibold"
                      }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? "text-emerald-600" : "text-slate-400"}`} />
                    <span className="text-xs leading-tight">{snd.label}</span>
                  </button>
                );
              })}
            </div>

            {backgroundSound !== "none" && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 mt-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>Background Sound Volume</span>
                  <span className="font-mono text-emerald-700">{Math.round(backgroundVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.5"
                  step="0.01"
                  value={backgroundVolume}
                  onChange={(e) => {
                    onChange({ backgroundVolume: parseFloat(e.target.value) });
                    markDirty();
                  }}
                  className="w-full accent-emerald-600"
                />
                <p className="text-[10px] text-slate-400">Recommended for office ambience: 15%</p>
              </div>
            )}
          </div>

          {/* Max Duration Guardrail */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-800">Maximum Call Duration (Guardrail)</label>
                <p className="text-[10px] text-slate-500">Automatically ends call if duration exceeds limit to prevent runaway telephony spend.</p>
              </div>
              <span className="text-xs font-black text-slate-900 font-mono">
                {Math.round(maxDurationSeconds / 60)} mins ({maxDurationSeconds}s)
              </span>
            </div>
            <input
              type="range"
              min="120"
              max="1800"
              step="60"
              value={maxDurationSeconds}
              onChange={(e) => {
                onChange({ maxDurationSeconds: parseInt(e.target.value, 10) });
                markDirty();
              }}
              className="w-full accent-emerald-600"
            />
          </div>
        </div>
      )}

      {/* Create Agent Modal */}
      <CreateAgentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        platform="ELEVENLABS"
        agentPlatformId={elevenLabsIntegration?.id}
        apiBaseUrl={apiBaseUrl}
        onAgentCreated={(newAgent) => {
          fetchAgents();
          applyAgent(newAgent);
        }}
      />
    </div>
  );
}
