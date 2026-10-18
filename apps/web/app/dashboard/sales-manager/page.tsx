"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { StatCards } from "@/components/dashboard/StatCards";
import { PipelineBar } from "@/components/dashboard/PipelineBar";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
import { TeamTasks } from "./_components/TeamTasks";
import { DetailedMetricsGrid } from "./_components/DetailedMetricsGrid";
import { BacklogPanel } from "@/components/dashboard/BacklogPanel";
import {
  IndianRupee,
  MapPin,
  CheckCircle,
  Trophy,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

const PIPELINE_STAGES = [
  { key: "SITE_VISIT_SCHEDULED", label: "SV Scheduled", color: "#3b82f6" },
  { key: "SITE_VISIT_COMPLETED", label: "SV Completed", color: "#7c3aed" },
  { key: "NEGOTIATION", label: "Negotiations", color: "#f59e0b" },
  { key: "BOOKING", label: "Booked", color: "#10b981" },
  { key: "LOST", label: "Lost / Cancelled", color: "#ef4444" },
];

export default function SalesManagerDashboard() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [dashData, setDashData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
      return;
    }
    if (isAuthorized) return;
    const user = session?.user as any;
    if (user?.roleId) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      fetch(`${baseUrl}/roles`)
        .then((r) => r.json())
        .then((roles) => {
          const role = roles.find((r: any) => r.id === user.roleId);
          if (role && role.code === "SALES_MANAGER") {
            setIsAuthorized(true);
            loadDashboard(baseUrl);
          } else {
            router.replace("/dashboard");
          }
        })
        .catch(console.error);
    }
  }, [session, isPending, router, isAuthorized]);

  const loadDashboard = async (baseUrl: string) => {
    try {
      setLoading(true);
      const res = await fetch(baseUrl + "/api/dashboard/sales-manager").then(
        (r) => r.json()
      );
      if (res.widgets) setDashData(res);
    } catch (e: any) {
      setError(e?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const userName = (session?.user as any)?.name || "Manager";
  const w = dashData?.widgets;

  const statItems = w
    ? [
        {
          label: "Total SV Scheduled",
          value: w.siteVisitsScheduled,
          icon: MapPin,
          accent: "#3b82f6",
        },
        {
          label: "SV Completed",
          value: w.siteVisitsCompleted,
          icon: CheckCircle,
          accent: "#7c3aed",
        },
        {
          label: "Active Negotiations",
          value: w.activeNegotiations,
          icon: TrendingUp,
          accent: "#f59e0b",
        },
        {
          label: "Team Bookings",
          value: w.teamBookings,
          icon: Trophy,
          accent: "#10b981",
        },
        {
          label: "Booking Revenue",
          value:
            "₹" +
            ((w.bookingRevenue || 0) / 100000).toFixed(1) +
            "L",
          icon: IndianRupee,
          accent: "#0369a1",
        },
        {
          label: "Missed Follow-ups",
          value: w.missedFollowUps,
          icon: AlertCircle,
          accent: "#be123c",
        },
      ]
    : [];

  const lbEntries = (dashData?.teamLeaderboard ?? []).map(
    (e: any, i: number) => ({
      ...e,
      userId: e.id,
      rank: i + 1,
    })
  );

  return (
    <DashboardPageWrapper
      loading={!isAuthorized || loading}
      error={error}
      userName={userName}
      subtitle="Team revenue trajectory, site visit throughput & deal negotiations."
    >
      {dashData && <StatCards items={statItems} />}

      {dashData?.detailedMetrics && (
        <DetailedMetricsGrid metrics={dashData.detailedMetrics} />
      )}

      {dashData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <PipelineBar
            title="Team Pipeline Distribution"
            stages={PIPELINE_STAGES}
            data={dashData.pipeline ?? {}}
          />
          <Leaderboard
            title="Team Sales Leaderboard"
            entries={lbEntries}
            columns={[
              { key: "svCompleted", label: "SVs" },
              { key: "activeNegotiations", label: "Neg" },
              { key: "bookings", label: "Books" },
              { key: "score", label: "Score" },
            ]}
          />
        </div>
      )}

      {dashData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <TeamTasks data={dashData} />
          <BacklogPanel
            missedFollowUps={dashData.missedFollowUpBacklog ?? []}
          />
        </div>
      )}
    </DashboardPageWrapper>
  );
}
