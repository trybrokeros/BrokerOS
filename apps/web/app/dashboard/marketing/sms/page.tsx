"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Plus,
  Send,
  CheckCircle2,
  MousePointerClick,
  Layers,
  Settings,
  Sparkles,
  Zap,
  ArrowLeft,
  ArrowRight,
  Inbox,
  Workflow,
} from "lucide-react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { StatCards } from "@/components/dashboard/StatCards";
import { Button } from "@/components/ui/Button";
import { SmsCampaignListTable } from "@/features/marketing/components/SmsCampaignListTable";
import type { SmsCampaignItem } from "@/features/marketing/types";

export default function SmsMarketingDashboard() {
  const [campaigns, setCampaigns] = useState<SmsCampaignItem[]>([]);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const [campRes, intRes] = await Promise.all([
          fetch(`${baseUrl}/api/marketing/sms/campaigns`),
          fetch(`${baseUrl}/api/marketing/sms/integrations`),
        ]);

        if (campRes.ok) {
          const data = await campRes.json();
          const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
          setCampaigns(items);
        } else {
          setCampaigns([]);
        }

        if (intRes.ok) {
          const intData = await intRes.json();
          setIntegrations(Array.isArray(intData) ? intData : []);
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load SMS campaigns");
        setCampaigns([]);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [baseUrl]);

  const activeGateway =
    integrations.find((i) => i.isDefault && i.isActive) ||
    integrations.find((i) => i.isActive) ||
    integrations[0];

  const totalSent = campaigns.reduce((acc, c) => acc + (c.sentCount || 0), 0);
  const totalDelivered = campaigns.reduce((acc, c) => acc + (c.deliveredCount || 0), 0);
  const totalClicked = campaigns.reduce((acc, c) => acc + (c.clickedCount || 0), 0);
  const totalSegments = campaigns.reduce((acc, c) => acc + (c.totalSegmentsSent || 0), 0);

  const avgDeliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : "0.0";
  const avgClickRate = totalDelivered > 0 ? ((totalClicked / totalDelivered) * 100).toFixed(1) : "0.0";

  const statItems = [
    {
      label: "Total SMS Dispatched",
      value: totalSent.toLocaleString(),
      icon: Send,
      accent: "oklch(0.535 0.235 275)",
      sub: "Across all carrier routes",
    },
    {
      label: "Carrier Delivered",
      value: totalDelivered.toLocaleString(),
      icon: CheckCircle2,
      accent: "oklch(0.42 0.16 145)",
      sub: totalSent > 0 ? `${avgDeliveryRate}% Deliverability rate` : "0.0% Deliverability rate",
    },
    {
      label: "Shortlink CTR",
      value: `${avgClickRate}%`,
      icon: MousePointerClick,
      accent: "oklch(0.50 0.17 80)",
      sub: `${totalClicked.toLocaleString()} link clicks`,
    },
    {
      label: "Total Segments Used",
      value: totalSegments.toLocaleString(),
      icon: Layers,
      accent: "oklch(0.60 0.19 45)",
      sub: "GSM-7 & Unicode combined",
    },
  ];

  return (
    <DashboardPageWrapper
      loading={isLoading}
      error={error}
      title="SMS Marketing Engine"
      subtitle="Broadcast high-speed bulk SMS alerts, DLT template notifications, and dynamic trackable brochure links."
      headerRight={
        <div className="flex items-center gap-2">
          <Link href="/dashboard/marketing">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs font-bold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Marketing Hub</span>
            </Button>
          </Link>
          <Link href="/dashboard/marketing/sms/inbox">
            <Button variant="outline" size="sm" className="gap-2 text-xs font-bold text-blue-600 border-blue-200 hover:bg-blue-50">
              <Inbox className="w-3.5 h-3.5" />
              <span>Live Inbox</span>
            </Button>
          </Link>
          <Link href="/dashboard/marketing/sms/flows">
            <Button variant="outline" size="sm" className="gap-2 text-xs font-bold text-purple-600 border-purple-200 hover:bg-purple-50">
              <Workflow className="w-3.5 h-3.5" />
              <span>Interactive Flows</span>
            </Button>
          </Link>
          <Link href="/dashboard/marketing/sms/settings">
            <Button variant="outline" size="sm" className="gap-2 text-xs font-bold">
              <Settings className="w-3.5 h-3.5" />
              <span>Settings & Tools</span>
            </Button>
          </Link>
          <Link href="/dashboard/marketing/sms/campaigns/new">
            <Button variant="default" size="sm" className="gap-2 text-xs font-bold shadow-sm bg-amber-500 hover:bg-amber-600 text-slate-950">
              <Plus className="w-3.5 h-3.5" />
              <span>New SMS Campaign</span>
            </Button>
          </Link>
        </div>
      }
    >
      {/* ── Subnavigation Tabs ── */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200/80 rounded-2xl overflow-x-auto shadow-2xs">
        <Link
          href="/dashboard/marketing/sms/inbox"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-all"
        >
          <Inbox className="w-3.5 h-3.5 text-blue-600" />
          <span>Live Team Inbox</span>
        </Link>
        <Link
          href="/dashboard/marketing/sms"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-slate-950 shadow-xs font-extrabold"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Broadcast Campaigns</span>
        </Link>
        <Link
          href="/dashboard/marketing/sms/flows"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-all"
        >
          <Workflow className="w-3.5 h-3.5 text-purple-600" />
          <span>2-Way Automation Flows</span>
        </Link>
        <Link
          href="/dashboard/marketing/sms/settings"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-all"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Gateways, Numbers & AI</span>
        </Link>
      </div>

      {/* ── Active Gateway Status Banner ── */}
      {activeGateway ? (
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-[var(--text-primary)]">
                Active SMS Route: {activeGateway.name} ({activeGateway.provider}) — Sender: <span className="font-mono text-emerald-700">{activeGateway.fromSender}</span>
              </div>
              <div className="text-[11px] font-medium text-[var(--text-tertiary)]">
                Carrier connected • Multi-pool phone parallelism, automated handset DLR callbacks, TRAI DLT headers & shortlink tracking active.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/marketing/sms/flows">
              <Button variant="outline" size="sm" className="text-xs font-bold gap-1.5">
                <span>Configure Reply Flows</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
            <Link href="/dashboard/marketing/sms/settings">
              <Button variant="outline" size="sm" className="text-xs font-bold">
                Manage Gateways
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-amber-50/90 rounded-2xl border border-amber-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 shadow-xs">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-amber-900">
                No SMS Gateway Connected
              </div>
              <div className="text-[11px] font-medium text-amber-800">
                SMS broadcasts require a connected carrier account. Connect Twilio, AWS SNS, Sinch, or Gupshup to send messages.
              </div>
            </div>
          </div>
          <Link href="/dashboard/marketing/sms/settings">
            <Button variant="default" size="sm" className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 gap-1.5">
              <span>Connect Gateway</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* ── Metric KPI Cards ── */}
      <StatCards items={statItems} />

      {/* ── Campaigns Table ── */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-[var(--text-primary)]">
              SMS Broadcast History
            </h2>
            <p className="text-xs font-medium text-[var(--text-tertiary)]">
              {campaigns.length} campaigns dispatched across CRM leads and uploaded audiences.
            </p>
          </div>
          <Link href="/dashboard/marketing/sms/campaigns/new">
            <Button variant="outline" size="sm" className="text-xs font-bold gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Create Campaign</span>
            </Button>
          </Link>
        </div>

        <SmsCampaignListTable campaigns={campaigns} isLoading={isLoading} />
      </div>
    </DashboardPageWrapper>
  );
}
