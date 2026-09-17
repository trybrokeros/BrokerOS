"use client";

import React from "react";
import Link from "next/link";
import { Radio, Plus, Sparkles, RefreshCw, CheckCircle2 } from "lucide-react";
import { VOICE_AGENT_PLATFORMS } from "@brokeros/constants";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { VoiceAgentIntegrationRecord } from "@/features/marketing/types";

export interface AgentPlatformSelectorProps {
  selectedPlatformId?: string;
  onSelectPlatform: (platformId: string) => void;
  agentIntegrations: VoiceAgentIntegrationRecord[];
  dynamicAssistants?: any[];
  selectedAssistantId?: string;
  onApplyAssistant?: (asst: any) => void;
  onOpenCreateModal?: () => void;
  onSyncAssistant?: () => void;
  isSyncing?: boolean;
  lastSyncedTime?: string | null;
  currentPlatform?: string;
}

export function AgentPlatformSelector({
  selectedPlatformId,
  onSelectPlatform,
  agentIntegrations = [],
  dynamicAssistants = [],
  selectedAssistantId,
  onApplyAssistant,
  onOpenCreateModal,
  onSyncAssistant,
  isSyncing = false,
  lastSyncedTime = null,
  currentPlatform = "VAPI",
}: AgentPlatformSelectorProps) {
  const activeAssistant = dynamicAssistants.find((a) => a.id === selectedAssistantId);

  return (
    <div className="space-y-4">
      {/* Platform Cards Header */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-extrabold text-[var(--text-primary)]">
          Active AI Voice Platform <span className="text-rose-500">*</span>
        </label>
        <Link
          href="/dashboard/marketing/voice/settings"
          className="text-[11px] font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          <span>Connect New AI Platform</span>
        </Link>
      </div>

      {/* Platform Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {agentIntegrations.map((agent) => {
          const isSelected = selectedPlatformId === agent.id;
          const platformInfo = (VOICE_AGENT_PLATFORMS as any)[agent.platform] || {
            name: agent.platform,
            badge: "Voice Engine",
          };

          return (
            <button
              key={agent.id}
              type="button"
              onClick={() => onSelectPlatform(agent.id)}
              className={`p-4 rounded-2xl border text-left transition-all relative ${
                isSelected
                  ? "border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20"
                  : "border-slate-200/80 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xs font-extrabold">
                  <Radio className="w-4 h-4" />
                </div>
                <Badge variant="default" className="text-[9px]">
                  {platformInfo.badge}
                </Badge>
              </div>

              <h4 className="text-xs font-extrabold text-[var(--text-primary)]">{agent.name}</h4>
              <p className="text-[10px] text-purple-600 font-bold uppercase mt-0.5">
                {agent.platform} Engine
              </p>
            </button>
          );
        })}

        {agentIntegrations.length === 0 && (
          <div className="col-span-4 p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Radio className="w-6 h-6 mx-auto mb-1.5 text-slate-400" />
            <p className="text-xs font-bold text-slate-700">No AI Platforms Connected</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Connect your Vapi, Retell, ElevenLabs, or Sarvam keys in Settings.
            </p>
            <Link href="/dashboard/marketing/voice/settings">
              <Button size="sm" variant="outline" className="mt-3 text-xs">
                Open Voice Gateways Settings
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Remote Agent Management Bar */}
      {(currentPlatform === "VAPI" || currentPlatform === "RETELL" || currentPlatform === "BOLNA") && (
        <div className="bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-white p-5 rounded-2xl border border-purple-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[var(--text-primary)] flex items-center gap-2">
                  <span>Remote {currentPlatform === "RETELL" ? "Retell" : "Vapi"} Assistant Management</span>
                  <Badge variant="default" className="text-[9px] bg-purple-100 text-purple-700 border-purple-200">
                    {dynamicAssistants.length} Found in Account
                  </Badge>
                </h4>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                  Choose an existing assistant or create a new one directly on your {currentPlatform} dashboard.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onOpenCreateModal && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={onOpenCreateModal}
                  className="text-xs font-bold border-purple-300 text-purple-700 hover:bg-purple-100/60 gap-1.5 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create New {currentPlatform === "RETELL" ? "Retell" : "Vapi"} Agent</span>
                </Button>
              )}

              {onSyncAssistant && (
                <Button
                  type="button"
                  size="sm"
                  onClick={onSyncAssistant}
                  disabled={isSyncing}
                  className="text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white gap-1.5 shadow-2xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                  <span>{isSyncing ? "Syncing to Provider..." : `Save & Sync to ${currentPlatform}`}</span>
                </Button>
              )}
            </div>
          </div>

          {/* Assistant Selector Dropdown & Active Details */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-1">
            <div className="sm:col-span-8 space-y-1">
              <label className="text-[11px] font-bold text-slate-700">
                Selected Remote Assistant
              </label>
              <select
                value={selectedAssistantId || ""}
                onChange={(e) => {
                  const target = dynamicAssistants.find((a) => a.id === e.target.value);
                  if (target && onApplyAssistant) {
                    onApplyAssistant(target);
                  }
                }}
                className="w-full px-3 py-2 text-xs font-semibold bg-white border border-purple-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                <option value="">-- Select or Create a Remote Assistant --</option>
                {dynamicAssistants.map((asst) => (
                  <option key={asst.id} value={asst.id}>
                    {asst.name} (ID: {asst.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-4 flex items-center justify-between sm:justify-end gap-2 text-[11px] text-slate-500 font-medium">
              {lastSyncedTime && (
                <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Synced at {lastSyncedTime}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
