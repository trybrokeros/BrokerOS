// ============================================================================
// BrokerOS — Email Engine Settings (Providers, AI Concierge, Quick Replies, Tags, Webhook)
// ============================================================================

"use client";

import React, { useState, useEffect, Suspense } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Settings,
  Mail,
  Sparkles,
  Zap,
  Tag as TagIcon,
  ShieldCheck,
  Building2,
  Inbox,
} from "lucide-react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { Button } from "@/components/ui/Button";
import { ProviderConfigCard, IntegrationRecord } from "@/features/marketing/components/ProviderConfigCard";
import { EmailAiConfigCard } from "@/features/marketing/email/components/settings/EmailAiConfigCard";
import { EmailTagsManager } from "@/features/marketing/email/components/settings/EmailTagsManager";
import { EmailWebhookDiagnostics } from "@/features/marketing/email/components/settings/EmailWebhookDiagnostics";

type EmailSettingsTab = "providers" | "ai" | "tags" | "webhook";

function EmailSettingsInner() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab") as EmailSettingsTab | null;
  const validTabs: EmailSettingsTab[] = ["providers", "ai", "tags", "webhook"];
  const initialTab: EmailSettingsTab = tabParam && validTabs.includes(tabParam) ? tabParam : "providers";

  const [activeTab, setActiveTab] = useState<EmailSettingsTab>(initialTab);
  const [integrations, setIntegrations] = useState<IntegrationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tabId: EmailSettingsTab) => {
    setActiveTab(tabId);
    router.replace(`/dashboard/marketing/email/settings?tab=${tabId}`, { scroll: false });
  };

  const tabs: Array<{ id: EmailSettingsTab; label: string; icon: React.ReactNode }> = [
    {
      id: "providers",
      label: "Providers & Domains",
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: "ai",
      label: "AI Concierge & Prompts",
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: "tags",
      label: "Lead Tags",
      icon: <TagIcon className="w-4 h-4" />,
    },
    {
      id: "webhook",
      label: "Inbound Webhook & Simulator",
      icon: <ShieldCheck className="w-4 h-4" />,
    },
  ];

  const fetchIntegrations = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${baseUrl}/api/marketing/integrations`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setIntegrations(data);
          return;
        }
      }
      // Mock fallback
      setIntegrations([
        {
          id: "int-1",
          provider: "SENDGRID",
          name: "Twilio SendGrid Dedicated IP",
          isActive: true,
          isDefault: false,
          fromEmail: "updates@skylinerealty.com",
          fromName: "Skyline Realty",
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err: any) {
      setError(err?.message || "Failed to load provider integrations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleConnect = async (payload: any) => {
    const res = await fetch(`${baseUrl}/api/marketing/integrations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err?.message || "Failed to verify credentials");
    }
    await fetchIntegrations();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to disconnect this provider?")) return;
    await fetch(`${baseUrl}/api/marketing/integrations/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    await fetchIntegrations();
  };

  const handleSyncDomains = async (id: string) => {
    const res = await fetch(`${baseUrl}/api/marketing/integrations/${id}/sync-domains`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err?.message || "Failed to sync sender domains from provider");
    }
    await fetchIntegrations();
  };

  const handleAddDomain = async (integrationId: string, payload: any) => {
    const res = await fetch(`${baseUrl}/api/marketing/integrations/${integrationId}/domains`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err?.message || "Failed to add sender domain");
    }
    await fetchIntegrations();
  };

  const handleDeleteDomain = async (domainId: string) => {
    if (!confirm("Are you sure you want to remove this sender domain identity?")) return;
    const res = await fetch(`${baseUrl}/api/marketing/integrations/domains/${domainId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json();
      toast.error(err?.message || "Failed to remove sender domain");
      return;
    }
    toast.success("Sender domain identity removed successfully");
    await fetchIntegrations();
  };

  return (
    <DashboardPageWrapper
      loading={false}
      error={error}
      title="Email Engine Configuration & Tools"
      subtitle="Manage your enterprise email providers, Groq AI autoreply concierges, lead tags, and inbound mail webhooks."
      headerRight={
        <div className="flex items-center gap-2">
          <Link href="/dashboard/marketing/email/inbox">
            <Button variant="outline" size="sm" className="gap-2 text-xs font-bold text-blue-600 border-blue-200 hover:bg-blue-50">
              <Inbox className="w-3.5 h-3.5" />
              <span>Live Inbox</span>
            </Button>
          </Link>
          <Link href="/dashboard/marketing/email">
            <Button variant="outline" size="sm" className="gap-2 text-xs font-bold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Broadcasts</span>
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6 max-w-5xl">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-bg-surface border border-border-default rounded-2xl overflow-x-auto shadow-2xs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-brand-600 text-white shadow-sm"
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
            <ProviderConfigCard
              integrations={integrations}
              onConnect={handleConnect}
              onDelete={handleDelete}
              onSyncDomains={handleSyncDomains}
              onAddDomain={handleAddDomain}
              onDeleteDomain={handleDeleteDomain}
            />
          )}

          {activeTab === "ai" && <EmailAiConfigCard />}

          {activeTab === "tags" && <EmailTagsManager />}

          {activeTab === "webhook" && <EmailWebhookDiagnostics />}
        </div>
      </div>
    </DashboardPageWrapper>
  );
}

export default function MarketingSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin" />
        </div>
      }
    >
      <EmailSettingsInner />
    </Suspense>
  );
}
