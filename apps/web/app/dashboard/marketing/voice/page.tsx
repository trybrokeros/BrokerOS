"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Phone,
  PhoneCall,
  Clock,
  Flame,
  Radio,
  Plus,
  Settings,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Building,
  ArrowRight,
} from "lucide-react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { StatCards } from "@/components/dashboard/StatCards";
import { Button } from "@/components/ui/Button";
import { VoiceCampaignListTable } from "@/features/marketing/voice/components/VoiceCampaignListTable";
import type { VoiceCampaignItem } from "@/features/marketing/types";

export default function VoiceMarketingHubPage() {
  const [campaigns, setCampaigns] = useState<VoiceCampaignItem[]>([]);
  const [telephonyIntegrations, setTelephonyIntegrations] = useState<any[]>([]);
  const [agentIntegrations, setAgentIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [campRes, telRes, agentRes] = await Promise.all([
        fetch(`${baseUrl}/api/marketing/voice/campaigns`),
        fetch(`${baseUrl}/api/marketing/voice/integrations/telephony`),
        fetch(`${baseUrl}/api/marketing/voice/integrations/agents`),
      ]);

      if (campRes.ok) {
        const data = await campRes.json();
        setCampaigns(data.items || []);
      } else {
        setCampaigns([]);
      }

      if (telRes.ok) {
        const telData = await telRes.json();
        setTelephonyIntegrations(Array.isArray(telData) ? telData : []);
      }

      if (agentRes.ok) {
        const agentData = await agentRes.json();
        setAgentIntegrations(Array.isArray(agentData) ? agentData : []);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load voice campaigns");
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [baseUrl]);

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm("Are you sure you want to delete this voice campaign?")) return;
    try {
      await fetch(`${baseUrl}/api/marketing/voice/campaigns/${id}`, { method: "DELETE" });
      loadData();
    } catch (err) {
      console.error("Failed to delete campaign", err);
    }
  };

  const activeCarrier = telephonyIntegrations.find((i) => i.isDefault && i.isActive) || telephonyIntegrations.find((i) => i.isActive) || telephonyIntegrations[0];
  const activeAgent = agentIntegrations.find((i) => i.isDefault && i.isActive) || agentIntegrations.find((i) => i.isActive) || agentIntegrations[0];

  // KPIs
  const totalDials = campaigns.reduce((acc, c) => acc + (c.totalRecipients || 0), 0);
  const totalCompleted = campaigns.reduce((acc, c) => acc + (c.completedCalls || 0), 0);
  const totalTalkTime = campaigns.reduce((acc, c) => acc + (c.totalDurationSec || 0), 0);
  const completionRate = totalDials > 0 ? ((totalCompleted / totalDials) * 100).toFixed(1) : "0.0";

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    return `${m} mins`;
  };

  const statItems = [
    {
      label: "Total Voice Dials",
      value: totalDials.toLocaleString(),
      icon: Phone,
      accent: "oklch(0.55 0.22 280)",
      sub: `${totalCompleted.toLocaleString()} completed conversations`,
    },
    {
      label: "Conversation Rate",
      value: `${completionRate}%`,
      icon: PhoneCall,
      accent: "oklch(0.60 0.19 145)",
      sub: "Pick-up & qualification rate",
    },
    {
      label: "Total Spoken Talk Time",
      value: formatDuration(totalTalkTime),
      icon: Clock,
      accent: "oklch(0.65 0.20 40)",
      sub: "Human-grade conversational minutes",
    },
    {
      label: "Active Outbound Campaigns",
      value: campaigns.filter((c) => c.status === "PROCESSING").length.toString(),
      icon: Radio,
      accent: "oklch(0.55 0.22 310)",
      sub: `${campaigns.length} total campaigns created`,
    },
  ];

  return (
    <DashboardPageWrapper
      loading={loading}
      error={error}
      title="AI Voice Agent & Telephony Hub"
      subtitle="Ultra-realistic AI voice calling campaigns with multi-carrier telephony and sentiment intelligence."
      headerRight={
        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/marketing">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs font-bold">
              <span>&larr; Marketing Hub</span>
            </Button>
          </Link>
          <Link href="/dashboard/marketing/voice/settings">
            <Button variant="outline" size="sm" className="gap-2 text-xs font-bold">
              <Settings className="w-3.5 h-3.5" />
              <span>Gateways & AI Engines</span>
            </Button>
          </Link>
          <Link href="/dashboard/marketing/voice/campaigns/new">
            <Button variant="default" size="sm" className="gap-2 text-xs font-bold shadow-sm">
              <Plus className="w-3.5 h-3.5" />
              <span>New Voice Campaign</span>
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* ── Active Route & AI Gateway Status Banner ── */}
        {activeCarrier && activeAgent ? (
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-[var(--text-primary)]">
                  Active Voice Line: {activeCarrier.name} ({activeCarrier.provider}) • AI Reasoning: {activeAgent.name} ({activeAgent.platform})
                </div>
                <div className="text-[11px] font-medium text-[var(--text-tertiary)]">
                  PSTN Carrier Trunk & Conversational Speech Engine connected • Real-time sentiment & auto-transcription enabled.
                </div>
              </div>
            </div>
            <Link href="/dashboard/marketing/voice/settings">
              <Button variant="outline" size="sm" className="text-xs font-bold gap-1.5">
                <span>Manage Gateways</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="p-4 bg-amber-50/90 rounded-2xl border border-amber-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 shadow-xs">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-amber-900">
                  Carrier Trunk or AI Engine Needs Setup
                </div>
                <div className="text-[11px] font-medium text-amber-800">
                  Connect your PSTN carrier (Twilio, Vobiz, Exotel) and conversational platform (Vapi, Retell, ElevenLabs, Sarvam) to place live calls.
                </div>
              </div>
            </div>
            <Link href="/dashboard/marketing/voice/settings">
              <Button variant="default" size="sm" className="text-xs font-bold gap-1.5">
                <span>Connect Gateways</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        )}

        {/* KPI Stat Cards */}
        <StatCards items={statItems} />

        {/* Campaign List Table */}
        <VoiceCampaignListTable
          campaigns={campaigns}
          onDelete={handleDeleteCampaign}
          loading={loading}
        />
      </div>
    </DashboardPageWrapper>
  );
}
