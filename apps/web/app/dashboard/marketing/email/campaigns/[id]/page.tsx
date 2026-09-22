"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Building,
  Calendar,
  Send,
  CheckCircle2,
  Eye,
  MousePointer,
  RefreshCw,
} from "lucide-react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CampaignFunnelAnalytics } from "@/features/marketing/components/CampaignFunnelAnalytics";
import { RecipientActivityTable } from "@/features/marketing/components/RecipientActivityTable";
import type { CampaignAnalyticsSummary } from "@brokeros/types";

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params?.id as string;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

  const [analytics, setAnalytics] = useState<CampaignAnalyticsSummary | null>(null);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [recipientCounts, setRecipientCounts] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaignData = async () => {
    if (!campaignId) return;
    setIsRefreshing(true);
    setError(null);
    try {
      const [analyticsRes, recipientsRes] = await Promise.all([
        fetch(`${baseUrl}/api/marketing/campaigns/${campaignId}/analytics`, {
          credentials: "include",
        }).then(async (r) => {
          if (!r.ok) throw new Error(`Campaign not found (${r.status})`);
          return r.json();
        }),
        fetch(`${baseUrl}/api/marketing/campaigns/${campaignId}/recipients?limit=500`, {
          credentials: "include",
        }).then(async (r) => {
          if (!r.ok) return { items: [], counts: null };
          return r.json();
        }),
      ]);

      if (analyticsRes?.campaignId) {
        setAnalytics(analyticsRes);
      }
      setRecipients(recipientsRes?.items || []);
      if (recipientsRes?.counts) {
        setRecipientCounts(recipientsRes.counts);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load campaign analytics");
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

  const [isDispatching, setIsDispatching] = useState(false);

  // Auto-refresh stats every 4s while processing
  useEffect(() => {
    if (analytics?.status === "PROCESSING") {
      const timer = setInterval(() => {
        fetchCampaignData();
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [analytics?.status, campaignId]);

  const handleDispatchNow = async () => {
    if (!campaignId) return;
    setIsDispatching(true);
    try {
      const res = await fetch(`${baseUrl}/api/marketing/campaigns/${campaignId}/dispatch`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Email campaign dispatch triggered successfully");
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
      const res = await fetch(`${baseUrl}/api/marketing/recipients/${recipientId}/promote`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.message || "Failed to promote recipient");
      }
      toast.success("Recipient successfully converted to CRM lead");
      await fetchCampaignData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to convert prospect to CRM lead");
    }
  };

  return (
    <DashboardPageWrapper
      loading={isLoading}
      error={error}
      title={analytics?.title || "Campaign Performance"}
      subtitle="Live delivery analytics, recipient engagement funnel, and instant CRM lead conversion."
      headerRight={
        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/marketing/email">
            <Button variant="outline" size="sm" className="gap-2 text-xs font-bold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Campaigns</span>
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
          {analytics?.status !== "COMPLETED" && (
            <Button
              variant="default"
              size="sm"
              onClick={handleDispatchNow}
              disabled={isDispatching}
              className="gap-2 text-xs font-bold"
            >
              <Send className={`w-3.5 h-3.5 ${isDispatching ? "animate-spin" : ""}`} />
              <span>{isDispatching ? "Dispatching..." : "Dispatch Now"}</span>
            </Button>
          )}
        </div>
      }
    >
      {analytics && (
        <div className="space-y-6">
          {/* Funnel Analytics Component */}
          <CampaignFunnelAnalytics analytics={analytics} />

          {/* Recipient Activity Table */}
          <RecipientActivityTable
            recipients={recipients}
            counts={recipientCounts}
            onPromoteRecipient={handlePromoteRecipient}
            campaignId={campaignId}
            campaignTitle={analytics?.title}
          />
        </div>
      )}
    </DashboardPageWrapper>
  );
}
