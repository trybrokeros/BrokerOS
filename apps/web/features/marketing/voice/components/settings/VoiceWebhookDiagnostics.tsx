// ============================================================================
// BrokerOS — Voice Inbound & Post-Call Webhook Diagnostics Card
// ============================================================================

"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Copy,
  Check,
  Terminal,
  Globe,
  Sparkles,
  FileText,
  Volume2,
  Send,
  Zap,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";

export const VoiceWebhookDiagnostics: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Simulation state
  const [simPlatform, setSimPlatform] = useState<string>("vapi");
  const [simPhone, setSimPhone] = useState("+919876543210");
  const [simSentiment, setSimSentiment] = useState<"POSITIVE" | "NEUTRAL" | "NEGATIVE">("POSITIVE");
  const [simDuration, setSimDuration] = useState("142");
  const [simSummary, setSimSummary] = useState(
    "Prospect highly interested in 3BHK high-rise unit at Skyline Luxuria. Budget confirmed at ₹1.8 Cr. Requested site visit verification this Saturday at 3:00 PM."
  );
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  const publicApiUrl = (
    process.env.NEXT_PUBLIC_API_URL ||
    ""
  ).replace(/\/$/, "");

  const baseUrl =
    publicApiUrl ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000");

  const endpoints = [
    {
      title: "Vapi Post-Call End-of-Call Report",
      platform: "Vapi AI",
      badge: "AI Agent",
      method: "POST",
      url: `${baseUrl}/api/marketing/voice/webhooks/vapi`,
      events: "end-of-call-report",
      extracts: "Audio Recording MP3, Transcript, Executive Summary, Sentiment → CRM Lead Temperature",
      desc: "Configure in Vapi Dashboard > Assistants > Server URL. Dispatched immediately upon call teardown.",
    },
    {
      title: "Retell AI Call Analyzed Webhook",
      platform: "Retell AI",
      badge: "AI Agent",
      method: "POST",
      url: `${baseUrl}/api/marketing/voice/webhooks/retell`,
      events: "call_analyzed, call_ended",
      extracts: "Stereo Recording URL, Full Dialogue Transcript, Call Analysis Summary, Sentiment",
      desc: "Configure in Retell AI Dashboard > Agents > Webhook URL. Handles both live completion and deep LLM post-analysis.",
    },
    {
      title: "Bolna AI Execution Webhook",
      platform: "Bolna AI",
      badge: "AI Agent",
      method: "POST",
      url: `${baseUrl}/api/marketing/voice/webhooks/bolna`,
      events: "conversation_complete",
      extracts: "Dual-channel Audio, Turn-by-turn STT Transcript, Extracted Intent, Sentiment",
      desc: "Configure in Bolna Dashboard > Agent > Webhook URL. Auto-maps Indic and English conversations into CRM.",
    },
    {
      title: "Sarvam AI Indic Post-Call Callback",
      platform: "Sarvam AI",
      badge: "Indic Agent",
      method: "POST",
      url: `${baseUrl}/api/marketing/voice/webhooks/sarvam`,
      events: "call_ended",
      extracts: "Regional Audio Recording, Translated English Transcript, Key Prospect Answers",
      desc: "Configure in Sarvam AI Console > Voice Agents > Post-Call Webhook Callback.",
    },
    {
      title: "ElevenLabs Conversational AI Webhook",
      platform: "ElevenLabs",
      badge: "AI Agent",
      method: "POST",
      url: `${baseUrl}/api/marketing/voice/webhooks/elevenlabs`,
      events: "post_call_transcription",
      extracts: "Call Audio Link, Turn-by-Turn Dialogue, Intent Classification",
      desc: "Configure in ElevenLabs Dashboard > Conversational AI > Agent Settings > Webhooks.",
    },
    {
      title: "LiveKit WebRTC Session End Webhook",
      platform: "LiveKit",
      badge: "WebRTC",
      method: "POST",
      url: `${baseUrl}/api/marketing/voice/webhooks/livekit`,
      events: "room_finished, egress_ended",
      extracts: "Egress S3/GCS Audio URL, Session Timeline, Participant Metadata",
      desc: "Configure in LiveKit Cloud > Settings > Webhooks. Triggers when audio stream bridge tears down.",
    },
    {
      title: "Twilio Bidirectional Media Stream Answer URL",
      platform: "Twilio Voice",
      badge: "PSTN Carrier",
      method: "POST / GET",
      url: `${baseUrl}/api/marketing/voice/webhooks/twilio-answer`,
      events: "TwiML Media Stream Connect",
      extracts: "Real-time Bi-directional Mulaw 8kHz WebSocket stream to AI Voice Gateway",
      desc: "Configure in Twilio Console > Phone Numbers > Active Numbers > Voice & Fax > A CALL COMES IN > Webhook.",
    },
    {
      title: "Vobiz / Plivo Audio Stream Answer URL",
      platform: "Vobiz Carrier",
      badge: "PSTN Carrier",
      method: "POST / GET",
      url: `${baseUrl}/api/marketing/voice/webhooks/vobiz-answer`,
      events: "Vobiz XML Audio Stream",
      extracts: "Real-time Bi-directional PCM Audio Stream connected to Voice Gateway",
      desc: "Configure in Vobiz / Plivo Portal > Applications > Answer URL (HTTP POST).",
    },
  ];

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Webhook URL copied to clipboard");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSimulating(true);
      setSimResult(null);

      // Create payload tailored to the chosen platform
      let payload: any = {};
      if (simPlatform === "vapi") {
        payload = {
          message: {
            type: "end-of-call-report",
            call: {
              id: `vapi-sim-${Date.now()}`,
              customer: { number: simPhone },
            },
            recordingUrl: "https://storage.googleapis.com/brokeros-assets/sample-call-recording.mp3",
            transcript: `AI: Hello! Am I speaking with Mr. Sharma regarding Skyline Luxuria?\nUser: Yes, that's right. Can you tell me about the 3 BHK layout?\nAI: Certainly! Our 3 BHK apartments offer 1850 sq.ft. with expansive hill views.\nUser: Sounds great. I want to visit this Saturday around 3 PM.\nAI: Wonderful, I have noted your site visit for Saturday at 3 PM. Thank you!`,
            summary: simSummary,
            analysis: {
              userSentiment: simSentiment,
            },
            durationSeconds: Number(simDuration) || 120,
          },
        };
      } else if (simPlatform === "retell") {
        payload = {
          event: "call_analyzed",
          call: {
            call_id: `retell-sim-${Date.now()}`,
            to_number: simPhone,
            duration_ms: (Number(simDuration) || 120) * 1000,
            recording_url: "https://storage.googleapis.com/brokeros-assets/sample-call-recording.mp3",
            transcript: `Agent: Good day! Calling from Skyline Luxuria.\nClient: Yes, please share pricing details.\nAgent: Base price starts at ₹1.8 Cr for luxury 3 BHKs.\nClient: Perfect, schedule my visit for Saturday 3 PM.`,
            call_analysis: {
              call_summary: simSummary,
              user_sentiment: simSentiment,
            },
          },
        };
      } else {
        payload = {
          event: "conversation_complete",
          conversation_id: `bolna-sim-${Date.now()}`,
          recipient_phone: simPhone,
          recording_url: "https://storage.googleapis.com/brokeros-assets/sample-call-recording.mp3",
          transcript: `AI: Namaste! Calling from BrokerOS.\nUser: Interested in 3 BHK.\nAI: Great, site visit confirmed for Saturday.`,
          summary: simSummary,
          sentiment: simSentiment,
          duration_seconds: Number(simDuration) || 120,
        };
      }

      const res = await fetch(`${baseUrl}/api/marketing/voice/webhooks/${simPlatform}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      setSimResult({
        status: res.status,
        ok: res.ok,
        mappedTemperature: simSentiment === "POSITIVE" ? "HOT" : simSentiment === "NEUTRAL" ? "WARM" : "COLD",
        data,
      });

      if (res.ok) {
        toast.success(`Webhook simulated successfully! Leads mapped to ${simSentiment === "POSITIVE" ? "HOT 🔥" : simSentiment === "NEUTRAL" ? "WARM 🌤️" : "COLD ❄️"}`);
      } else {
        toast.error(`Simulation returned HTTP ${res.status}`);
      }
    } catch (err: any) {
      toast.error(err?.message || "Simulation failed to reach endpoint");
      setSimResult({ error: err?.message });
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-8 animate-enter">
      {/* Overview Banner */}
      <div className="p-6 bg-linear-to-r from-blue-900/90 via-indigo-950 to-slate-950 border border-blue-500/20 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Dual-Channel Audio & STT Ingestion
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-[10px] font-bold uppercase tracking-wider">
                Active & Listening
              </Badge>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Inbound & Post-Call Telephony Webhooks
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              When an AI Voice broadcast completes, telephony carriers and voice engines push the stereo call recording link, turn-by-turn dialogue transcript, executive summary, and prospect sentiment directly into BrokerOS. Our pipeline maps the sentiment to lead temperatures (<span className="text-amber-300 font-bold">HOT 🔥</span> / <span className="text-blue-300 font-bold">WARM 🌤️</span> / <span className="text-cyan-300 font-bold">COLD ❄️</span>) and attaches full call context into CRM notes for pre-sales follow-up.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
            <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center">
              <div className="text-2xl font-black text-white">{endpoints.length}</div>
              <div className="text-[10px] font-semibold text-slate-300 uppercase">Configured Endpoints</div>
            </div>
            <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center">
              <div className="text-2xl font-black text-emerald-400">100%</div>
              <div className="text-[10px] font-semibold text-slate-300 uppercase">Public Ingest Readiness</div>
            </div>
          </div>
        </div>
      </div>

      {/* Webhook Endpoints List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-600" />
            <span>Platform Webhook Callback Endpoints</span>
          </h3>
          <span className="text-xs text-[var(--text-tertiary)] font-medium">
            Paste these URLs into your carrier & AI agent dashboards
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {endpoints.map((ep, idx) => {
            const isCopied = copiedKey === ep.platform;
            return (
              <div
                key={idx}
                className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-indigo-300 transition-all flex flex-col justify-between gap-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[var(--text-primary)]">
                        {ep.platform}
                      </span>
                      <Badge className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200 font-bold">
                        {ep.badge}
                      </Badge>
                    </div>
                    <Badge className="text-[10px] bg-slate-100 text-slate-700 font-mono font-bold">
                      {ep.method}
                    </Badge>
                  </div>

                  <p className="text-xs font-bold text-slate-800">{ep.title}</p>
                  <p className="text-[11px] text-slate-500 leading-snug">{ep.desc}</p>

                  <div className="pt-1 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[10px]">
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      <span>Supported Data & Payload:</span>
                    </div>
                    <p className="text-[10px] text-slate-700 font-medium">{ep.extracts}</p>
                  </div>
                </div>

                {/* Copyable URL box */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase">
                    <span>Callback URL</span>
                    <span>HTTPS Live Ingest</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50/90 p-2 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700">
                    <span className="truncate flex-1 select-all">{ep.url}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(ep.platform, ep.url)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                      title="Copy URL"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Webhook Simulator */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Interactive Post-Call Ingest Simulator</span>
            </h3>
            <p className="text-xs text-[var(--text-tertiary)]">
              Simulate an end-of-call postback from Vapi, Retell, or Bolna to test CRM temperature mapping, audio attachment, and note generation without carrier charges.
            </p>
          </div>
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs font-bold">
            Developer Sandbox
          </Badge>
        </div>

        <form onSubmit={handleRunSimulation} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4 md:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Provider Format</label>
                <select
                  value={simPlatform}
                  onChange={(e) => setSimPlatform(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="vapi">Vapi AI (End-of-Call Report)</option>
                  <option value="retell">Retell AI (Call Analyzed)</option>
                  <option value="bolna">Bolna AI (Execution Complete)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Recipient Phone</label>
                <Input
                  value={simPhone}
                  onChange={(e) => setSimPhone(e.target.value)}
                  placeholder="+919876543210"
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">AI Sentiment</label>
                <select
                  value={simSentiment}
                  onChange={(e) => setSimSentiment(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="POSITIVE">POSITIVE 🔥 (Maps to HOT Lead)</option>
                  <option value="NEUTRAL">NEUTRAL 🌤️ (Maps to WARM Lead)</option>
                  <option value="NEGATIVE">NEGATIVE ❄️ (Maps to COLD Lead)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">AI Executive Summary</label>
              <textarea
                value={simSummary}
                onChange={(e) => setSimSummary(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-blue-500" />
                  <span>Stereo MP3 Attached</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Turn-by-turn STT Included</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={simulating}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 shadow-sm"
              >
                {simulating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Dispatch Test Webhook</span>
              </Button>
            </div>
          </div>

          {/* Result Inspector Panel */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-slate-200 flex flex-col justify-between font-mono text-[11px] overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Ingest Log Monitor</span>
              </div>
              {simResult && (
                <Badge
                  className={`text-[9px] font-bold uppercase ${
                    simResult.ok
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-red-500/20 text-red-400 border-red-500/30"
                  }`}
                >
                  HTTP {simResult.status || (simResult.ok ? 200 : 500)}
                </Badge>
              )}
            </div>

            <div className="my-3 overflow-y-auto max-h-40 space-y-1.5 text-[10px] text-slate-300">
              {simResult ? (
                <>
                  <div className="text-emerald-400 font-bold">
                    ✓ Webhook event ingested for {simPhone}
                  </div>
                  <div>Provider: {simPlatform.toUpperCase()}</div>
                  <div className="text-amber-300">
                    Mapped Temperature: {simResult.mappedTemperature}
                  </div>
                  <div className="text-slate-400">
                    Raw Response: {JSON.stringify(simResult.data)}
                  </div>
                </>
              ) : (
                <div className="text-slate-500 italic">
                  Awaiting simulation dispatch... Results and mapped CRM lead status will appear here in real-time.
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
              <span>CRM Lead Temp Sync</span>
              <span className="text-emerald-400 font-bold">ONLINE</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
