"use client";

import React, { useState } from "react";
import {
  PhoneCall,
  Rocket,
  CheckCircle2,
  AlertCircle,
  Building,
  Radio,
  Volume2,
  Users,
  Loader2,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  normalizeVoiceLeadVariables,
  calculateVoiceCampaignCostEstimate,
  USD_TO_INR_EXCHANGE_RATE,
} from "@brokeros/constants";
import type { VoiceTelephonyIntegrationRecord, VoiceAgentIntegrationRecord } from "@/features/marketing/types";

export interface VoiceStep5ReviewLaunchProps {
  formData: {
    title: string;
    projectId?: string;
    isCpCampaign: boolean;
    callingWindowStart?: string;
    callingWindowEnd?: string;
    scheduledAt?: string;
    maxConcurrentCalls?: number;
    retryLimit?: number;
    telephonyId?: string;
    callerIdNumber?: string;
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
    firstMessageMode?: string;
    voicemailDetection?: string;
    backgroundSound?: string;
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
  totalRecipients: number;
  csvRecipients?: any[];
  projects?: Array<{ id: string; name: string; city?: string; location?: string }>;
  telephonyIntegrations?: VoiceTelephonyIntegrationRecord[];
  agentIntegrations?: VoiceAgentIntegrationRecord[];
  onLaunch: () => Promise<void>;
  launching: boolean;
  apiBaseUrl?: string;
  onBack?: () => void;
}

export function VoiceStep5ReviewLaunch({
  formData,
  totalRecipients,
  csvRecipients = [],
  projects = [],
  telephonyIntegrations = [],
  agentIntegrations = [],
  onLaunch,
  launching,
  apiBaseUrl = "",
  onBack,
}: VoiceStep5ReviewLaunchProps) {
  const [testPhone, setTestPhone] = useState("");
  const [testingAiCall, setTestingAiCall] = useState(false);
  const [testAiResult, setTestAiResult] = useState<{ success: boolean; message: string } | null>(null);

  const selectedTelephony = telephonyIntegrations.find((t) => t.id === formData.telephonyId);
  const selectedAgent = agentIntegrations.find((a) => a.id === formData.agentPlatformId);
  const selectedProject = projects.find((p) => p.id === formData.projectId);

  const costEstimate = calculateVoiceCampaignCostEstimate({
    totalLeads: totalRecipients,
    telephonyProvider: selectedTelephony?.provider,
    agentPlatform: selectedAgent?.platform,
    avgDurationMinutes: formData.maxDurationSeconds ? formData.maxDurationSeconds / 60 : 2.0,
  });

  const handleTestAiCall = async () => {
    if (!testPhone.trim()) {
      setTestAiResult({ success: false, message: "Please enter a valid phone number with country code (e.g. +919876543210)." });
      return;
    }

    try {
      setTestingAiCall(true);
      setTestAiResult(null);

      // 1. Dynamically extract the first lead / contact variables from uploaded CSV or database
      const firstRecipient = csvRecipients?.[0] || { name: "Valued Client", phone: testPhone };
      const dynamicVariables = normalizeVoiceLeadVariables(
        firstRecipient,
        selectedProject
          ? {
            name: selectedProject.name,
            city: selectedProject.city || undefined,
          }
          : undefined
      );

      const res = await fetch(`${apiBaseUrl}/api/marketing/voice/test/ai-call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toPhone: testPhone,
          projectId: formData.projectId,
          variables: dynamicVariables,
          telephonyId: formData.telephonyId,
          agentPlatformId: formData.agentPlatformId,
          llmModel: formData.llmModel,
          voiceProvider: formData.voiceProvider,
          voiceId: formData.voiceId,
          scriptPrompt: formData.scriptPrompt,
          firstMessage: formData.firstMessage,
          fromNumber: formData.callerIdNumber,
          transcriberModel: formData.transcriberModel,
          transcriberLanguage: formData.transcriberLanguage,
          maxTurnSilenceMs: formData.maxTurnSilenceMs,
          voiceSpeed: formData.voiceSpeed,
          firstMessageMode: formData.firstMessageMode,
          voicemailDetection: formData.voicemailDetection,
          backgroundSound: formData.backgroundSound,
          maxDurationSeconds: formData.maxDurationSeconds,
          retellVoiceModel: formData.retellVoiceModel,
          retellEmotion: formData.retellEmotion,
          enableExpressiveMode: formData.enableExpressiveMode,
          retellAmbientSound: formData.retellAmbientSound,
          retellLanguage: formData.retellLanguage,
          retellBackchannel: formData.retellBackchannel,
          retellReminderMs: formData.retellReminderMs,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setTestAiResult({
          success: true,
          message: `AI Voice agent dispatched successfully (Call ID: ${data.providerCallId || "live"}). Your phone will ring in a few seconds! Answer to speak with the AI.`,
        });
      } else {
        setTestAiResult({
          success: false,
          message: data.error || data.message || "Live AI test call failed.",
        });
      }
    } catch (err: any) {
      setTestAiResult({
        success: false,
        message: err?.message || "Failed to initiate AI call.",
      });
    } finally {
      setTestingAiCall(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-black tracking-tight text-[var(--text-primary)]">
          Step 5: Pre-Flight Review, Live AI Call Test & Launch
        </h2>
        <p className="text-xs font-medium text-[var(--text-tertiary)] mt-0.5">
          Verify targeting boundaries, test the live voice agent on your real phone, and dispatch the broadcast.
        </p>
      </div>

      {/* Pre-flight Configuration Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Project & World */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-600 mb-1.5">
            <Building className="w-4 h-4" />
            <span className="text-xs font-extrabold text-[var(--text-primary)]">Scope</span>
          </div>
          <p className="text-xs font-extrabold text-[var(--text-primary)]">
            {selectedProject ? selectedProject.name : "All Active Projects"}
          </p>
          <div className="mt-1">
            <Badge variant={formData.isCpCampaign ? "warning" : "default"} className="text-[9px]">
              {formData.isCpCampaign ? "Channel Partner" : "Brokerage"}
            </Badge>
          </div>
        </div>

        {/* Card 2: Audience */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-600 mb-1.5">
            <Users className="w-4 h-4" />
            <span className="text-xs font-extrabold text-[var(--text-primary)]">Audience</span>
          </div>
          <p className="text-base font-black text-[var(--text-primary)]">
            {totalRecipients} Contacts
          </p>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Deduplicated & Verified</p>
        </div>

        {/* Card 3: Carrier & Caller ID */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-purple-600 mb-1.5">
            <Radio className="w-4 h-4" />
            <span className="text-xs font-extrabold text-[var(--text-primary)]">Carrier Line</span>
          </div>
          <p className="text-xs font-extrabold text-[var(--text-primary)]">
            {selectedTelephony?.name || "Carrier Trunk"}
          </p>
          <p className="text-[10px] font-mono font-bold text-slate-500 mt-0.5">
            CID: {formData.callerIdNumber || "Default Line"}
          </p>
        </div>

        {/* Card 4: Voice & Model */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-amber-600 mb-1.5">
            <Volume2 className="w-4 h-4" />
            <span className="text-xs font-extrabold text-[var(--text-primary)]">Voice Persona</span>
          </div>
          <p className="text-xs font-extrabold text-[var(--text-primary)]">
            {formData.voiceName || "Rachel"} ({formData.voiceProvider})
          </p>
          <p className="text-[10px] font-bold text-slate-400 mt-0.5">
            Engine: {selectedAgent?.name || "AI Agent"}
          </p>
        </div>
      </div>

      {/* Pre-Flight Cost & Budget Card */}
      <div className="p-5 bg-linear-to-br from-slate-900 via-indigo-950 to-slate-950 rounded-2xl border border-indigo-500/20 text-white shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-indigo-500/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-300">
                Pre-Flight Budget & Call Cost Estimate
              </span>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-[9px] font-bold">
                Rate: $1 USD = ₹{USD_TO_INR_EXCHANGE_RATE} INR
              </Badge>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Based on {totalRecipients.toLocaleString()} dial attempts, 68% expected pickup rate, and avg {costEstimate.avgDurationMinutes} min duration.
            </p>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black text-amber-300">
              ₹{costEstimate.totalCostINR.toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              ~${costEstimate.totalCostUSD.toFixed(2)} USD
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Telephony Line</span>
            <p className="font-bold text-slate-100">{costEstimate.telephony.provider} (~₹{costEstimate.telephony.costPerMinuteINR}/min)</p>
            <p className="text-[11px] text-indigo-300 font-mono">₹{costEstimate.telephony.totalINR}</p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">AI Voice Engine</span>
            <p className="font-bold text-slate-100">{costEstimate.voiceAgent.platform} (~₹{costEstimate.voiceAgent.costPerMinuteINR}/min)</p>
            <p className="text-[11px] text-indigo-300 font-mono">₹{costEstimate.voiceAgent.totalINR}</p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Est. Connected Mins</span>
            <p className="font-bold text-slate-100">{costEstimate.estimatedConnectedMinutes} mins</p>
            <p className="text-[11px] text-slate-400 font-mono">~{costEstimate.estimatedConnectedCalls} answered</p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Blended Rate</span>
            <p className="font-bold text-emerald-400">₹{costEstimate.blendedRatePerMinuteINR}/min</p>
            <p className="text-[11px] text-slate-400 font-mono">${costEstimate.blendedRatePerMinuteUSD}/min</p>
          </div>
        </div>
      </div>

      {/* Live AI Phone Call Test Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-[var(--text-primary)] uppercase tracking-wider">
              Live AI Conversational Call Test
            </h3>
            <p className="text-[11px] text-[var(--text-tertiary)] font-medium">
              Call your personal mobile phone right now to have an interactive dialogue with the configured AI agent.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <input
            type="text"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            placeholder="Enter your phone number (e.g. +919876543210)"
            className="w-full sm:flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-xs"
          />

          <Button
            type="button"
            onClick={handleTestAiCall}
            disabled={testingAiCall || !formData.telephonyId || !testPhone.trim()}
            className="w-full sm:w-auto font-extrabold text-xs"
          >
            {testingAiCall ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                <span>Placing Live Call...</span>
              </>
            ) : (
              <>
                <PhoneCall className="w-3.5 h-3.5 mr-1.5" />
                <span>Test AI Call on My Phone</span>
              </>
            )}
          </Button>
        </div>

        {testAiResult && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2.5 ${testAiResult.success
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-rose-50 border border-rose-200 text-rose-800"
              }`}
          >
            {testAiResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span>{testAiResult.message}</span>
          </div>
        )}
      </div>

      {/* Launch Action Bar */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
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
          )}

          <div>
            <h4 className="text-xs font-extrabold text-[var(--text-primary)]">Ready to Broadcast</h4>
            <p className="text-[11px] text-[var(--text-tertiary)] font-medium">
              {formData.scheduledAt ? `Scheduled to launch at ${formData.scheduledAt}` : "Dialing will begin immediately."}
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={onLaunch}
          disabled={launching || totalRecipients === 0}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-8 py-3 text-sm rounded-xl shadow-xs"
        >
          {launching ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span>Launching Campaign...</span>
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4 mr-2" />
              <span>{formData.scheduledAt ? "Schedule Voice Campaign" : "Confirm & Launch Voice Campaign"}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
