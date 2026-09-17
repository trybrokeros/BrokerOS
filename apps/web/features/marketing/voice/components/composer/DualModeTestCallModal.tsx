"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  PhoneCall,
  PhoneForwarded,
  Radio,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface DualModeTestCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  assistantName: string;
  assistantId?: string;
  agentPlatformId?: string;
  platform?: "VAPI" | "RETELL" | "ELEVENLABS" | "SARVAM" | "BOLNA";
  telephonyIntegrations?: any[];
  selectedTelephonyId?: string;
  formData: any;
  apiBaseUrl?: string;
}

export function DualModeTestCallModal({
  isOpen,
  onClose,
  assistantName,
  assistantId,
  agentPlatformId,
  platform = "VAPI",
  telephonyIntegrations = [],
  selectedTelephonyId,
  formData,
  apiBaseUrl = "",
}: DualModeTestCallModalProps) {
  const [testMode, setTestMode] = useState<"direct" | "carrier-bridge">("direct");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedTelId, setSelectedTelId] = useState(selectedTelephonyId || telephonyIntegrations[0]?.id || "");
  const [isDialing, setIsDialing] = useState(false);
  const [callStatus, setCallStatus] = useState<"idle" | "ringing" | "connected" | "failed">("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Platform-registered phone numbers for direct mode
  const [directPhoneNumbers, setDirectPhoneNumbers] = useState<{ id: string; number: string; name?: string }[]>([]);
  const [directPhoneNumberId, setDirectPhoneNumberId] = useState<string>("");
  const [isLoadingNumbers, setIsLoadingNumbers] = useState(false);

  const platformName =
    platform === "RETELL"
      ? "Retell AI"
      : platform === "ELEVENLABS"
        ? "ElevenLabs"
        : "Vapi";

  const isEmerald = platform === "RETELL";
  const isIndigo = platform === "ELEVENLABS";

  const themeClasses = {
    primaryBg: isEmerald ? "bg-emerald-600 hover:bg-emerald-700" : isIndigo ? "bg-indigo-600 hover:bg-indigo-700" : "bg-purple-600 hover:bg-purple-700",
    primaryText: isEmerald ? "text-emerald-700" : isIndigo ? "text-indigo-700" : "text-purple-700",
    primaryBorder: isEmerald ? "border-emerald-600 ring-emerald-500/20" : isIndigo ? "border-indigo-600 ring-indigo-500/20" : "border-purple-600 ring-purple-500/20",
    primaryCardBg: isEmerald ? "bg-emerald-50/60 text-emerald-900" : isIndigo ? "bg-indigo-50/60 text-indigo-900" : "bg-purple-50/60 text-purple-900",
    iconColor: isEmerald ? "text-emerald-600" : isIndigo ? "text-indigo-600" : "text-purple-600",
  };

  // Fetch direct registered phone numbers when modal opens in direct mode
  useEffect(() => {
    if (!isOpen) return;
    const resolvedAgentId = agentPlatformId || formData?.agentPlatformId;
    if (!resolvedAgentId) return;

    setIsLoadingNumbers(true);
    fetch(`${apiBaseUrl}/api/marketing/voice/integrations/agents/${resolvedAgentId}/phone-numbers`)
      .then((r) => (r.ok ? r.json() : []))
      .then((nums: any[]) => {
        if (Array.isArray(nums) && nums.length > 0) {
          const mapped = nums.map((n) => ({
            id: n.id || n.number,
            number: n.number || n.id,
            name: n.name || n.nickname || n.number,
          }));
          setDirectPhoneNumbers(mapped);
          setDirectPhoneNumberId(mapped[0].id);
        } else {
          setDirectPhoneNumbers([]);
          setDirectPhoneNumberId("");
          // If no direct numbers and carriers exist, switch to carrier-bridge automatically
          if (telephonyIntegrations.length > 0) {
            setTestMode("carrier-bridge");
          }
        }
      })
      .catch(() => {
        setDirectPhoneNumbers([]);
        setDirectPhoneNumberId("");
      })
      .finally(() => setIsLoadingNumbers(false));
  }, [isOpen, agentPlatformId, formData?.agentPlatformId, apiBaseUrl, telephonyIntegrations.length]);

  if (!isOpen) return null;

  const handleStartCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setStatusMessage("Please enter a valid destination phone number.");
      return;
    }

    try {
      setIsDialing(true);
      setCallStatus("ringing");
      setStatusMessage(`Initiating outbound test call via ${testMode === "direct" ? platformName : "CRM Telephony Carrier"}...`);

      const endpoint = `${apiBaseUrl}/api/marketing/voice/test/ai-call`;

      const resolvedTestMode =
        testMode === "direct"
          ? platform === "RETELL"
            ? "retell-direct"
            : "vapi-direct"
          : "carrier-bridge";

      const payload: Record<string, any> = {
        toPhone: phoneNumber.trim(),
        agentPlatformId: agentPlatformId || formData.agentPlatformId,
        assistantId: assistantId || formData.assistantId,
        testMode: resolvedTestMode,
        llmModel: formData.llmModel || (platform === "RETELL" ? "gpt-5.6-terra" : "gpt-4o-mini"),
        voiceProvider: formData.voiceProvider || (platform === "RETELL" ? "retell" : "11labs"),
        voiceId: formData.voiceId || (platform === "RETELL" ? "11labs-rachel" : "21m00Tcm4TlvDq8ikWAM"),
        scriptPrompt: formData.scriptPrompt || "You are an intelligent luxury real estate advisor.",
        firstMessage: formData.firstMessage,
        transcriberModel: formData.transcriberModel || "nova-3",
        transcriberLanguage: formData.transcriberLanguage || "en",
        maxTurnSilenceMs: formData.maxTurnSilenceMs || 400,
        voiceSpeed: formData.voiceSpeed ?? 1.0,
        voiceTemperature: formData.voiceTemperature ?? 1.0,
        firstMessageMode: formData.firstMessageMode,
        voicemailDetection: formData.voicemailDetection,
        backgroundSound: formData.backgroundSound,
        maxDurationSeconds: formData.maxDurationSeconds || 600,
        retellVoiceModel: formData.retellVoiceModel,
        retellEmotion: formData.retellEmotion,
        retellLanguage: formData.retellLanguage,
        retellAmbientSound: formData.retellAmbientSound,
        retellBackchannel: formData.retellBackchannel,
        retellReminderMs: formData.retellReminderMs,
        enableExpressiveMode: formData.enableExpressiveMode,
      };

      if (testMode === "direct" && directPhoneNumberId) {
        payload.fromNumber = directPhoneNumberId;
      } else if (testMode === "carrier-bridge") {
        payload.telephonyId = selectedTelId;
        const matchedTel = telephonyIntegrations.find((t) => t.id === selectedTelId);
        if (matchedTel?.fromNumbers?.[0]) {
          payload.fromNumber = matchedTel.fromNumbers[0];
        }
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.success === false) {
        const errMsg = Array.isArray(data?.message)
          ? data.message.join("; ")
          : data?.message || data?.error || `HTTP ${res.status}`;
        throw new Error(errMsg);
      }

      setCallStatus("connected");
      setStatusMessage(
        `Call dispatched! ${platformName} Call ID: ${data.providerCallId || data.call_id || data.callId || data.id || "Live"}. Your phone should ring shortly.`
      );
    } catch (err: any) {
      setCallStatus("failed");
      setStatusMessage(err?.message || "Test call failed. Please verify provider credentials and phone format.");
    } finally {
      setIsDialing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200/80 shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl ${themeClasses.primaryBg} text-white flex items-center justify-center text-xs font-black shadow-xs`}>
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">{platformName} Live Voice Test Dialer</h3>
              <p className="text-[11px] font-medium text-slate-500">
                Testing <span className={`font-bold ${themeClasses.primaryText}`}>{assistantName}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleStartCall} className="p-6 space-y-4">
          {/* Dialing Mode Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Telephony Routing Channel</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTestMode("direct")}
                className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${testMode === "direct"
                  ? `${themeClasses.primaryBorder} ${themeClasses.primaryCardBg} ring-2`
                  : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100"
                  }`}
              >
                <div className="flex items-center gap-1.5">
                  <Radio className={`w-3.5 h-3.5 ${testMode === "direct" ? themeClasses.iconColor : "text-slate-400"}`} />
                  <span className="text-xs font-bold">{platformName} Direct PSTN</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-1">
                  Calls via numbers registered in {platformName}.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTestMode("carrier-bridge")}
                className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${testMode === "carrier-bridge"
                  ? `${themeClasses.primaryBorder} ${themeClasses.primaryCardBg} ring-2`
                  : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100"
                  }`}
              >
                <div className="flex items-center gap-1.5">
                  <PhoneForwarded className={`w-3.5 h-3.5 ${testMode === "carrier-bridge" ? themeClasses.iconColor : "text-slate-400"}`} />
                  <span className="text-xs font-bold">CRM Telephony Carrier</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-1">
                  Twilio / Vobiz / Exotel / Telnyx bridge.
                </p>
              </button>
            </div>
          </div>

          {/* Direct Phone Number Selector */}
          {testMode === "direct" && (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Hash className={`w-3 h-3 ${themeClasses.iconColor}`} />
                {platformName} Outbound Phone Number
              </label>
              {isLoadingNumbers ? (
                <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
                  <Loader2 className={`w-3.5 h-3.5 animate-spin ${themeClasses.iconColor}`} />
                  <span>Loading registered numbers from {platformName}...</span>
                </div>
              ) : directPhoneNumbers.length > 0 ? (
                <select
                  value={directPhoneNumberId}
                  onChange={(e) => setDirectPhoneNumberId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:border-slate-400"
                >
                  {directPhoneNumbers.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.number}{n.name && n.name !== n.number ? ` — ${n.name}` : ""}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium space-y-2">
                  <p>
                    No phone numbers registered in your {platformName} workspace.
                  </p>
                  {telephonyIntegrations.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setTestMode("carrier-bridge")}
                      className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold shadow-xs cursor-pointer"
                    >
                      Switch to CRM Carrier (Twilio/Vobiz) &rarr;
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Carrier selector if carrier-bridge */}
          {testMode === "carrier-bridge" && (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              <label className="text-xs font-bold text-slate-800">Select Connected Carrier</label>
              {telephonyIntegrations.length > 0 ? (
                <select
                  value={selectedTelId}
                  onChange={(e) => setSelectedTelId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:border-slate-400"
                >
                  {telephonyIntegrations.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.provider} ({t.fromNumbers?.[0] || "Default Line"})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium">
                  No carrier integrations connected. Connect Twilio, Vobiz, or Exotel in Voice Settings.
                </div>
              )}
            </div>
          )}

          {/* Recipient Phone Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">
              Destination Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+14155552671 or +919876543210 (E.164)"
              autoFocus
              required
              className="w-full px-3.5 py-2.5 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:border-slate-400 transition-all text-slate-900"
            />
            <p className="text-[10px] text-slate-400 font-medium">
              Must include country code (e.g., +1 for US, +91 for India, +44 for UK).
            </p>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2 ${callStatus === "connected"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : callStatus === "failed"
                  ? "bg-rose-50 border border-rose-200 text-rose-800"
                  : "bg-slate-50 border border-slate-200 text-slate-800"
                }`}
            >
              {callStatus === "connected" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : callStatus === "failed" ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <Loader2 className={`w-4 h-4 shrink-0 mt-0.5 animate-spin ${themeClasses.iconColor}`} />
              )}
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isDialing}
              className="text-xs font-bold"
            >
              Close
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isDialing || !phoneNumber.trim()}
              className={`text-xs font-bold ${themeClasses.primaryBg} text-white gap-1.5 shadow-sm`}
            >
              {isDialing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Dial Test Call Now</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
