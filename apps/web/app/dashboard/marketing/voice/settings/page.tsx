"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, Building2, ShieldCheck } from "lucide-react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { Button } from "@/components/ui/Button";
import { VoiceProviderConfigCard } from "@/features/marketing/voice/components/VoiceProviderConfigCard";
import { VoiceWebhookDiagnostics } from "@/features/marketing/voice/components/settings/VoiceWebhookDiagnostics";
import type {
  VoiceTelephonyIntegrationRecord,
  VoiceAgentIntegrationRecord,
} from "@/features/marketing/types";

type VoiceSettingsTab = "providers" | "webhooks";

function VoiceSettingsInner() {
  const [telephonyIntegrations, setTelephonyIntegrations] = useState<VoiceTelephonyIntegrationRecord[]>([]);
  const [agentIntegrations, setAgentIntegrations] = useState<VoiceAgentIntegrationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab") as VoiceSettingsTab | null;
  const validTabs: VoiceSettingsTab[] = ["providers", "webhooks"];
  const initialTab: VoiceSettingsTab =
    tabParam && validTabs.includes(tabParam) ? tabParam : "providers";

  const [activeTab, setActiveTab] = useState<VoiceSettingsTab>(initialTab);

  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tabId: VoiceSettingsTab) => {
    setActiveTab(tabId);
    router.replace(`/dashboard/marketing/voice/settings?tab=${tabId}`, { scroll: false });
  };

  const tabs: Array<{ id: VoiceSettingsTab; label: string; icon: React.ReactNode }> = [
    {
      id: "providers",
      label: "Gateways & Voice Platforms",
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: "webhooks",
      label: "Inbound & Post-Call Webhooks",
      icon: <ShieldCheck className="w-4 h-4" />,
    },
  ];

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const [telRes, agentRes] = await Promise.all([
        fetch(`${baseUrl}/api/marketing/voice/integrations/telephony`),
        fetch(`${baseUrl}/api/marketing/voice/integrations/agents`),
      ]);

      if (telRes.ok) {
        const telData = await telRes.json();
        setTelephonyIntegrations(telData || []);
      }
      if (agentRes.ok) {
        const agentData = await agentRes.json();
        setAgentIntegrations(agentData || []);
      }
    } catch (err) {
      console.error("Failed to load integrations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, [baseUrl]);

  const handleAddTelephony = async (data: any) => {
    const res = await fetch(`${baseUrl}/api/marketing/voice/integrations/telephony`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message || "Failed to save and verify carrier credentials");
    }
    await loadIntegrations();
  };

  const handleDeleteTelephony = async (id: string) => {
    if (!confirm("Are you sure you want to disconnect this carrier line?")) return;
    const res = await fetch(`${baseUrl}/api/marketing/voice/integrations/telephony/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      await loadIntegrations();
    }
  };

  const handleAddAgent = async (data: any) => {
    const res = await fetch(`${baseUrl}/api/marketing/voice/integrations/agents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message || "Failed to save and verify AI engine credentials");
    }
    await loadIntegrations();
  };

  const handleDeleteAgent = async (id: string) => {
    if (!confirm("Are you sure you want to disconnect this AI voice platform?")) return;
    const res = await fetch(`${baseUrl}/api/marketing/voice/integrations/agents/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      await loadIntegrations();
    }
  };

  return (
    <DashboardPageWrapper
      loading={loading && activeTab === "providers"}
      title="Telephony & AI Voice Gateways"
      subtitle="Manage your PSTN carriers, connect AI Voice platforms, and configure post-call recording webhooks."
      headerRight={
        <div className="flex items-center gap-2">
          <Link href="/dashboard/marketing/voice">
            <Button variant="outline" size="sm" className="gap-2 text-xs font-bold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Voice Hub</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={loadIntegrations}
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
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${isActive
                  ? "bg-indigo-600 text-white shadow-sm"
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
            <VoiceProviderConfigCard
              telephonyIntegrations={telephonyIntegrations}
              agentIntegrations={agentIntegrations}
              onAddTelephony={handleAddTelephony}
              onDeleteTelephony={handleDeleteTelephony}
              onAddAgent={handleAddAgent}
              onDeleteAgent={handleDeleteAgent}
              loading={loading}
            />
          )}

          {activeTab === "webhooks" && <VoiceWebhookDiagnostics />}
        </div>
      </div>
    </DashboardPageWrapper>
  );
}

export default function VoiceSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
        </div>
      }
    >
      <VoiceSettingsInner />
    </Suspense>
  );
}

