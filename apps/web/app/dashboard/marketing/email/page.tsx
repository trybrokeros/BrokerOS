"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  Plus,
  Send,
  CheckCircle2,
  Eye,
  MousePointer,
  Settings,
  Sparkles,
  Zap,
  Workflow,
  ArrowLeft,
  ArrowRight,
  Inbox,
} from "lucide-react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { StatCards } from "@/components/dashboard/StatCards";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CampaignListTable } from "@/features/marketing/components/CampaignListTable";
import type { CampaignItem } from "@/features/marketing/types";

export default function EmailMarketingDashboard() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const res = await fetch(`${baseUrl}/api/marketing/campaigns`);
        if (res.ok) {
          const data = await res.json();
          setCampaigns(data?.items || []);
        } else {
          setCampaigns([]);
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load email campaigns");
        setCampaigns([]);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [baseUrl]);

  const totalSent = campaigns.reduce((acc, c) => acc + (c.sentCount || 0), 0);
  const totalDelivered = campaigns.reduce((acc, c) => acc + (c.deliveredCount || 0), 0);
  const totalOpened = campaigns.reduce((acc, c) => acc + (c.openedCount || 0), 0);
  const totalClicked = campaigns.reduce((acc, c) => acc + (c.clickedCount || 0), 0);

  const avgOpenRate = totalDelivered > 0 ? ((totalOpened / totalDelivered) * 100).toFixed(1) : "0.0";
  const avgClickRate = totalDelivered > 0 ? ((totalClicked / totalDelivered) * 100).toFixed(1) : "0.0";

  const statItems = [
    {
      label: "Total Emails Sent",
      value: totalSent.toLocaleString(),
      icon: Send,
      accent: "oklch(0.535 0.235 275)",
      sub: "Across all broadcasts",
    },
    {
      label: "Delivered Total",
      value: totalDelivered.toLocaleString(),
      icon: CheckCircle2,
      accent: "oklch(0.42 0.16 145)",
      sub: totalSent > 0 ? `${((totalDelivered / totalSent) * 100).toFixed(1)}% Deliverability rate` : "0.0% Deliverability rate",
    },
    {
      label: "Average Open Rate",
      value: `${avgOpenRate}%`,
      icon: Eye,
      accent: "oklch(0.48 0.18 240)",
      sub: `${totalOpened.toLocaleString()} total opens`,
    },
    {
      label: "Average Click Rate",
      value: `${avgClickRate}%`,
      icon: MousePointer,
      accent: "oklch(0.50 0.17 80)",
      sub: `${totalClicked.toLocaleString()} link clicks`,
    },
  ];

  return (
    <DashboardPageWrapper
      loading={isLoading}
      error={error}
      title="Email Marketing Engine"
      subtitle="Broadcast targeted real estate campaigns, project launch brochures, and CP commission updates."
      headerRight={
        <div className="flex items-center gap-2">
          <Link href="/dashboard/marketing">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Marketing Hub</span>
            </Button>
          </Link>
          <Link href="/dashboard/marketing/email/inbox">
            <Button variant="outline" size="sm" className="gap-2 text-xs font-bold text-blue-600 border-blue-200 hover:bg-blue-50">
              <Inbox className="w-3.5 h-3.5" />
              <span>Live Inbox</span>
            </Button>
          </Link>
          <Link href="/dashboard/marketing/email/flows">
            <Button variant="outline" size="sm" className="gap-2 text-xs font-bold">
              <Workflow className="w-3.5 h-3.5 text-purple-600" />
              <span>Interactive Flows</span>
            </Button>
          </Link>
          <Link href="/dashboard/marketing/email/settings">
            <Button variant="outline" size="sm" className="gap-2 text-xs font-bold">
              <Settings className="w-3.5 h-3.5" />
              <span>Settings & Tools</span>
            </Button>
          </Link>
          <Link href="/dashboard/marketing/email/campaigns/new">
            <Button variant="default" size="sm" className="gap-2 text-xs font-bold shadow-sm">
              <Plus className="w-3.5 h-3.5" />
              <span>New Campaign</span>
            </Button>
          </Link>
        </div>
      }
    >
      {/* ── Subnavigation Tabs ── */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200/80 rounded-2xl overflow-x-auto shadow-2xs">
        <Link
          href="/dashboard/marketing/email/inbox"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-all"
        >
          <Inbox className="w-3.5 h-3.5 text-blue-600" />
          <span>Live Inbox</span>
        </Link>
        <Link
          href="/dashboard/marketing/email"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white shadow-xs"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Broadcast Campaigns</span>
        </Link>
        <Link
          href="/dashboard/marketing/email/flows"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-all"
        >
          <Workflow className="w-3.5 h-3.5 text-purple-600" />
          <span>2-Way Automation Flows</span>
        </Link>
        <Link
          href="/dashboard/marketing/email/settings"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-all"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Settings, AI & Webhooks</span>
        </Link>
      </div>

      {/* ── System Engine Status Banner ── */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-600)] shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-[var(--text-primary)]">
              BrokerOS Master Email Engine (AWS SES + SendGrid + Brevo + Mailchimp)
            </div>
            <div className="text-[11px] font-medium text-[var(--text-tertiary)]">
              High inbox placement, automated SPF/DKIM verification, and 2-way AI autoresponder flows active.
            </div>
          </div>
        </div>
        <Link href="/dashboard/marketing/email/flows">
          <Button variant="outline" size="sm" className="text-xs font-bold gap-1.5">
            <span>Configure Reply Flows</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* ── Metric KPI Cards ── */}
      <StatCards items={statItems} />

      {/* ── Campaigns Table ── */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-[var(--text-primary)]">
              Email Broadcast History
            </h2>
            <p className="text-xs font-medium text-[var(--text-tertiary)]">
              {campaigns.length} campaigns dispatched across CRM leads and uploaded audiences.
            </p>
          </div>
          <Link href="/dashboard/marketing/email/campaigns/new">
            <Button variant="outline" size="sm" className="text-xs font-bold gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--brand-600)]" />
              <span>Create Campaign</span>
            </Button>
          </Link>
        </div>

        <CampaignListTable campaigns={campaigns} isLoading={isLoading} />
      </div>
    </DashboardPageWrapper>
  );
}
