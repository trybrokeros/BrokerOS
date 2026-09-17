"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Trash2,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { CampaignWizardStepper } from "@/features/marketing/shared/CampaignWizardStepper";
import { Button } from "@/components/ui/Button";

// Wizard Steps
import { VoiceStep1ProjectSchedule } from "@/features/marketing/voice/wizard/VoiceStep1ProjectSchedule";
import { VoiceStep2Audience } from "@/features/marketing/voice/wizard/VoiceStep2Audience";
import { VoiceStep3TelephonyCarrier } from "@/features/marketing/voice/wizard/VoiceStep3TelephonyCarrier";
import { VoiceStep4AgentComposer } from "@/features/marketing/voice/wizard/VoiceStep4AgentComposer";
import { VoiceStep5ReviewLaunch } from "@/features/marketing/voice/wizard/VoiceStep5ReviewLaunch";

import type {
  AudienceSourceType,
  CsvLeadRow,
  VoiceTelephonyIntegrationRecord,
  VoiceAgentIntegrationRecord,
} from "@/features/marketing/types";
import { DEFAULT_VOICE_SCRIPTS } from "@brokeros/constants";

const VOICE_DRAFT_STORAGE_KEY = "brokeros_voice_campaign_draft_v1";

const VOICE_WIZARD_STEPS = [
  { num: 1, label: "Scope & Window", desc: "Title & Calling Hours" },
  { num: 2, label: "Audience Target", desc: "CRM Filter or CSV" },
  { num: 3, label: "Telephony Carrier", desc: "Trunk & Caller ID" },
  { num: 4, label: "AI Voice Agent", desc: "Model, Voice & Script" },
  { num: 5, label: "Review & Launch", desc: "Live AI Test & Dispatch" },
];

