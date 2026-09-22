"use client";

import React, { useState, useEffect, use } from "react";
import { toast } from "sonner";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  PhoneCall,
  Clock,
  Radio,
  Flame,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Building,
} from "lucide-react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { StatCards } from "@/components/dashboard/StatCards";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { VoiceCampaignFunnel } from "@/features/marketing/voice/components/VoiceCampaignFunnel";
import { VoiceCallLogsTable } from "@/features/marketing/voice/components/VoiceCallLogsTable";
import type { VoiceAnalyticsSummary, VoiceRecipientItem } from "@/features/marketing/types";

export default function VoiceCampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const campaignId = resolvedParams.id;

  const [analytics, setAnalytics] = useState<VoiceAnalyticsSummary | null>(null);
  const [recipients, setRecipients] = useState<VoiceRecipientItem[]>([]);
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);

  const loadData = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const [analyticsRes, campaignRes, recipRes] = await Promise.all([
        fetch(`/api/marketing/voice/campaigns/${campaignId}/analytics`),
        fetch(`/api/marketing/voice/campaigns/${campaignId}`),
        fetch(`/api/marketing/voice/campaigns/${campaignId}/recipients?limit=100`),
      ]);

      if (analyticsRes.ok) {
        const aData = await analyticsRes.json();
        setAnalytics(aData);
      }

      if (campaignRes.ok) {
        const cData = await campaignRes.json();
        setCampaign(cData);
      }

      if (recipRes.ok) {
        const rData = await recipRes.json();
        setRecipients(rData.items || []);
      }
    } catch (err) {
      console.error("Failed to load voice campaign details:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();

    // Auto-poll if campaign is PROCESSING
    const interval = setInterval(() => {
      if (analytics?.status === "PROCESSING" || campaign?.status === "PROCESSING") {
        loadData(true);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [campaignId, analytics?.status, campaign?.status]);

  const handleDispatchNow = async () => {
    if (!campaignId) return;
    setIsDispatching(true);
    try {
      const res = await fetch(`/api/marketing/voice/campaigns/${campaignId}/dispatch`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Voice campaign dispatch triggered successfully");
        await loadData(true);
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Failed to trigger voice dispatch");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to trigger voice dispatch");
    } finally {
      setIsDispatching(false);
    }
  };

  const handlePromoteRecipient = async (recipientId: string) => {
    try {
      const res = await fetch(`/api/marketing/voice/recipients/${recipientId}/promote`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.message || "Failed to promote recipient");
      }
      toast.success("Prospect converted to CRM lead successfully");
      await loadData(true);
    } catch (err: any) {
      toast.error(err?.message || "Failed to convert voice prospect to CRM lead");
    }
  };

  if (loading && !analytics) {
    return (
      <DashboardPageWrapper loading={true} title="Loading Voice Campaign..." subtitle="Fetching analytics data">
        <div className="py-20 text-center text-slate-400">
          <Phone className="w-8 h-8 mx-auto mb-2 animate-bounce text-indigo-600" />
          <p className="text-xs font-bold">Loading live telemetry stream...</p>
        </div>
      </DashboardPageWrapper>
    );
  }

  if (!analytics) {
    return (
      <DashboardPageWrapper loading={false} title="Campaign Not Found" subtitle="Could not locate voice broadcast">
        <div className="py-12 text-center">
          <p className="text-sm font-bold text-slate-600">This campaign could not be found or has been deleted.</p>
          <Link href="/dashboard/marketing/voice" className="mt-4 inline-block">
            <Button size="sm">Back to Voice Hub</Button>
          </Link>
        </div>
      </DashboardPageWrapper>
    );
  }

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}m ${s}s`;
  };

  const statItems = [
    {
      label: "Total Audience Dials",
      value: analytics.totalRecipients.toLocaleString(),
      icon: Phone,
      accent: "oklch(0.55 0.22 280)",
      sub: `${analytics.completedCalls} answered · ${analytics.failedCalls} failed`,
    },
    {
      label: "Pick-up / Connection Rate",
      value: `${analytics.completionRate}%`,
      icon: PhoneCall,
      accent: "oklch(0.60 0.19 145)",
      sub: "Connected carrier calls",
    },
    {
      label: "Average Spoken Duration",
      value: formatDuration(analytics.averageDurationSec),
      icon: Clock,
      accent: "oklch(0.65 0.20 40)",
      sub: `Total: ${formatDuration(analytics.totalDurationSec)}`,
    },
    {
      label: "Positive Sentiment Leads",
      value: analytics.sentimentBreakdown.positive.toString(),
      icon: Flame,
      accent: "oklch(0.55 0.22 310)",
      sub: "Qualified for immediate sales follow-up",
    },
  ];

  return (
    <DashboardPageWrapper
      loading={false}
      title={analytics.title}
      subtitle={`Outbound AI Voice Campaign Analytics & Telemetry · Carrier: ${analytics.telephonyType} · Platform: ${analytics.agentPlatform}`}
      headerRight={
        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/marketing/voice">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voice Hub</span>
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="gap-1.5 text-xs font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          {campaign && (campaign.status === "DRAFT" || campaign.status === "SCHEDULED") && (
            <Button
              variant="default"
              size="sm"
              onClick={handleDispatchNow}
              disabled={isDispatching}
              className="gap-1.5 text-xs font-bold shadow-sm"
            >
              <PhoneCall className={`w-3.5 h-3.5 ${isDispatching ? "animate-spin" : ""}`} />
              <span>{isDispatching ? "Calling..." : "Dispatch Calls Now"}</span>
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6 max-w-6xl">
        {/* Campaign Metadata Bar */}
        {campaign && (
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-extrabold ${campaign.status === "PROCESSING"
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : campaign.status === "COMPLETED"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
              >
                {campaign.status}
              </span>

              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)]">
                <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                  {campaign.agentIntegration?.platform || campaign.agentPlatformId || "VAPI"} AI
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  Line: {campaign.telephony?.provider || campaign.callerIdNumber || "PSTN"}
                </span>
              </div>

              {campaign.project && (
                <div className="inline-flex items-center gap-1 text-xs font-bold text-[var(--brand-700)] bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200/80">
                  <Building className="w-3.5 h-3.5 text-[var(--brand-600)]" />
                  <span>{campaign.project.name}</span>
                </div>
              )}

              <div className="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date(campaign.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {campaign.voiceName && (
              <div className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                Voice: {campaign.voiceName} ({campaign.voiceProvider})
              </div>
            )}
          </div>
        )}

        {/* KPI Stat Cards */}
        <StatCards items={statItems} />

        {/* 4-Stage Conversion Funnel */}
        <VoiceCampaignFunnel analytics={analytics} />

        {/* Detailed Call Recordings & Transcript Table */}
        <VoiceCallLogsTable
          recipients={recipients}
          campaignId={campaignId}
          campaignTitle={analytics.title}
          onPromote={handlePromoteRecipient}
          onRefresh={() => loadData(true)}
        />
      </div>
    </DashboardPageWrapper>
  );
}
