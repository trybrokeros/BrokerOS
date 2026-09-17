"use client";

import React, { useState } from "react";
import { PhoneCall, CheckCircle2, AlertCircle, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface TestCallWidgetProps {
  formData: {
    agentPlatformId?: string;
    telephonyId?: string;
    callerIdNumber?: string;
    llmModel: string;
    voiceProvider: string;
    voiceId: string;
    voiceName?: string;
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
    retellVoiceModel?: string;
    retellEmotion?: string;
    enableExpressiveMode?: boolean;
    retellAmbientSound?: string;
    retellLanguage?: string;
    retellBackchannel?: boolean;
    retellReminderMs?: number;
  };
  telephonyIntegrations?: Array<{ id: string; name: string; provider: string; fromNumbers?: string[] }>;
  apiBaseUrl?: string;
}

export function TestCallWidget({
  formData,
  telephonyIntegrations = [],
  apiBaseUrl = "",
}: TestCallWidgetProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedTelephonyId, setSelectedTelephonyId] = useState<string>(
    formData.telephonyId || telephonyIntegrations[0]?.id || "native_provider",
  );
  const [isCalling, setIsCalling] = useState(false);
  const [callResult, setCallResult] = useState<{
    success: boolean;
    callId?: string;
    message?: string;
  } | null>(null);

  const handleTriggerTestCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    try {
      setIsCalling(true);
      setCallResult(null);

      const endpoint = `${apiBaseUrl}/api/marketing/voice/test/ai-call`;

      const payload = {
        toPhone: phoneNumber.trim(),
        fromNumber: formData.callerIdNumber || undefined,
        telephonyId: selectedTelephonyId !== "native_provider" ? selectedTelephonyId : undefined,
        agentPlatformId: formData.agentPlatformId,
        llmModel: formData.llmModel,
        voiceProvider: formData.voiceProvider,
        voiceId: formData.voiceId,
        scriptPrompt: formData.scriptPrompt,
        firstMessage: formData.firstMessage,
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
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCallResult({
          success: true,
          callId: data.providerCallId,
          message: `Live test call dispatched! Provider Call ID: ${data.providerCallId}`,
        });
      } else {
        setCallResult({
          success: false,
          message: data.error || data.message || "Failed to trigger live test call.",
        });
      }
    } catch (err: any) {
      setCallResult({
        success: false,
        message: err?.message || "Error connecting to test call dispatcher.",
      });
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900/5 via-slate-50 to-white p-5 rounded-2xl border border-indigo-200/80 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-[var(--text-primary)] flex items-center gap-1.5">
              <span>Live Phone Call Test</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase">
                Real-Time PSTN
              </span>
            </h4>
            <p className="text-[11px] font-medium text-[var(--text-tertiary)] mt-0.5">
              Dial your physical mobile number to test latency, conversational pacing, and voice persona before launching.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleTriggerTestCall} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        {/* Phone Input */}
        <div className="sm:col-span-5 space-y-1">
          <label className="text-[11px] font-bold text-slate-700">
            Target Phone Number <span className="text-rose-500">*</span>
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="e.g. +91 98765 43210 or +1 415 555 0199"
            required
            className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
          />
        </div>

        {/* Telephony Route */}
        <div className="sm:col-span-4 space-y-1">
          <label className="text-[11px] font-bold text-slate-700">
            Outbound Telephony Route
          </label>
          <select
            value={selectedTelephonyId}
            onChange={(e) => setSelectedTelephonyId(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            {telephonyIntegrations.map((tel) => (
              <option key={tel.id} value={tel.id}>
                {tel.name} ({tel.provider})
              </option>
            ))}
            <option value="native_provider">Direct AI Provider Outbound (Vapi / Retell)</option>
          </select>
        </div>

        {/* Dispatch Action */}
        <div className="sm:col-span-3">
          <Button
            type="submit"
            disabled={isCalling || !phoneNumber.trim()}
            className="w-full text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs gap-1.5 h-9"
          >
            {isCalling ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Ringing Phone...</span>
              </>
            ) : (
              <>
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call My Phone</span>
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Result Notification */}
      {callResult && (
        <div
          className={`p-3 rounded-xl border flex items-start gap-2 text-xs font-semibold ${callResult.success
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
        >
          {callResult.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="min-w-0 flex-1">
            <p>{callResult.message}</p>
            {callResult.callId && (
              <p className="text-[10px] font-mono text-emerald-700 mt-0.5">
                Call Session: {callResult.callId}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
