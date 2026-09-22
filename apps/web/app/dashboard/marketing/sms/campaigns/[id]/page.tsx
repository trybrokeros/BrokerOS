"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building,
  Calendar,
  RefreshCw,
  Zap,
} from "lucide-react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { Button } from "@/components/ui/Button";
import { SmsFunnelAnalytics } from "@/features/marketing/components/SmsFunnelAnalytics";
import { SmsRecipientActivityTable } from "@/features/marketing/components/SmsRecipientActivityTable";
import { CAMPAIGN_STATUS_CONFIG, SMS_PROVIDERS } from "@brokeros/constants";
import type { SmsAnalyticsSummary, SmsRecipientItem } from "@/features/marketing/types";

export default function SmsCampaignDetailPage() {
  const params = useParams();
  const campaignId = params?.id as string;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

  const [analytics, setAnalytics] = useState<SmsAnalyticsSummary | null>(null);
  const [recipients, setRecipients] = useState<SmsRecipientItem[]>([]);
  const [campaign, setCampaign] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);

  const fetchCampaignData = async () => {
    if (!campaignId) return;
    setIsRefreshing(true);
    setError(null);
    try {
      const [campRes, analyticsRes, recipRes] = await Promise.all([
        fetch(`${baseUrl}/api/marketing/sms/campaigns/${campaignId}`).then(async (r) => {
          if (!r.ok) throw new Error(`Campaign not found (${r.status})`);
          return r.json();
        }),
        fetch(`${baseUrl}/api/marketing/sms/campaigns/${campaignId}/analytics`).then(async (r) => {
          if (!r.ok) return null;
          return r.json();
        }),
        fetch(`${baseUrl}/api/marketing/sms/campaigns/${campaignId}/recipients?limit=100`).then(
          async (r) => {
            if (!r.ok) return { items: [] };
            return r.json();
          }
        ),
      ]);

      setCampaign(campRes);
      if (analyticsRes?.campaignId || analyticsRes?.sentCount !== undefined) {
        setAnalytics(analyticsRes);
      }
      setRecipients(recipRes?.items || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load SMS campaign telemetry");
      setAnalytics(null);
      setRecipients([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCampaignData();
  }, [campaignId]);

  // Auto-refresh stats every 4s while processing
  useEffect(() => {
    if (campaign?.status === "PROCESSING" || analytics?.status === "PROCESSING") {
      const timer = setInterval(() => {
        fetchCampaignData();
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [campaign?.status, analytics?.status, campaignId]);

  const handleDispatchNow = async () => {
    if (!campaignId) return;
    setIsDispatching(true);
    try {
      const res = await fetch(`${baseUrl}/api/marketing/sms/campaigns/${campaignId}/dispatch`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("SMS campaign dispatch triggered successfully");
        await fetchCampaignData();
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Failed to trigger dispatch");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to trigger dispatch");
    } finally {
      setIsDispatching(false);
    }
  };

  const handlePromoteRecipient = async (recipientId: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/marketing/sms/recipients/${recipientId}/promote`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.message || "Failed to promote recipient");
      }
      toast.success("Recipient successfully converted to CRM lead");
      await fetchCampaignData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to convert mobile contact to CRM lead");
    }
  };

  const statusMeta = campaign?.status
    ? CAMPAIGN_STATUS_CONFIG[campaign.status as keyof typeof CAMPAIGN_STATUS_CONFIG]
    : CAMPAIGN_STATUS_CONFIG.DRAFT;

  const provMeta = campaign?.providerType
    ? SMS_PROVIDERS[campaign.providerType as keyof typeof SMS_PROVIDERS]
    : SMS_PROVIDERS.TWILIO;

  return (
    <DashboardPageWrapper
      loading={isLoading}
      error={error}
      title={campaign?.title || "SMS Broadcast Telemetry"}
      subtitle={campaign?.messageContent || "Live carrier delivery acknowledgment, shortlink clicks, and instant CRM lead conversion."}
      headerRight={
        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/marketing/sms">
            <Button variant="outline" size="sm" className="gap-2 text-xs font-bold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to SMS Hub</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCampaignData}
            disabled={isRefreshing}
            className="gap-2 text-xs font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
          {campaign && (campaign.status === "DRAFT" || campaign.status === "SCHEDULED") && (
            <Button
              variant="default"
              size="sm"
              onClick={handleDispatchNow}
              disabled={isDispatching}
              className="gap-2 text-xs font-bold shadow-sm"
            >
              <Zap className={`w-3.5 h-3.5 ${isDispatching ? "animate-spin" : ""}`} />
              <span>{isDispatching ? "Dispatching..." : "Dispatch Now"}</span>
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Campaign Metadata Bar */}
        {campaign && (
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-extrabold ${statusMeta?.bg}`}
              >
                {statusMeta?.label}
              </span>

              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)]">
                <span
                  className="w-2.5 h-2.5 rounded-full shadow-xs"
                  style={{ backgroundColor: provMeta?.color }}
                />
                <span>{campaign.fromSender}</span>
                <span className="text-[var(--text-muted)] font-normal">({provMeta?.name})</span>
              </div>

              {campaign.project && (
                <div className="inline-flex items-center gap-1 text-xs font-bold text-[var(--brand-700)] bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200/80">
                  <Building className="w-3.5 h-3.5 text-[var(--brand-600)]" />
                  <span>{campaign.project.name}</span>
                </div>
              )}

              <div className="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(campaign.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {campaign.dltTemplateId && (
              <div className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                DLT PE ID: {campaign.dltTemplateId}
              </div>
            )}
          </div>
        )}

        {/* Funnel Analytics Component */}
        {analytics && <SmsFunnelAnalytics analytics={analytics} />}

        {/* Recipient Activity Table */}
        <SmsRecipientActivityTable
          recipients={recipients}
          loading={isLoading}
          onPromote={handlePromoteRecipient}
          campaignId={campaignId}
          campaignTitle={campaign?.title}
        />
      </div>
    </DashboardPageWrapper>
  );
}