export default function NewVoiceCampaignPage() {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

  // Step Tracker
  const [currentStep, setCurrentStep] = useState(1);

  // Form State: Step 1 (Scope & Window)
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [isCpCampaign, setIsCpCampaign] = useState(false);
  const [callingWindowStart, setCallingWindowStart] = useState("10:00");
  const [callingWindowEnd, setCallingWindowEnd] = useState("19:00");
  const [scheduledAt, setScheduledAt] = useState<string | undefined>(undefined);
  const [maxConcurrentCalls, setMaxConcurrentCalls] = useState(5);
  const [retryLimit, setRetryLimit] = useState(1);

  // Form State: Step 2 (Audience)
  const [audienceSource, setAudienceSource] = useState<AudienceSourceType>("CRM_DATABASE");
  const [audienceFilters, setAudienceFilters] = useState<{
    temperatures?: Array<"HOT" | "WARM" | "COLD">;
    statuses?: string[];
    projectId?: string;
    minBudget?: number;
    maxBudget?: number;
  }>({});
  const [csvRecipients, setCsvRecipients] = useState<CsvLeadRow[]>([]);
  const [saveCsvAsCrmLeads, setSaveCsvAsCrmLeads] = useState(false);
  const [estimatedCount, setEstimatedCount] = useState(0);

  // Form State: Step 3 (Carrier Gateway)
  const [telephonyId, setTelephonyId] = useState<string | undefined>(undefined);
  const [callerIdNumber, setCallerIdNumber] = useState<string | undefined>(undefined);

  // Form State: Step 4 (AI Voice Agent)
  const [agentPlatformId, setAgentPlatformId] = useState<string | undefined>(undefined);
  const [assistantId, setAssistantId] = useState<string | undefined>(undefined);
  const [assistantName, setAssistantName] = useState<string>("BrokerOS Luxury Sales AI");
  const [modelProvider, setModelProvider] = useState<string>("openai");
  const [llmModel, setLlmModel] = useState("gpt-4o-mini");
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxTokens, setMaxTokens] = useState<number>(500);
  const [voiceProvider, setVoiceProvider] = useState("11labs");
  const [voiceId, setVoiceId] = useState("21m00Tcm4TlvDq8ikWAM");
  const [voiceName, setVoiceName] = useState("Rachel (ElevenLabs)");
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [voiceStability, setVoiceStability] = useState(0.5);
  const [voiceSimilarityBoost, setVoiceSimilarityBoost] = useState(0.75);
  const [scriptPrompt, setScriptPrompt] = useState<string>(DEFAULT_VOICE_SCRIPTS[0]?.systemPrompt || "");
  const [firstMessage, setFirstMessage] = useState<string>(DEFAULT_VOICE_SCRIPTS[0]?.firstMessage || "");

  // Vapi Advanced Studio State (Persisted)
  const [transcriberProvider, setTranscriberProvider] = useState("deepgram");
  const [transcriberModel, setTranscriberModel] = useState("nova-3");
  const [transcriberLanguage, setTranscriberLanguage] = useState("en");
  const [maxTurnSilenceMs, setMaxTurnSilenceMs] = useState(400);
  const [firstMessageMode, setFirstMessageMode] = useState<string>("assistant-speaks-first");
  const [voicemailDetection, setVoicemailDetection] = useState<string>("off");
  const [voicemailMessage, setVoicemailMessage] = useState<string>("");
  const [backgroundSound, setBackgroundSound] = useState<string>("off");
  const [silenceTimeoutSeconds, setSilenceTimeoutSeconds] = useState<number>(30);
  const [maxDurationSeconds, setMaxDurationSeconds] = useState(600);
  const [backchannelingEnabled, setBackchannelingEnabled] = useState(true);
  const [backgroundDenoisingEnabled, setBackgroundDenoisingEnabled] = useState(true);

  // Retell Advanced Studio State (Persisted)
  const [retellVoiceModel, setRetellVoiceModel] = useState("eleven_flash_v2_5");
  const [retellEmotion, setRetellEmotion] = useState("calm");
  const [enableExpressiveMode, setEnableExpressiveMode] = useState(false);
  const [retellAmbientSound, setRetellAmbientSound] = useState("call-center");
  const [retellLanguage, setRetellLanguage] = useState("hi-IN");
  const [retellBackchannel, setRetellBackchannel] = useState(true);
  const [retellReminderMs, setRetellReminderMs] = useState(10000);

  // Unified Full Studio Config (Preserves all dynamic settings across Vapi, Retell, ElevenLabs)
  const [agentStudioConfig, setAgentStudioConfig] = useState<Record<string, any>>({
    useS2sMode: false,
    s2sModel: "gpt-realtime-2.1",
    modelTemperature: 0.0,
    modelHighPriority: false,
    voiceTemperature: 1.0,
    ambientSoundVolume: 0.8,
    sttMode: "fast",
    vocabSpecialization: "general",
    responsiveness: 1.0,
    interruptionSensitivity: 1.0,
    enableDynamicResponsiveness: false,
    endCallAfterSilenceMs: 600000,
    denoisingMode: "noise-cancellation",
    voicemailAction: "hangup",
    enableDynamicVoiceSpeed: false,
    beginMessageDelayMs: 1000,
    ttsModel: "eleven_flash_v2_5",
    elevenLanguage: "en",
    turnTimeout: 7,
    turnEagerness: "normal",
    silenceEndCallTimeout: -1,
    speculativeTurn: true,
    asrQuality: "high",
    asrProvider: "elevenlabs",
    asrKeywords: [],
    backgroundVolume: 0.15,
  });

  // Metadata Lists
  const [projects, setProjects] = useState<Array<{ id: string; name: string; city?: string }>>([]);
  const [telephonyIntegrations, setTelephonyIntegrations] = useState<VoiceTelephonyIntegrationRecord[]>([]);
  const [agentIntegrations, setAgentIntegrations] = useState<VoiceAgentIntegrationRecord[]>([]);
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Draft Auto-Save State
  const [draftCampaignId, setDraftCampaignId] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch Projects and Integrations
  useEffect(() => {
    async function loadMeta() {
      try {
        setIsLoadingMeta(true);
        const [projRes, telRes, agentRes] = await Promise.all([
          fetch(`${baseUrl}/api/marketing/voice/campaigns/projects`),
          fetch(`${baseUrl}/api/marketing/voice/integrations/telephony`),
          fetch(`${baseUrl}/api/marketing/voice/integrations/agents`),
        ]);

        if (projRes.ok) {
          const projData = await projRes.json();
          setProjects(projData?.items || projData || []);
        }

        if (telRes.ok) {
          const telData = await telRes.json();
          setTelephonyIntegrations(telData || []);
          if (telData?.length > 0 && !telephonyId) {
            const defaultTel = telData.find((t: any) => t.isDefault) || telData[0];
            setTelephonyId(defaultTel.id);
            setCallerIdNumber(defaultTel.fromNumbers?.[0]);
          }
        }

        if (agentRes.ok) {
          const agentData = await agentRes.json();
          setAgentIntegrations(agentData || []);
          if (agentData?.length > 0 && !agentPlatformId) {
            const defaultAgent = agentData.find((a: any) => a.isDefault) || agentData[0];
            setAgentPlatformId(defaultAgent.id);
          }
        }
      } catch (err) {
        console.error("Failed to load metadata", err);
      } finally {
        setIsLoadingMeta(false);
      }
    }

    loadMeta();
  }, [baseUrl]);

  // 2. Restore Draft from LocalStorage on mount (Survives Ctrl+R)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(VOICE_DRAFT_STORAGE_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.title) setTitle(draft.title);
        if (draft.projectId) setProjectId(draft.projectId);
        if (draft.isCpCampaign !== undefined) setIsCpCampaign(draft.isCpCampaign);
        if (draft.callingWindowStart) setCallingWindowStart(draft.callingWindowStart);
        if (draft.callingWindowEnd) setCallingWindowEnd(draft.callingWindowEnd);
        if (draft.scheduledAt) setScheduledAt(draft.scheduledAt);
        if (draft.maxConcurrentCalls !== undefined) setMaxConcurrentCalls(draft.maxConcurrentCalls);
        if (draft.retryLimit !== undefined) setRetryLimit(draft.retryLimit);
        if (draft.audienceSource) setAudienceSource(draft.audienceSource);
        if (draft.audienceFilters) setAudienceFilters(draft.audienceFilters);
        if (draft.csvRecipients) setCsvRecipients(draft.csvRecipients);
        if (draft.saveCsvAsCrmLeads !== undefined) setSaveCsvAsCrmLeads(draft.saveCsvAsCrmLeads);
        if (draft.telephonyId) setTelephonyId(draft.telephonyId);
        if (draft.callerIdNumber) setCallerIdNumber(draft.callerIdNumber);
        if (draft.agentPlatformId) setAgentPlatformId(draft.agentPlatformId);
        if (draft.assistantId) setAssistantId(draft.assistantId);
        if (draft.assistantName) setAssistantName(draft.assistantName);
        if (draft.modelProvider) setModelProvider(draft.modelProvider);
        if (draft.llmModel) setLlmModel(draft.llmModel);
        if (draft.temperature !== undefined) setTemperature(draft.temperature);
        if (draft.maxTokens !== undefined) setMaxTokens(draft.maxTokens);
        if (draft.voiceProvider) setVoiceProvider(draft.voiceProvider);
        if (draft.voiceId) setVoiceId(draft.voiceId);
        if (draft.voiceName) setVoiceName(draft.voiceName);
        if (draft.voiceSpeed !== undefined) setVoiceSpeed(draft.voiceSpeed);
        if (draft.voiceStability !== undefined) setVoiceStability(draft.voiceStability);
        if (draft.voiceSimilarityBoost !== undefined) setVoiceSimilarityBoost(draft.voiceSimilarityBoost);
        if (draft.scriptPrompt) setScriptPrompt(draft.scriptPrompt);
        if (draft.firstMessage) setFirstMessage(draft.firstMessage);
        if (draft.transcriberProvider) setTranscriberProvider(draft.transcriberProvider);
        if (draft.transcriberModel) setTranscriberModel(draft.transcriberModel);
        if (draft.transcriberLanguage) setTranscriberLanguage(draft.transcriberLanguage);
        if (draft.maxTurnSilenceMs !== undefined) setMaxTurnSilenceMs(draft.maxTurnSilenceMs);
        if (draft.firstMessageMode) setFirstMessageMode(draft.firstMessageMode);
        if (draft.voicemailDetection) setVoicemailDetection(draft.voicemailDetection);
        if (draft.voicemailMessage !== undefined) setVoicemailMessage(draft.voicemailMessage);
        if (draft.backgroundSound) setBackgroundSound(draft.backgroundSound);
        if (draft.silenceTimeoutSeconds !== undefined) setSilenceTimeoutSeconds(draft.silenceTimeoutSeconds);
        if (draft.maxDurationSeconds !== undefined) setMaxDurationSeconds(draft.maxDurationSeconds);
        if (draft.backchannelingEnabled !== undefined) setBackchannelingEnabled(draft.backchannelingEnabled);
        if (draft.backgroundDenoisingEnabled !== undefined) setBackgroundDenoisingEnabled(draft.backgroundDenoisingEnabled);
        // Retell parameters restore
        if (draft.retellVoiceModel) setRetellVoiceModel(draft.retellVoiceModel);
        if (draft.retellEmotion) setRetellEmotion(draft.retellEmotion);
        if (draft.enableExpressiveMode !== undefined) setEnableExpressiveMode(draft.enableExpressiveMode);
        if (draft.retellAmbientSound) setRetellAmbientSound(draft.retellAmbientSound);
        if (draft.retellLanguage) setRetellLanguage(draft.retellLanguage);
        if (draft.retellBackchannel !== undefined) setRetellBackchannel(draft.retellBackchannel);
        if (draft.retellReminderMs !== undefined) setRetellReminderMs(draft.retellReminderMs);
        if (draft.agentStudioConfig) {
          setAgentStudioConfig(draft.agentStudioConfig);
        } else if (draft.studioSettings) {
          setAgentStudioConfig((prev) => ({ ...prev, ...draft.studioSettings }));
        }
        if (draft.draftCampaignId) setDraftCampaignId(draft.draftCampaignId);
        if (draft.currentStep) setCurrentStep(draft.currentStep);
        setHasRestoredDraft(true);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // 3. Save Draft to LocalStorage and Backend Database
  const saveDraftToDatabase = useCallback(async () => {
    if (!title.trim()) return;

    try {
      setIsSavingDraft(true);

      const studioSettings = {
        ...agentStudioConfig,
        assistantId,
        assistantName,
        modelProvider,
        temperature,
        maxTokens,
        transcriberProvider,
        transcriberModel,
        transcriberLanguage,
        maxTurnSilenceMs,
        voiceSpeed,
        voiceStability,
        voiceSimilarityBoost,
        firstMessageMode,
        voicemailDetection,
        voicemailMessage,
        backgroundSound,
        silenceTimeoutSeconds,
        maxDurationSeconds,
        backchannelingEnabled,
        backgroundDenoisingEnabled,
        retellVoiceModel,
        retellEmotion,
        enableExpressiveMode,
        retellAmbientSound,
        retellLanguage,
        retellBackchannel,
        retellReminderMs,
      };

      const draftState = {
        campaignId: draftCampaignId || undefined,
        title,
        projectId: projectId || undefined,
        isCpCampaign,
        callingWindowStart,
        callingWindowEnd,
        scheduledAt: scheduledAt || undefined,
        maxConcurrentCalls,
        retryLimit,
        telephonyId: telephonyId || undefined,
        callerIdNumber: callerIdNumber || undefined,
        agentPlatformId: agentPlatformId || undefined,
        assistantId,
        assistantName,
        modelProvider,
        llmModel,
        temperature,
        maxTokens,
        voiceProvider,
        voiceId,
        voiceName,
        voiceSpeed,
        voiceStability,
        voiceSimilarityBoost,
        scriptPrompt,
        firstMessage,
        studioSettings,
        agentStudioConfig,
        transcriberProvider,
        transcriberModel,
        transcriberLanguage,
        maxTurnSilenceMs,
        firstMessageMode,
        voicemailDetection,
        voicemailMessage,
        backgroundSound,
        silenceTimeoutSeconds,
        maxDurationSeconds,
        backchannelingEnabled,
        backgroundDenoisingEnabled,
        retellVoiceModel,
        retellEmotion,
        enableExpressiveMode,
        retellAmbientSound,
        retellLanguage,
        retellBackchannel,
        retellReminderMs,
        audienceSource,
        audienceFilters: audienceSource === "CRM_DATABASE" || audienceSource === "HYBRID" ? audienceFilters : undefined,
        csvRecipients: audienceSource === "CSV_UPLOAD" || audienceSource === "HYBRID" ? csvRecipients : undefined,
        saveCsvAsCrmLeads,
        currentStep,
      };

      localStorage.setItem(VOICE_DRAFT_STORAGE_KEY, JSON.stringify(draftState));

      const res = await fetch(`${baseUrl}/api/marketing/voice/campaigns/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draftState),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.id && !draftCampaignId) {
          setDraftCampaignId(data.id);
        }
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      }
    } catch {
      // Ignore background draft errors
    } finally {
      setIsSavingDraft(false);
    }
  }, [
    baseUrl,
    draftCampaignId,
    title,
    projectId,
    isCpCampaign,
    callingWindowStart,
    callingWindowEnd,
    scheduledAt,
    maxConcurrentCalls,
    retryLimit,
    telephonyId,
    callerIdNumber,
    agentPlatformId,
    llmModel,
    voiceProvider,
    voiceId,
    voiceName,
    scriptPrompt,
    firstMessage,
    transcriberModel,
    transcriberLanguage,
    maxTurnSilenceMs,
    voiceSpeed,
    firstMessageMode,
    voicemailDetection,
    backgroundSound,
    maxDurationSeconds,
    retellVoiceModel,
    retellEmotion,
    enableExpressiveMode,
    retellAmbientSound,
    retellLanguage,
    retellBackchannel,
    retellReminderMs,
    audienceSource,
    audienceFilters,
    csvRecipients,
    saveCsvAsCrmLeads,
    currentStep,
  ]);

  // 4. Auto-save Draft on Changes (Debounced 1200ms)
  useEffect(() => {
    if (!title.trim()) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      saveDraftToDatabase();
    }, 1200);

    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
  }, [
    title,
    projectId,
    isCpCampaign,
    callingWindowStart,
    callingWindowEnd,
    scheduledAt,
    maxConcurrentCalls,
    retryLimit,
    telephonyId,
    callerIdNumber,
    agentPlatformId,
    llmModel,
    voiceProvider,
    voiceId,
    scriptPrompt,
    firstMessage,
    transcriberModel,
    transcriberLanguage,
    maxTurnSilenceMs,
    voiceSpeed,
    firstMessageMode,
    voicemailDetection,
    backgroundSound,
    maxDurationSeconds,
    retellVoiceModel,
    retellEmotion,
    enableExpressiveMode,
    retellAmbientSound,
    retellLanguage,
    retellBackchannel,
    retellReminderMs,
    audienceSource,
    audienceFilters,
    saveDraftToDatabase,
  ]);

  // 5. Clear / Discard Draft
  const handleDiscardDraft = async () => {
    if (confirm("Are you sure you want to discard this AI Voice campaign draft and start fresh?")) {
      if (draftCampaignId) {
        try {
          await fetch(`${baseUrl}/api/marketing/voice/campaigns/${draftCampaignId}`, {
            method: "DELETE",
          });
        } catch {
          // Ignore network cleanup errors
        }
      }
      localStorage.removeItem(VOICE_DRAFT_STORAGE_KEY);
      setTitle("");
      setProjectId(undefined);
      setIsCpCampaign(false);
      setCallingWindowStart("10:00");
      setCallingWindowEnd("19:00");
      setScheduledAt(undefined);
      setMaxConcurrentCalls(5);
      setRetryLimit(1);
      setAudienceSource("CRM_DATABASE");
      setAudienceFilters({});
      setCsvRecipients([]);
      setSaveCsvAsCrmLeads(false);
      setTelephonyId(undefined);
      setCallerIdNumber(undefined);
      setAgentPlatformId(undefined);
      setLlmModel("gpt-4o");
      setVoiceProvider("sarvam");
      setVoiceId("priya");
      setVoiceName("Priya");
      setScriptPrompt(DEFAULT_VOICE_SCRIPTS[0]?.systemPrompt || "");
      setFirstMessage(DEFAULT_VOICE_SCRIPTS[0]?.firstMessage || "");
      setTranscriberModel("nova-3");
      setTranscriberLanguage("en");
      setMaxTurnSilenceMs(400);
      setVoiceSpeed(1.0);
      setFirstMessageMode("assistant-speaks-first");
      setVoicemailDetection("off");
      setBackgroundSound("off");
      setMaxDurationSeconds(600);
      setRetellVoiceModel("eleven_flash_v2_5");
      setRetellEmotion("calm");
      setEnableExpressiveMode(false);
      setRetellAmbientSound("call-center");
      setRetellLanguage("hi-IN");
      setRetellBackchannel(true);
      setRetellReminderMs(10000);
      setDraftCampaignId(null);
      setLastSavedTime(null);
      setHasRestoredDraft(false);
      setCurrentStep(1);
    }
  };

  // 6. Audience Estimation Trigger
  useEffect(() => {
    async function fetchEstimation() {
      try {
        const res = await fetch(`${baseUrl}/api/marketing/voice/campaigns/estimate-audience`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audienceSource,
            isCpCampaign,
            projectId,
            audienceFilters: audienceSource === "CRM_DATABASE" || audienceSource === "HYBRID" ? audienceFilters : undefined,
            csvRecipients: audienceSource === "CSV_UPLOAD" || audienceSource === "HYBRID" ? csvRecipients : undefined,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setEstimatedCount(data.finalAudienceCount || 0);
        }
      } catch (err) {
        console.error("Failed to estimate audience", err);
      }
    }

    fetchEstimation();
  }, [audienceSource, isCpCampaign, projectId, audienceFilters, csvRecipients, baseUrl]);

  // 7. Launch Campaign
  const handleLaunchCampaign = async () => {
    if (!title.trim()) {
      alert("Please enter a campaign title.");
      setCurrentStep(1);
      return;
    }
    if (!scriptPrompt.trim()) {
      alert("Please compose the conversational agent script.");
      setCurrentStep(4);
      return;
    }

    setIsSubmitting(true);
    try {
      const studioSettings = {
        ...agentStudioConfig,
        transcriberModel,
        transcriberLanguage,
        maxTurnSilenceMs,
        voiceSpeed,
        firstMessageMode,
        voicemailDetection,
        backgroundSound,
        maxDurationSeconds,
        retellVoiceModel,
        retellEmotion,
        enableExpressiveMode,
        retellAmbientSound,
        retellLanguage,
        retellBackchannel,
        retellReminderMs,
      };

      const payload = {
        campaignId: draftCampaignId || undefined,
        title,
        projectId: projectId || undefined,
        isCpCampaign,
        callingWindowStart,
        callingWindowEnd,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        maxConcurrentCalls,
        retryLimit,
        telephonyId: telephonyId || undefined,
        callerIdNumber: callerIdNumber || undefined,
        agentPlatformId: agentPlatformId || undefined,
        llmModel,
        voiceProvider,
        voiceId,
        voiceName,
        scriptPrompt,
        firstMessage: firstMessage || undefined,
        studioSettings,
        audienceSource,
        audienceFilters: audienceSource === "CRM_DATABASE" || audienceSource === "HYBRID" ? audienceFilters : undefined,
        csvRecipients: audienceSource !== "CRM_DATABASE" ? csvRecipients : undefined,
        saveCsvAsCrmLeads: audienceSource !== "CRM_DATABASE" ? saveCsvAsCrmLeads : false,
      };

      const res = await fetch(`${baseUrl}/api/marketing/voice/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.message || "Failed to launch voice campaign");
      }

      localStorage.removeItem(VOICE_DRAFT_STORAGE_KEY);
      const campaign = await res.json();
      router.push(`/dashboard/marketing/voice/campaigns/${campaign.id}`);
    } catch (err: any) {
      alert(err?.message || "Failed to launch campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep4Change = useCallback((f: Record<string, any>) => {
    setAgentStudioConfig((prev) => ({ ...prev, ...f }));
    if (f.agentPlatformId !== undefined) setAgentPlatformId(f.agentPlatformId);
    if (f.assistantId !== undefined) setAssistantId(f.assistantId);
    if (f.assistantName !== undefined) setAssistantName(f.assistantName);
    if (f.modelProvider !== undefined) setModelProvider(f.modelProvider);
    if (f.llmModel !== undefined) setLlmModel(f.llmModel);
    if (f.temperature !== undefined) setTemperature(f.temperature);
    if (f.maxTokens !== undefined) setMaxTokens(f.maxTokens);
    if (f.voiceProvider !== undefined) setVoiceProvider(f.voiceProvider);
    if (f.voiceId !== undefined) setVoiceId(f.voiceId);
    if (f.voiceName !== undefined) setVoiceName(f.voiceName);
    if (f.voiceSpeed !== undefined) setVoiceSpeed(f.voiceSpeed);
    if (f.voiceStability !== undefined) setVoiceStability(f.voiceStability);
    if (f.voiceSimilarityBoost !== undefined) setVoiceSimilarityBoost(f.voiceSimilarityBoost);
    if (f.scriptPrompt !== undefined) setScriptPrompt(f.scriptPrompt);
    if (f.firstMessage !== undefined) setFirstMessage(f.firstMessage);
    if (f.transcriberProvider !== undefined) setTranscriberProvider(f.transcriberProvider);
    if (f.transcriberModel !== undefined) setTranscriberModel(f.transcriberModel);
    if (f.transcriberLanguage !== undefined) setTranscriberLanguage(f.transcriberLanguage);
    if (f.maxTurnSilenceMs !== undefined) setMaxTurnSilenceMs(f.maxTurnSilenceMs);
    if (f.firstMessageMode !== undefined) setFirstMessageMode(f.firstMessageMode);
    if (f.voicemailDetection !== undefined) setVoicemailDetection(f.voicemailDetection);
    if (f.voicemailMessage !== undefined) setVoicemailMessage(f.voicemailMessage);
    if (f.backgroundSound !== undefined) setBackgroundSound(f.backgroundSound);
    if (f.silenceTimeoutSeconds !== undefined) setSilenceTimeoutSeconds(f.silenceTimeoutSeconds);
    if (f.maxDurationSeconds !== undefined) setMaxDurationSeconds(f.maxDurationSeconds);
    if (f.backchannelingEnabled !== undefined) setBackchannelingEnabled(f.backchannelingEnabled);
    if (f.backgroundDenoisingEnabled !== undefined) setBackgroundDenoisingEnabled(f.backgroundDenoisingEnabled);
    if (f.retellVoiceModel !== undefined) setRetellVoiceModel(f.retellVoiceModel);
    if (f.retellEmotion !== undefined) setRetellEmotion(f.retellEmotion);
    if (f.enableExpressiveMode !== undefined) setEnableExpressiveMode(f.enableExpressiveMode);
    if (f.retellAmbientSound !== undefined) setRetellAmbientSound(f.retellAmbientSound);
    if (f.retellLanguage !== undefined) setRetellLanguage(f.retellLanguage);
    if (f.retellBackchannel !== undefined) setRetellBackchannel(f.retellBackchannel);
    if (f.retellReminderMs !== undefined) setRetellReminderMs(f.retellReminderMs);
  }, []);

  return (
    <DashboardPageWrapper
      loading={isLoadingMeta}
      title="Create AI Voice Campaign"
      subtitle="5-Step Outbound AI Calling Campaign Wizard with live carrier line verification and human-grade AI speech testing."
      headerRight={
        <div className="flex items-center gap-2.5">
          {/* Auto-Save indicator */}
          {(draftCampaignId || lastSavedTime) && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-[var(--text-secondary)] shadow-xs">
              <Save className={`w-3.5 h-3.5 ${isSavingDraft ? "animate-spin text-indigo-600" : "text-emerald-600"}`} />
              <span>
                {isSavingDraft ? "Saving Voice draft..." : lastSavedTime ? `Draft saved (${lastSavedTime})` : "Draft saved"}
              </span>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => saveDraftToDatabase()}
            disabled={isSavingDraft}
            className="gap-1.5 text-xs font-bold"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDiscardDraft}
            className="gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Draft</span>
          </Button>

          <Link href="/dashboard/marketing/voice">
            <Button variant="outline" size="sm" className="gap-2 text-xs font-bold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Voice Hub</span>
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6 max-w-5xl">
        {/* ── RESTORED DRAFT BANNER ── */}
        {hasRestoredDraft && (
          <div className="bg-indigo-50/80 border border-indigo-200/90 rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-900">
                Restored in-progress AI Voice campaign draft from your last session.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setHasRestoredDraft(false)}
              className="text-xs font-bold text-indigo-800 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ── STEPPER HEADER ── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <CampaignWizardStepper
            steps={VOICE_WIZARD_STEPS}
            currentStep={currentStep}
            onStepClick={(stepNum) => setCurrentStep(stepNum)}
            accentColor="purple"
          />
        </div>

        {/* ── STEP 1: CAMPAIGN SCOPE & CALLING HOURS ── */}
        {currentStep === 1 && (
          <VoiceStep1ProjectSchedule
            formData={{
              title,
              projectId,
              isCpCampaign,
              callingWindowStart,
              callingWindowEnd,
              scheduledAt,
              maxConcurrentCalls,
              retryLimit,
            }}
            onChange={(f) => {
              if (f.title !== undefined) setTitle(f.title);
              if (f.projectId !== undefined) setProjectId(f.projectId);
              if (f.isCpCampaign !== undefined) setIsCpCampaign(f.isCpCampaign);
              if (f.callingWindowStart !== undefined) setCallingWindowStart(f.callingWindowStart);
              if (f.callingWindowEnd !== undefined) setCallingWindowEnd(f.callingWindowEnd);
              if (f.scheduledAt !== undefined) setScheduledAt(f.scheduledAt);
              if (f.maxConcurrentCalls !== undefined) setMaxConcurrentCalls(f.maxConcurrentCalls);
              if (f.retryLimit !== undefined) setRetryLimit(f.retryLimit);
            }}
            projects={projects}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {/* ── STEP 2: AUDIENCE TARGETING ── */}
        {currentStep === 2 && (
          <VoiceStep2Audience
            audienceSource={audienceSource}
            onSourceChange={setAudienceSource}
            filters={audienceFilters}
            onFiltersChange={setAudienceFilters}
            csvRecipients={csvRecipients}
            onCsvRecipientsChange={setCsvRecipients}
            saveCsvAsCrmLeads={saveCsvAsCrmLeads}
            onSaveCsvAsCrmLeadsChange={setSaveCsvAsCrmLeads}
            projects={projects}
            apiBaseUrl={baseUrl}
            onBack={() => setCurrentStep(1)}
            onNext={() => setCurrentStep(3)}
          />
        )}

        {/* ── STEP 3: TELEPHONY CARRIER & CALLER ID GATEWAY ── */}
        {currentStep === 3 && (
          <VoiceStep3TelephonyCarrier
            telephonyIntegrations={telephonyIntegrations}
            selectedTelephonyId={telephonyId}
            callerIdNumber={callerIdNumber}
            onSelectTelephony={(id, cid) => {
              setTelephonyId(id);
              const matchedTel = telephonyIntegrations.find((t) => t.id === id);
              const did = cid || matchedTel?.fromNumbers?.[0] || "";
              setCallerIdNumber(did);
            }}
            onSelectCallerId={setCallerIdNumber}
            apiBaseUrl={baseUrl}
            onBack={() => setCurrentStep(2)}
            onNext={() => setCurrentStep(4)}
          />
        )}

        {/* ── STEP 4: AI VOICE AGENT PERSONA & SCRIPT ── */}
        {currentStep === 4 && (
          <VoiceStep4AgentComposer
            formData={{
              ...agentStudioConfig,
              agentPlatformId,
              assistantId,
              assistantName,
              modelProvider,
              llmModel,
              temperature,
              maxTokens,
              voiceProvider,
              voiceId,
              voiceName,
              voiceSpeed,
              voiceStability,
              voiceSimilarityBoost,
              scriptPrompt,
              firstMessage,
              transcriberProvider,
              transcriberModel,
              transcriberLanguage,
              maxTurnSilenceMs,
              firstMessageMode,
              voicemailDetection,
              voicemailMessage,
              backgroundSound,
              silenceTimeoutSeconds,
              maxDurationSeconds,
              backchannelingEnabled,
              backgroundDenoisingEnabled,
              retellVoiceModel,
              retellEmotion,
              enableExpressiveMode,
              retellAmbientSound,
              retellLanguage,
              retellBackchannel,
              retellReminderMs,
            }}
            onChange={handleStep4Change}
            agentIntegrations={agentIntegrations}
            telephonyIntegrations={telephonyIntegrations}
            csvRecipients={csvRecipients}
            selectedProject={projects.find((p) => p.id === projectId)}
            apiBaseUrl={baseUrl}
            onBack={() => setCurrentStep(3)}
            onNext={() => setCurrentStep(5)}
          />
        )}

        {/* ── STEP 5: PRE-FLIGHT REVIEW, LIVE AI TEST & LAUNCH ── */}
        {currentStep === 5 && (
          <VoiceStep5ReviewLaunch
            formData={{
              title,
              projectId,
              isCpCampaign,
              callingWindowStart,
              callingWindowEnd,
              scheduledAt,
              maxConcurrentCalls,
              retryLimit,
              telephonyId,
              callerIdNumber,
              agentPlatformId,
              llmModel,
              voiceProvider,
              voiceId,
              voiceName,
              scriptPrompt,
              firstMessage,
              transcriberModel,
              transcriberLanguage,
              maxTurnSilenceMs,
              voiceSpeed,
              firstMessageMode,
              voicemailDetection,
              backgroundSound,
              maxDurationSeconds,
              retellVoiceModel,
              retellEmotion,
              enableExpressiveMode,
              retellAmbientSound,
              retellLanguage,
              retellBackchannel,
              retellReminderMs,
            }}
            totalRecipients={estimatedCount}
            csvRecipients={csvRecipients}
            projects={projects}
            telephonyIntegrations={telephonyIntegrations}
            agentIntegrations={agentIntegrations}
            onLaunch={handleLaunchCampaign}
            launching={isSubmitting}
            apiBaseUrl={baseUrl}
            onBack={() => setCurrentStep(4)}
          />
        )}
      </div>
    </DashboardPageWrapper>
  );
}
