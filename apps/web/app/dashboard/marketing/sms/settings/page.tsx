// ============================================================================
// BrokerOS — SMS Engine Settings (Gateways, AI Concierge, Tags, Inbound Webhooks)
// ============================================================================

"use client";

import React, { useState, useEffect, Suspense } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Settings,
  Sparkles,
  ShieldCheck,
  Building2,
  Inbox,
  Tag as TagIcon,
  RefreshCw,
} from "lucide-react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { Button } from "@/components/ui/Button";
import {
  SmsProviderConfigCard,
  SmsIntegrationRecord,
} from "@/features/marketing/sms/components/SmsProviderConfigCard";
import { SmsAiConfigCard } from "@/features/marketing/sms/components/settings/SmsAiConfigCard";
import { SmsTagsAndQuickReplies } from "@/features/marketing/sms/components/settings/SmsTagsAndQuickReplies";
import { SmsWebhookDiagnostics } from "@/features/marketing/sms/components/settings/SmsWebhookDiagnostics";

type SmsSettingsTab = "providers" | "ai" | "tags" | "webhook";

function SmsSettingsInner() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab") as SmsSettingsTab | null;
  const validTabs: SmsSettingsTab[] = ["providers", "ai", "tags", "webhook"];
  const initialTab: SmsSettingsTab =
    tabParam && validTabs.includes(tabParam) ? tabParam : "providers";

  const [activeTab, setActiveTab] = useState<SmsSettingsTab>(initialTab);
  const [integrations, setIntegrations] = useState<SmsIntegrationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tabId: SmsSettingsTab) => {
    setActiveTab(tabId);
    router.replace(`/dashboard/marketing/sms/settings?tab=${tabId}`, { scroll: false });
  };

  const tabs: Array<{ id: SmsSettingsTab; label: string; icon: React.ReactNode }> = [
    {
      id: "providers",
      label: "Gateways & Phone Pools",
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: "ai",
      label: "AI Concierge & Autoreply",
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: "tags",
      label: "Lead Tags & Quick Replies",
      icon: <TagIcon className="w-4 h-4" />,
    },
    {
      id: "webhook",
      label: "Inbound Webhooks & Simulator",
      icon: <ShieldCheck className="w-4 h-4" />,
    },
  ];

  const fetchIntegrations = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${baseUrl}/api/marketing/sms/integrations`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setIntegrations(data);
          return;
        }
      }
      setIntegrations([]);
    } catch (err: any) {
      setError(err?.message || "Failed to load SMS provider integrations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleConnect = async (payload: Record<string, unknown>) => {
    const res = await fetch(`${baseUrl}/api/marketing/sms/integrations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message || "Failed to verify gateway credentials");
    }
    await fetchIntegrations();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to disconnect this SMS gateway?")) return;
    const res = await fetch(`${baseUrl}/api/marketing/sms/integrations/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      await fetchIntegrations();
    }
  };

  const handleSyncNumbers = async (id: string) => {
    const res = await fetch(`${baseUrl}/api/marketing/sms/integrations/${id}/sync-numbers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message || "Failed to sync sender numbers from carrier");
    }
    await fetchIntegrations();
  };

  const handleAddNumber = async (
    integrationId: string,
    payload: { phoneNumber: string; dltHeader?: string; dailyQuota?: number }
  ) => {
    const res = await fetch(`${baseUrl}/api/marketing/sms/integrations/${integrationId}/numbers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message || "Failed to add sender number");
    }
    await fetchIntegrations();
  };

  const handleDeleteNumber = async (numberId: string) => {
    if (!confirm("Are you sure you want to remove this sender phone number?")) return;
    const res = await fetch(
      `${baseUrl}/api/marketing/sms/integrations/numbers/${numberId}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err?.message || "Failed to remove sender number");
      return;
    }
    toast.success("Sender phone number removed");
    await fetchIntegrations();
  };

  return (
    <DashboardPageWrapper
      loading={false}
      error={error}
      title="SMS Engine Configuration & Tools"
      subtitle="Manage your enterprise SMS gateways, Groq AI autoreply concierges, lead tags, and carrier inbound webhooks."
      headerRight={
        <div className="flex items-center gap-2">
          <Link href="/dashboard/marketing/sms/inbox">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs font-bold text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Live Inbox</span>
            </Button>
          </Link>
          <Link href="/dashboard/marketing/sms">
            <Button variant="outline" size="sm" className="gap-2 text-xs font-bold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to SMS Campaigns</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchIntegrations}
            className="gap-1.5 text-xs font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-6 max-w-5xl">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-border-default rounded-2xl overflow-x-auto shadow-2xs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-subtle"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="space-y-6">
          {activeTab === "providers" && (
            <SmsProviderConfigCard
              integrations={integrations}
              onConnect={handleConnect}
              onDelete={handleDelete}
              onSyncNumbers={handleSyncNumbers}
              onAddNumber={handleAddNumber}
              onDeleteNumber={handleDeleteNumber}
            />
          )}

          {activeTab === "ai" && <SmsAiConfigCard />}

          {activeTab === "tags" && <SmsTagsAndQuickReplies />}

          {activeTab === "webhook" && <SmsWebhookDiagnostics />}
        </div>
      </div>
    </DashboardPageWrapper>
  );
}

export default function SmsSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-purple-200 border-t-purple-600 animate-spin" />
        </div>
      }
    >
      <SmsSettingsInner />
    </Suspense>
  );
}
