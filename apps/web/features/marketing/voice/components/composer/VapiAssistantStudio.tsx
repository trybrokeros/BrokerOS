"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  Bot,
  Brain,
  Volume2,
  VolumeX,
  Mic,
  Settings,
  PhoneCall,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Zap,
  DollarSign,
  Clock,
  Shield,
  Sliders,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  VAPI_LLM_PROVIDERS,
  VAPI_TRANSCRIBERS,
  VAPI_VOICE_PROVIDERS,
  VOICE_TTS_CATALOG,
  calculateVapiCallMetrics,
} from "@brokeros/constants";
import { CreateAgentModal } from "./CreateAgentModal";
import { DualModeTestCallModal } from "./DualModeTestCallModal";

export interface VapiAssistantStudioProps {
  formData: any;
  onChange: (fields: any) => void;
  agentIntegrations?: any[];
  telephonyIntegrations?: any[];
  selectedProject?: any;
  apiBaseUrl?: string;
}

export function VapiAssistantStudio({
  formData,
  onChange,
  agentIntegrations = [],
  telephonyIntegrations = [],
  selectedProject,
  apiBaseUrl = "",
}: VapiAssistantStudioProps) {
  // ── Active Tabs ──
  const [activeTab, setActiveTab] = useState<"script" | "intelligence" | "voice" | "stt" | "flow">("script");

  // ── Remote Assistants State ──
  const [assistants, setAssistants] = useState<any[]>([]);
  const [selectedAssistantId, setSelectedAssistantId] = useState<string>(formData.assistantId || "");
  const [isLoadingAssistants, setIsLoadingAssistants] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"synced" | "dirty" | "saving" | "error">("synced");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // ── Modals State ──
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTestCallModalOpen, setIsTestCallModalOpen] = useState(false);

  // ── Audio Preview & Search State ──
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [voiceSearchQuery, setVoiceSearchQuery] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Audio cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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

    const synthesizeAndPlay = async () => {
      try {
        setPlayingVoiceId(voice.id);
        const res = await fetch(`${apiBaseUrl}/api/marketing/voice/audio/preview`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            voiceId: voice.id,
            voiceProvider: voice.provider,
            text: sampleText,
            agentPlatformId: vapiIntegration?.id,
          }),
        });

        if (res.ok) {
          const blob = await res.blob();
          if (blob && blob.size > 200) {
            const blobUrl = URL.createObjectURL(blob);
            const audio = new Audio(blobUrl);
            audioRef.current = audio;
            audio.onended = () => {
              URL.revokeObjectURL(blobUrl);
              setPlayingVoiceId(null);
              audioRef.current = null;
            };
            audio.onerror = () => {
              URL.revokeObjectURL(blobUrl);
              fallbackSpeech();
            };
            await audio.play();
            return;
          }
        }
      } catch {
        // Proceed to fallback
      }
      fallbackSpeech();
    };

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

    // 1. Direct verified static S3 / CDN preview URL (if not expired presigned)
    const isDirectExpired = voice.sampleAudio && (voice.sampleAudio.includes("X-Amz-Expires") || voice.sampleAudio.includes("X-Amz-Signature"));
    if (voice.sampleAudio && voice.sampleAudio.startsWith("http") && !isDirectExpired) {
      try {
        const audio = new Audio(voice.sampleAudio);
        audioRef.current = audio;
        setPlayingVoiceId(voice.id);
        audio.onended = () => {
          setPlayingVoiceId(null);
          audioRef.current = null;
        };
        audio.onerror = () => {
          synthesizeAndPlay();
        };
        await audio.play();
        return;
      } catch {
        synthesizeAndPlay();
        return;
      }
    }

    // 2. Synthesize with neural engine
    await synthesizeAndPlay();
  };

  // Find active VAPI integration strictly (Never pick a non-VAPI integration)
  const vapiIntegration = useMemo(() => {
    return (
      agentIntegrations.find((a) => a.platform === "VAPI" && a.id === formData.agentPlatformId) ||
      agentIntegrations.find((a) => a.platform === "VAPI") ||
      null
    );
  }, [agentIntegrations, formData.agentPlatformId]);

  // Ensure formData.agentPlatformId is aligned with the VAPI integration
  useEffect(() => {
    if (vapiIntegration && formData.agentPlatformId !== vapiIntegration.id) {
      onChange({ agentPlatformId: vapiIntegration.id });
    }
  }, [vapiIntegration?.id, formData.agentPlatformId, onChange]);

  // Current parameters
  const assistantName = formData.assistantName || formData.agentName || "BrokerOS Luxury Sales AI";
  const llmProvider = formData.modelProvider || "openai";
  const llmModel = formData.llmModel || "gpt-4o-mini";
  const temperature = formData.temperature ?? 0.7;
  const maxTokens = formData.maxTokens ?? 500;
  const scriptPrompt = formData.scriptPrompt || "";
  const systemPrompt = scriptPrompt;
  const firstMessage = formData.firstMessage || "";
  const firstMessageMode = formData.firstMessageMode || "assistant-speaks-first";

  const voiceProvider = formData.voiceProvider || "11labs";
  const voiceId = formData.voiceId || "21m00Tcm4TlvDq8ikWAM";
  const voiceName = formData.voiceName || "Rachel (ElevenLabs)";
  const voiceSpeed = formData.voiceSpeed ?? 1.0;
  const voiceStability = formData.voiceStability ?? 0.5;
  const voiceSimilarityBoost = formData.voiceSimilarityBoost ?? 0.75;
  const backgroundSound = formData.backgroundSound || "off";

  const transcriberProvider = formData.transcriberProvider || "deepgram";
  const transcriberModel = formData.transcriberModel || "nova-3";
  const transcriberLanguage = formData.transcriberLanguage || "en";
  const maxTurnSilenceMs = formData.maxTurnSilenceMs ?? 400;

  const silenceTimeoutSeconds = formData.silenceTimeoutSeconds ?? 30;
  const maxDurationSeconds = formData.maxDurationSeconds ?? 600;
  const backchannelingEnabled = formData.backchannelingEnabled ?? true;
  const backgroundDenoisingEnabled = formData.backgroundDenoisingEnabled ?? true;
  const voicemailDetection = formData.voicemailDetection || "off";
  const voicemailMessage = formData.voicemailMessage || "";

  // Dynamic Live Metrics Calculation
  const metrics = useMemo(() => {
    return calculateVapiCallMetrics(
      transcriberProvider,
      transcriberModel,
      llmProvider,
      llmModel,
      voiceProvider
    );
  }, [transcriberProvider, transcriberModel, llmProvider, llmModel, voiceProvider]);

  // 1. Fetch Remote Assistants on Mount / Integration Change
  const fetchAssistants = async () => {
    if (!vapiIntegration?.id) return;
    try {
      setIsLoadingAssistants(true);
      const res = await fetch(
        `${apiBaseUrl}/api/marketing/voice/integrations/agents/${vapiIntegration.id}/assistants`
      );
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list)) {
          setAssistants(list);
          // If no assistant currently selected, select the first one or create default
          if (!selectedAssistantId && list.length > 0) {
            handleSelectAssistant(list[0]);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load Vapi assistants", err);
    } finally {
      setIsLoadingAssistants(false);
    }
  };

  useEffect(() => {
    fetchAssistants();
  }, [vapiIntegration?.id]);

  // 2. Select an Assistant and Auto-Hydrate Studio
  const handleSelectAssistant = (asst: any) => {
    if (!asst) return;
    setSelectedAssistantId(asst.id);

    onChange({
      assistantId: asst.id,
      assistantName: asst.name || "Vapi Assistant",
      scriptPrompt: asst.model?.systemPrompt || asst.scriptPrompt || scriptPrompt,
      firstMessage: asst.firstMessage || firstMessage,
      firstMessageMode: asst.firstMessageMode || firstMessageMode,
      modelProvider: asst.model?.provider || llmProvider,
      llmModel: asst.model?.model || llmModel,
      temperature: asst.model?.temperature ?? temperature,
      maxTokens: asst.model?.maxTokens ?? maxTokens,
      voiceProvider: asst.voice?.provider || voiceProvider,
      voiceId: asst.voice?.voiceId || voiceId,
      voiceSpeed: asst.voice?.speed ?? voiceSpeed,
      transcriberProvider: asst.transcriber?.provider || transcriberProvider,
      transcriberModel: asst.transcriber?.model || transcriberModel,
      transcriberLanguage: asst.transcriber?.language || transcriberLanguage,
      silenceTimeoutSeconds: asst.silenceTimeoutSeconds ?? silenceTimeoutSeconds,
      maxDurationSeconds: asst.maxDurationSeconds ?? maxDurationSeconds,
      backgroundSound: asst.backgroundSound || backgroundSound,
      backchannelingEnabled: asst.backchannelingEnabled ?? backchannelingEnabled,
      backgroundDenoisingEnabled: asst.backgroundDenoisingEnabled ?? backgroundDenoisingEnabled,
      voicemailDetection: asst.voicemailDetection || voicemailDetection,
      voicemailMessage: asst.voicemailMessage || voicemailMessage,
    });

    setSyncStatus("synced");
  };

  // 3. Save & Sync to VAPI Remote Account
  const handleSaveAndSync = async () => {
    if (!vapiIntegration?.id) return;
    const targetId = selectedAssistantId || formData.assistantId || "default";

    try {
      setIsSaving(true);
      setSyncStatus("saving");
      setStatusMessage("Pushing live configuration to Vapi...");

      const endpoint = `${apiBaseUrl}/api/marketing/voice/integrations/agents/${vapiIntegration.id}/assistants/${targetId}`;

      const payload = {
        name: assistantName,
        firstMessage,
        firstMessageMode,
        silenceTimeoutSeconds,
        maxDurationSeconds,
        backgroundSound,
        backchannelingEnabled,
        backgroundDenoisingEnabled,
        voicemailMessage,
        model: {
          provider: llmProvider,
          model: llmModel,
          temperature,
          maxTokens,
          systemPrompt,
        },
        voice: {
          provider: voiceProvider,
          voiceId,
          speed: voiceSpeed,
          stability: voiceStability,
          similarityBoost: voiceSimilarityBoost,
        },
        transcriber: {
          provider: transcriberProvider,
          model: transcriberModel,
          language: transcriberLanguage,
        },
      };

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Failed to update assistant on Vapi");
      }

      const syncedAsst = await res.json().catch(() => null);
      if (syncedAsst && syncedAsst.id) {
        setSelectedAssistantId(syncedAsst.id);
        onChange({ assistantId: syncedAsst.id });
      }

      setSyncStatus("synced");
      setStatusMessage("Live Assistant parameters successfully synchronized with Vapi.");
      setTimeout(() => setStatusMessage(null), 4000);
      fetchAssistants();
    } catch (err: any) {
      setSyncStatus("error");
      setStatusMessage(err?.message || "Error syncing to Vapi");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to insert CRM tags into textareas
  const insertTag = (tag: string, targetField: "scriptPrompt" | "firstMessage") => {
    const currentVal = targetField === "scriptPrompt" ? scriptPrompt : firstMessage;
    const updatedVal = `${currentVal} {{${tag}}}`;
    onChange({ [targetField]: updatedVal });
    setSyncStatus("dirty");
  };

  return (
    <div className="space-y-6">
      {/* ── TOP HUD: ASSISTANT SELECTOR & LIVE METRICS GAUGES ── */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Left: Assistant Selector */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-extrabold uppercase tracking-wider">
              VAPI Cloud Agent
            </span>
            {syncStatus === "synced" && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Synced with Vapi
              </span>
            )}
            {syncStatus === "dirty" && (
              <span className="flex items-center gap-1 text-[11px] text-amber-600 font-bold">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Unsaved Changes
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedAssistantId}
              onChange={(e) => {
                const found = assistants.find((a) => a.id === e.target.value);
                if (found) handleSelectAssistant(found);
              }}
              disabled={isLoadingAssistants || assistants.length === 0}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 max-w-sm flex-1 shadow-xs"
            >
              {assistants.length === 0 ? (
                <option value="">{isLoadingAssistants ? "Loading Assistants..." : "No Assistants Found"}</option>
              ) : (
                assistants.map((asst) => (
                  <option key={asst.id} value={asst.id}>
                    {asst.name} ({asst.model?.model || "Vapi"})
                  </option>
                ))
              )}
            </select>

            <Button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold gap-1.5 h-9 px-3.5 rounded-xl shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Agent</span>
            </Button>
          </div>
        </div>

        {/* Center: Live Cost & Latency Benchmark Gauges */}
        <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-5">
          {/* Cost Gauge */}
          <div className="bg-slate-50/80 border border-slate-200/80 p-3 rounded-xl min-w-[130px]">
            <div className="flex items-center gap-1 text-slate-500 text-[10px] font-extrabold uppercase tracking-wider">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>Total Cost</span>
            </div>
            <p className="text-base font-black text-slate-900 mt-0.5">
              ${metrics.totalCostPerMin.toFixed(3)}
              <span className="text-[10px] text-slate-400 font-medium">/min</span>
            </p>
            <p className="text-[9px] text-slate-400 font-medium truncate">STT + LLM + TTS + Vapi</p>
          </div>

          {/* Latency Gauge */}
          <div className="bg-slate-50/80 border border-slate-200/80 p-3 rounded-xl min-w-[130px]">
            <div className="flex items-center gap-1 text-slate-500 text-[10px] font-extrabold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Turn Latency</span>
            </div>
            <p className="text-base font-black text-slate-900 mt-0.5">
              ~{metrics.estimatedLatencyMs}
              <span className="text-[10px] text-slate-400 font-medium">ms</span>
            </p>
            <p className="text-[9px] text-slate-400 font-medium truncate">First-token response</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1.5 shrink-0">
            <Button
              type="button"
              onClick={handleSaveAndSync}
              disabled={isSaving || !selectedAssistantId}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 rounded-xl h-8.5 shadow-xs"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save & Sync to Vapi</span>
            </Button>

            <Button
              type="button"
              onClick={() => setIsTestCallModalOpen(true)}
              variant="outline"
              size="sm"
              className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs gap-1.5 rounded-xl h-8.5 shadow-xs"
            >
              <PhoneCall className="w-3.5 h-3.5 text-purple-600" />
              <span>Live Test Call</span>
            </Button>
          </div>
        </div>
      </div>

      {/* No VAPI Integration Connected Warning */}
      {!vapiIntegration && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900">No VAPI Integration Connected</p>
              <p className="text-[11px] text-amber-700 font-medium">
                Connect your Vapi API Key in Voice Settings to load and synchronize live cloud assistants.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/marketing/voice/settings"
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 transition-colors shadow-xs"
          >
            Connect Vapi Key
          </Link>
        </div>
      )}

      {/* Toast message if present */}
      {statusMessage && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in ${syncStatus === "error"
            ? "bg-rose-50 border border-rose-200 text-rose-800"
            : "bg-purple-50 border border-purple-200 text-purple-800"
            }`}
        >
          {syncStatus === "error" ? (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
          )}
          <span>{statusMessage}</span>
        </div>
      )}

      {/* ── STUDIO NAVIGATION TABS ── */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200 overflow-x-auto">
        {[
          { id: "script", label: "Dialogue & Prompt", icon: Sparkles },
          { id: "intelligence", label: "LLM Intelligence", icon: Brain },
          { id: "voice", label: "Voice Persona", icon: Volume2 },
          { id: "stt", label: "Speech Recognition", icon: Mic },
          { id: "flow", label: "Call Flow & Safety", icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${isActive
                ? "bg-white text-purple-700 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-purple-600" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: DIALOGUE & SYSTEM PROMPT ── */}
      {activeTab === "script" && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          {/* Assistant Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Assistant Name</label>
            <input
              type="text"
              value={assistantName}
              onChange={(e) => {
                onChange({ assistantName: e.target.value });
                setSyncStatus("dirty");
              }}
              placeholder="e.g. Signature Towers Luxury Concierge"
              className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:bg-white transition-all text-slate-900"
            />
          </div>

          {/* First Message (Opening Line) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-purple-600" />
                <span>First Message (Opening Line Spoken by Assistant)</span>
              </label>
              <span className="text-[11px] text-slate-400">{firstMessage.length} chars</span>
            </div>

            <textarea
              value={firstMessage}
              onChange={(e) => {
                onChange({ firstMessage: e.target.value });
                setSyncStatus("dirty");
              }}
              rows={2}
              placeholder="Hello! Thank you for inquiring about our luxury residences..."
              className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:bg-white leading-relaxed text-slate-900"
            />

            {/* Variable Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Insert Lead Tag:</span>
              {["leadName", "projectName", "budget", "city", "assignedAgent"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => insertTag(tag, "firstMessage")}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-purple-100 text-purple-700 text-[10px] font-bold border border-slate-200 hover:border-purple-300 transition-colors"
                >
                  +{`{{${tag}}}`}
                </button>
              ))}
            </div>
          </div>

          {/* First Message Mode */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Opening Cadence Behavior</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {[
                { id: "assistant-speaks-first", label: "Assistant Speaks First", desc: "Speaks the opening message immediately on answer" },
                { id: "assistant-speaks-first-with-model-generated-message", label: "Dynamic AI Opening", desc: "LLM synthesizes greeting dynamically from context" },
                { id: "assistant-waits-for-user", label: "Wait for User", desc: "Silent until customer speaks first ('Hello?')" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onChange({ firstMessageMode: m.id });
                    setSyncStatus("dirty");
                  }}
                  className={`p-3 text-left rounded-xl border transition-all ${firstMessageMode === m.id
                    ? "border-purple-600 bg-purple-50/60 text-purple-900 ring-2 ring-purple-500/20"
                    : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100"
                    }`}
                >
                  <p className="text-xs font-bold">{m.label}</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-purple-600" />
                <span>System Prompt & Core Persona Instructions</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">~{Math.round(scriptPrompt.length / 4)} tokens</span>
              </div>
            </div>

            <textarea
              value={scriptPrompt}
              onChange={(e) => {
                onChange({ scriptPrompt: e.target.value });
                setSyncStatus("dirty");
              }}
              rows={8}
              placeholder="Define identity, conversational rules, luxury value propositions, and objection responses..."
              className="w-full px-4 py-3 text-xs font-mono font-medium bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:bg-white leading-relaxed shadow-xs"
            />

            {/* Variable Pills for System Prompt */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dynamic CRM Tokens:</span>
              {["leadName", "projectName", "budget", "unitType", "city", "assignedAgent", "siteVisitDate"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => insertTag(tag, "scriptPrompt")}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-purple-100 text-purple-700 text-[10px] font-bold border border-slate-200 hover:border-purple-300 transition-colors"
                >
                  +{`{{${tag}}}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: LLM INTELLIGENCE ENGINE ── */}
      {activeTab === "intelligence" && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800">LLM Engine Provider</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {Object.values(VAPI_LLM_PROVIDERS).map((prov) => {
                const isSelected = llmProvider === prov.provider;
                return (
                  <button
                    key={prov.provider}
                    type="button"
                    onClick={() => {
                      const firstModel = prov.models[0]?.id || "gpt-4o-mini";
                      onChange({
                        modelProvider: prov.provider,
                        llmModel: firstModel,
                      });
                      setSyncStatus("dirty");
                    }}
                    className={`p-3 text-left rounded-2xl border transition-all ${isSelected
                      ? "border-purple-600 bg-purple-50/60 text-purple-900 ring-2 ring-purple-500/20"
                      : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100"
                      }`}
                  >
                    <p className="text-xs font-bold leading-tight">{prov.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">{prov.badge}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model Selection for Active Provider */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800">
              Select {VAPI_LLM_PROVIDERS[llmProvider]?.name || "LLM"} Model
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {(VAPI_LLM_PROVIDERS[llmProvider]?.models || []).map((m) => {
                const isSelected = llmModel === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      onChange({ llmModel: m.id });
                      setSyncStatus("dirty");
                    }}
                    className={`p-3.5 text-left rounded-2xl border transition-all ${isSelected
                      ? "border-purple-600 bg-purple-50/60 text-purple-900 ring-2 ring-purple-500/20 shadow-xs"
                      : "border-slate-200 bg-slate-50/40 text-slate-700 hover:bg-slate-100/70"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{m.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                        {m.intelligenceTier}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span>~{m.latencyMs}ms</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-emerald-600" />
                        <span>In: ${m.inputCostPer1M}/1M</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-emerald-600" />
                        <span>Out: ${m.outputCostPer1M}/1M</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Brain className="w-3 h-3 text-indigo-500" />
                        <span>{m.contextWindow}</span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Parameters: Temperature & Max Tokens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            {/* Temperature */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Temperature (Creativity vs Determinism)</span>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md">{temperature.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.5"
                step="0.05"
                value={temperature}
                onChange={(e) => {
                  onChange({ temperature: parseFloat(e.target.value) });
                  setSyncStatus("dirty");
                }}
                className="w-full accent-purple-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>0.0 (Strict & Precise)</span>
                <span>0.7 (Standard Sales)</span>
                <span>1.5 (Expressive)</span>
              </div>
            </div>

            {/* Max Tokens */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Max Tokens per Turn</span>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md">{maxTokens} tokens</span>
              </div>
              <input
                type="range"
                min="100"
                max="2000"
                step="50"
                value={maxTokens}
                onChange={(e) => {
                  onChange({ maxTokens: parseInt(e.target.value) });
                  setSyncStatus("dirty");
                }}
                className="w-full accent-purple-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>100 (Rapid turns)</span>
                <span>500 (Standard)</span>
                <span>2000 (Detailed)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: VOICE PERSONA & AUDIO ── */}
      {activeTab === "voice" && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800">Voice Synthesis Engine (TTS)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {Object.values(VAPI_VOICE_PROVIDERS).map((prov) => {
                const isSelected = voiceProvider === prov.provider;
                return (
                  <button
                    key={prov.provider}
                    type="button"
                    onClick={() => {
                      const matching = VOICE_TTS_CATALOG.filter(
                        (v) => v.provider.toLowerCase() === prov.provider.toLowerCase()
                      );
                      const defaultVoice = matching[0];
                      onChange({
                        voiceProvider: prov.provider,
                        ...(defaultVoice ? { voiceId: defaultVoice.id, voiceName: defaultVoice.name } : {}),
                      });
                      setSyncStatus("dirty");
                    }}
                    className={`p-3 text-left rounded-2xl border transition-all ${isSelected
                      ? "border-purple-600 bg-purple-50/60 text-purple-900 ring-2 ring-purple-500/20"
                      : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100"
                      }`}
                  >
                    <p className="text-xs font-bold leading-tight">{prov.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">${prov.costPerMinute.toFixed(3)}/min</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Voice Persona Selection with Search & Inline Preview */}
          {(() => {
            const providerVoices = (VOICE_TTS_CATALOG as any[]).filter(
              (v) => (v.provider || "").toLowerCase() === voiceProvider.toLowerCase()
            );
            const filteredVoices = providerVoices.filter((v: any) => {
              if (!voiceSearchQuery.trim()) return true;
              const q = voiceSearchQuery.toLowerCase();
              return (
                (v.name && v.name.toLowerCase().includes(q)) ||
                (v.accent && v.accent.toLowerCase().includes(q)) ||
                (v.language && v.language.toLowerCase().includes(q)) ||
                (v.gender && v.gender.toLowerCase().includes(q)) ||
                (v.description && v.description.toLowerCase().includes(q))
              );
            });

            return (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-purple-600" />
                      <span>
                        Voice Personas for {VAPI_VOICE_PROVIDERS[voiceProvider]?.name || voiceProvider}
                      </span>
                    </label>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Showing {filteredVoices.length} of {providerVoices.length} available voices
                    </p>
                  </div>

                  {/* Inline Voice Search Filter */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={voiceSearchQuery}
                      onChange={(e) => setVoiceSearchQuery(e.target.value)}
                      placeholder="Search voice, accent, gender..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Scrollable Voice Cards Grid */}
                <div className="max-h-[500px] overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 custom-scrollbar">
                  {filteredVoices.map((v) => {
                    const isVoiceSelected = voiceId === v.id;
                    const isPlaying = playingVoiceId === v.id;

                    return (
                      <div
                        key={`${v.provider}-${v.id}-${v.languageCode || ''}`}
                        onClick={() => {
                          onChange({ voiceId: v.id, voiceName: v.name, voiceProvider: v.provider });
                          setSyncStatus("dirty");
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${isVoiceSelected
                          ? "border-purple-600 bg-purple-50/70 ring-2 ring-purple-500/20 shadow-xs"
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
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 font-semibold">
                                  {v.gender}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100/80 text-purple-800 font-semibold truncate max-w-[120px]">
                                  {v.accent || v.language}
                                </span>
                              </div>
                            </div>

                            {/* Inline Audio Preview Play/Pause Button */}
                            <button
                              type="button"
                              onClick={(e) => handlePlayPreview(v, e)}
                              className={`p-2 rounded-xl transition-all shrink-0 ${isPlaying
                                ? "bg-purple-600 text-white shadow-xs animate-pulse"
                                : "bg-white border border-slate-200 hover:bg-purple-50 text-slate-700 hover:text-purple-700"
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
                            {v.description}
                          </p>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-mono truncate max-w-[140px]">ID: {v.id}</span>
                          {isVoiceSelected && (
                            <span className="text-purple-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Selected
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {filteredVoices.length === 0 && (
                    <div className="col-span-full py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                      No voices found matching &quot;{voiceSearchQuery}&quot; for {voiceProvider}.
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Active Voice Summary Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{voiceName}</p>
                <p className="text-[11px] text-slate-500">
                  Engine: <span className="font-semibold text-slate-700">{voiceProvider}</span> • ID: <span className="font-mono text-slate-700">{voiceId}</span> • Speed: {voiceSpeed}x
                </p>
              </div>
            </div>

            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-100 text-purple-800">
              Active Voice
            </span>
          </div>

          {/* Voice Speed */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>Voice Speed Cadence</span>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md">{voiceSpeed.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.4"
              step="0.05"
              value={voiceSpeed}
              onChange={(e) => {
                onChange({ voiceSpeed: parseFloat(e.target.value) });
                setSyncStatus("dirty");
              }}
              className="w-full accent-purple-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold">
              <span>0.7x (Calm / Deliberate)</span>
              <span>1.0x (Natural Conversational)</span>
              <span>1.4x (High Velocity)</span>
            </div>
          </div>

          {/* Background Audio Ambience */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Office Ambient Sound Atmosphere</label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: "off", label: "Off (Crystal Clean Audio)", desc: "Zero background sound" },
                { id: "office", label: "Realistic Sales Floor", desc: "Subtle brokerage office hum" },
              ].map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => {
                    onChange({ backgroundSound: bg.id as "off" | "office" });
                    setSyncStatus("dirty");
                  }}
                  className={`p-3 text-left rounded-xl border transition-all ${backgroundSound === bg.id
                    ? "border-purple-600 bg-purple-50/60 text-purple-900 ring-2 ring-purple-500/20"
                    : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100"
                    }`}
                >
                  <p className="text-xs font-bold">{bg.label}</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">{bg.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: SPEECH RECOGNITION (STT) ── */}
      {activeTab === "stt" && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800">Speech-to-Text Engine (STT)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {Object.values(VAPI_TRANSCRIBERS).map((prov) => {
                const isSelected = transcriberProvider === prov.provider;
                return (
                  <button
                    key={prov.provider}
                    type="button"
                    onClick={() => {
                      const firstModel = prov.models[0]?.id || "nova-3";
                      onChange({
                        transcriberProvider: prov.provider,
                        transcriberModel: firstModel,
                      });
                      setSyncStatus("dirty");
                    }}
                    className={`p-3 text-left rounded-2xl border transition-all ${isSelected
                      ? "border-purple-600 bg-purple-50/60 text-purple-900 ring-2 ring-purple-500/20"
                      : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100"
                      }`}
                  >
                    <p className="text-xs font-bold leading-tight">{prov.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">{prov.badge}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800">
              Select {VAPI_TRANSCRIBERS[transcriberProvider]?.name || "STT"} Model
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {(VAPI_TRANSCRIBERS[transcriberProvider]?.models || []).map((m) => {
                const isSelected = transcriberModel === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      onChange({ transcriberModel: m.id });
                      setSyncStatus("dirty");
                    }}
                    className={`p-3 text-left rounded-xl border transition-all ${isSelected
                      ? "border-purple-600 bg-purple-50/60 text-purple-900 ring-2 ring-purple-500/20"
                      : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{m.name}</span>
                      <span className="text-[10px] text-emerald-600 font-bold">{m.accuracyRating}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Latency: ~{m.latencyMs}ms • ${m.costPerMinute.toFixed(4)}/min
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Primary Transcriber Language</label>
            <select
              value={transcriberLanguage}
              onChange={(e) => {
                onChange({ transcriberLanguage: e.target.value });
                setSyncStatus("dirty");
              }}
              className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-900"
            >
              <option value="en">English (US / India Global)</option>
              <option value="hi">Hindi (हिंदी)</option>
              <option value="es">Spanish (Español)</option>
              <option value="fr">French (Français)</option>
              <option value="de">German (Deutsch)</option>
              <option value="multi">Multilingual Auto-Detection</option>
            </select>
          </div>
        </div>
      )}

      {/* ── TAB 5: CALL FLOW, VOICEMAIL & SAFETY ── */}
      {activeTab === "flow" && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Silence Timeout */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Silence Timeout Before Nudge / Hangup</span>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md">{silenceTimeoutSeconds}s</span>
              </div>
              <input
                type="range"
                min="10"
                max="120"
                step="5"
                value={silenceTimeoutSeconds}
                onChange={(e) => {
                  onChange({ silenceTimeoutSeconds: parseInt(e.target.value) });
                  setSyncStatus("dirty");
                }}
                className="w-full accent-purple-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>10s (Snappy)</span>
                <span>30s (Default)</span>
                <span>120s (Patient)</span>
              </div>
            </div>

            {/* Max Duration */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Max Call Duration Safety Ceiling</span>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md">{Math.round(maxDurationSeconds / 60)} min</span>
              </div>
              <input
                type="range"
                min="60"
                max="1800"
                step="60"
                value={maxDurationSeconds}
                onChange={(e) => {
                  onChange({ maxDurationSeconds: parseInt(e.target.value) });
                  setSyncStatus("dirty");
                }}
                className="w-full accent-purple-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>1 min (Brief)</span>
                <span>10 min (Standard)</span>
                <span>30 min (Long Consult)</span>
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <label className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-900">Conversational Backchanneling</p>
                <p className="text-[11px] text-slate-500">Emits subtle nods ("uh-huh", "got it") during client pauses.</p>
              </div>
              <input
                type="checkbox"
                checked={backchannelingEnabled}
                onChange={(e) => {
                  onChange({ backchannelingEnabled: e.target.checked });
                  setSyncStatus("dirty");
                }}
                className="w-5 h-5 accent-purple-600 rounded"
              />
            </label>

            <label className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-900">Background Denoising</p>
                <p className="text-[11px] text-slate-500">Filters ambient microphone noise from lead's environment.</p>
              </div>
              <input
                type="checkbox"
                checked={backgroundDenoisingEnabled}
                onChange={(e) => {
                  onChange({ backgroundDenoisingEnabled: e.target.checked });
                  setSyncStatus("dirty");
                }}
                className="w-5 h-5 accent-purple-600 rounded"
              />
            </label>
          </div>

          {/* Voicemail Message */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-800">Voicemail Drop Message</label>
            <textarea
              value={voicemailMessage}
              onChange={(e) => {
                onChange({ voicemailMessage: e.target.value });
                setSyncStatus("dirty");
              }}
              rows={2}
              placeholder="Hi! I called regarding your luxury property interest. Please call us back at your convenience..."
              className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 leading-relaxed text-slate-900"
            />
          </div>
        </div>
      )}

      {/* ── MODALS ── */}
      <CreateAgentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        platform="VAPI"
        agentPlatformId={vapiIntegration?.id}
        apiBaseUrl={apiBaseUrl}
        onAgentCreated={(asst) => {
          fetchAssistants();
          handleSelectAssistant(asst);
        }}
      />

      <DualModeTestCallModal
        isOpen={isTestCallModalOpen}
        onClose={() => setIsTestCallModalOpen(false)}
        assistantName={assistantName}
        assistantId={selectedAssistantId}
        agentPlatformId={vapiIntegration?.id}
        telephonyIntegrations={telephonyIntegrations}
        selectedTelephonyId={formData.telephonyId}
        formData={formData}
        apiBaseUrl={apiBaseUrl}
      />
    </div>
  );
}
