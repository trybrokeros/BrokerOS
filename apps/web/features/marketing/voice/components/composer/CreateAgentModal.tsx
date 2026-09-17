"use client";

import React, { useState } from "react";
import { X, Sparkles, Loader2, Bot } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: string; // "VAPI" | "RETELL" | "ELEVENLABS" | "BOLNA"
  agentPlatformId?: string;
  apiBaseUrl?: string;
  onAgentCreated: (assistant: any) => void;
}

export function CreateAgentModal({
  isOpen,
  onClose,
  platform,
  agentPlatformId,
  apiBaseUrl = "",
  onAgentCreated,
}: CreateAgentModalProps) {
  const [agentName, setAgentName] = useState("");
  const [personaType, setPersonaType] = useState<"luxury" | "qualifier" | "followup" | "blank">("luxury");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const platformDisplayName =
    platform === "RETELL"
      ? "Retell"
      : platform === "ELEVENLABS"
      ? "ElevenLabs"
      : "Vapi";

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentName.trim()) {
      setErrorMsg("Please enter a name for the agent.");
      return;
    }
    if (!agentPlatformId) {
      setErrorMsg("No active AI voice platform integration selected.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const endpoint = `${apiBaseUrl}/api/marketing/voice/integrations/agents/${agentPlatformId}/assistants`;

      let scriptPrompt = "You are an intelligent luxury real estate sales advisor. You represent our residential developments and assist clients with project details, floor plans, amenities, and site visit scheduling.";
      let firstMessage = "Hello! I am calling from BrokerOS regarding your luxury property inquiry. Am I speaking with the property owner?";

      if (personaType === "qualifier") {
        scriptPrompt = "You are an assertive, professional sales development representative qualifying buyer budget, preferred unit type (2BHK/3BHK/Penthouse), and investment timeline.";
        firstMessage = "Hi there! I am following up on your real estate inquiry. Are you currently exploring properties for personal living or investment?";
      } else if (personaType === "followup") {
        scriptPrompt = "You are a warm relationship manager following up on a recent site visit or brochure download. Offer to schedule a callback with the senior sales director.";
        firstMessage = "Good day! I am checking in regarding your recent site visit. Would you like me to connect you with our project director?";
      } else if (personaType === "blank") {
        scriptPrompt = "You are a helpful AI voice assistant.";
        firstMessage = "Hello! How can I assist you today?";
      }

      const payload = {
        name: agentName.trim(),
        config: {
          llmModel: "gpt-4o-mini",
          scriptPrompt,
          firstMessage,
          voiceProvider: "11labs",
          voiceId: "21m00Tcm4TlvDq8ikWAM",
          transcriberModel: "nova-3",
          transcriberLanguage: "en",
          maxTurnSilenceMs: 400,
          voiceSpeed: 1.0,
          backgroundSound: "off",
          silenceTimeoutSeconds: 30,
          maxDurationSeconds: 600,
        },
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || `Failed to create agent on ${platform}`);
      }

      const createdAssistant = await res.json();
      onAgentCreated(createdAssistant);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || `Failed to create remote agent on ${platform}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200/80 shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                New {platformDisplayName} Agent
              </h3>
              <p className="text-[11px] font-medium text-slate-500">
                Create a new remote assistant in your {platformDisplayName} account.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleCreate} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
              {errorMsg}
            </div>
          )}

          {/* Agent Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">
              Agent Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="e.g. Signature Towers Luxury Concierge"
              autoFocus
              required
              className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-slate-900"
            />
          </div>

          {/* Starter Preset */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">
              Starter Persona Blueprint
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "luxury", label: "Luxury Sales Advisor", desc: "Warm & Consultative" },
                { id: "qualifier", label: "Cold Lead Qualifier", desc: "Budget & Timeline" },
                { id: "followup", label: "Site Visit Follow-up", desc: "Closing & Booking" },
                { id: "blank", label: "Blank Slate", desc: "Custom Architecture" },
              ].map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setPersonaType(preset.id as any)}
                  className={`p-2.5 text-left rounded-xl border transition-all ${
                    personaType === preset.id
                      ? "border-purple-600 bg-purple-50/50 text-purple-900 ring-2 ring-purple-500/20"
                      : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <p className="text-xs font-bold leading-tight">{preset.label}</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">{preset.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !agentName.trim()}
              className="text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white gap-1.5 shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating on {platform}...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create Agent</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
