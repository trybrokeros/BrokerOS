"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { StatCards } from "@/components/dashboard/StatCards";
import { FollowUpList } from "@/components/dashboard/FollowUpList";
import { PendingListWidget } from "./components/PendingListWidget";
import { Handshake, FileText, Building, Key, CheckCircle, Clock } from "lucide-react";
import { toast } from 'sonner';

export default function PostSalesDashboard() {
  const { data: session } = authClient.useSession();
  const [dashData, setDashData] = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const userName = (session?.user as any)?.name || "Agent";

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
        const res = await authClient.$fetch<any>("/api/dashboard/post-sales", { baseURL: baseUrl });
        if (res.data) setDashData(res.data);
        if (res.error) throw new Error(res.error.message || "Failed");
      } catch (e: any) {
        setError(e?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const confirmFollowUp = async (id: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await authClient.$fetch<any>(`/api/dashboard/pre-sales/follow-ups/${id}/confirm`, {
        method: "POST", baseURL: baseUrl,
      });
      if (res.data?.success) window.location.reload();
      else toast.error(res.data?.message || "Failed");
    } catch (e: any) { toast.error(e?.message || "Failed"); }
  };

  const w = dashData?.widgets;
  const statItems = w ? [
    { label: "Total Booked",        value: w.totalBooked,         icon: Handshake,  accent: "#7c3aed" },
    { label: "Documents Pending",   value: w.documentsPending,    icon: FileText,   accent: "#f59e0b" },
    { label: "Loan Cases",          value: w.loanCases,           icon: Building,   accent: "#3b82f6" },
    { label: "Agreement Pending",   value: w.agreementPending,    icon: FileText,   accent: "#8b5cf6" },
    { label: "Possession Pending",  value: w.possessionPending,   icon: Key,        accent: "#ec4899" },
    { label: "Handover Completed",  value: w.handoverCompleted,   icon: CheckCircle,accent: "#10b981" },
  ] : [];

  return (
    <DashboardPageWrapper
      loading={loading}
      error={error}
      userName={userName}
      subtitle="Here's what's happening in your post-sales pipeline."
    >
      {/* Stats */}
      {dashData && <StatCards items={statItems} />}

      {/* Pending Lists (4-grid) */}
      {dashData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PendingListWidget
            title="Documents Pending"
            list={dashData.documentsList ?? []}
            statusFilter="DOCUMENT"
            emptyMessage="No documents pending."
          />
          <PendingListWidget
            title="Loan Cases"
            list={dashData.loanList ?? []}
            statusFilter="LOAN"
            emptyMessage="No loan cases in progress."
          />
          <PendingListWidget
            title="Agreements Pending"
            list={dashData.agreementList ?? []}
            statusFilter="AGREEMENT"
            emptyMessage="No agreements pending."
          />
          <PendingListWidget
            title="Possession Pending"
            list={dashData.possessionList ?? []}
            statusFilter="HANDOVER"
            emptyMessage="No possessions pending."
          />
        </div>
      )}

      {/* Follow-ups */}
      {dashData && (
        <FollowUpList
          items={dashData.todayFollowUpList ?? []}
          onConfirm={confirmFollowUp}
          viewAllHref="/dashboard/post-sales/lead-management"
          title="Today's Follow-ups"
        />
      )}
    </DashboardPageWrapper>
  );
}
