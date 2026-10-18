"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { toast } from "sonner";
import { Announcements } from "@/components/dashboard/Announcements";
import { StatCards } from "@/components/dashboard/StatCards";
import { PipelineBar } from "@/components/dashboard/PipelineBar";
import { CircleProgress } from "@/components/dashboard/CircleProgress";
import { BacklogPanel } from "@/components/dashboard/BacklogPanel";
import { FollowUpList } from "@/components/dashboard/FollowUpList";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
import {
  Sparkles,
  ClipboardList,
  AlertCircle,
  MapPin,
  Trophy,
} from "lucide-react";
import { PIPELINE_STAGES } from "./constants";

export default function PreSalesDashboard() {
  const { data: session } = authClient.useSession();
  const [dashData, setDashData] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userName = (session?.user as any)?.name || "Agent";

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
        const [dashRes, lbRes, annRes] = await Promise.all([
          authClient.$fetch<any>("/api/dashboard/pre-sales", { baseURL: baseUrl }),
          authClient.$fetch<any>("/api/dashboard/pre-sales/leaderboard", {
            baseURL: baseUrl,
          }),
          authClient.$fetch<any[]>("/api/dashboard/pre-sales/my-announcements", {
            baseURL: baseUrl,
          }),
        ]);
        if (dashRes.data) setDashData(dashRes.data);
        if (lbRes.data) setLeaderboard(lbRes.data);
        if (annRes.data) setAnnouncements(annRes.data);
        if (dashRes.error)
          throw new Error(dashRes.error.message || "Failed to load dashboard");
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
      const res = await authClient.$fetch<any>(
        `/api/dashboard/pre-sales/follow-ups/${id}/confirm`,
        {
          method: "POST",
          baseURL: baseUrl,
        }
      );
      if (res.data?.success) window.location.reload();
      else toast.error(res.data?.message || res.error?.message || "Failed");
    } catch (e: any) {
      toast.error(e?.message || "Failed");
    }
  };

  const widgets = dashData?.widgets;
  const statItems = widgets
    ? [
        {
          label: "New Leads",
          value: widgets.newLeads,
          icon: Sparkles,
          accent: "oklch(0.535 0.235 275)",
        },
        {
          label: "Today's Follow-ups",
          value: widgets.todayFollowUps,
          icon: ClipboardList,
          accent: "oklch(0.50 0.18 145)",
        },
        {
          label: "Missed Follow-ups",
          value: widgets.missedFollowUps,
          icon: AlertCircle,
          accent: "oklch(0.55 0.18 80)",
        },
        {
          label: "Site Visits",
          value: widgets.siteVisitsScheduled,
          icon: MapPin,
          accent: "oklch(0.50 0.18 240)",
        },
        {
          label: "Bookings",
          value: widgets.bookingsGenerated,
          icon: Trophy,
          accent: "oklch(0.58 0.22 350)",
        },
      ]
    : [];

  const lbEntries = (leaderboard?.leaderboard ?? []).map(
    (e: any, i: number) => ({ ...e, rank: e.rank ?? i + 1 })
  );

  return (
    <DashboardPageWrapper
      loading={loading}
      error={error}
      userName={userName}
      subtitle="Here's what's happening with your sales pipeline and daily call quotas."
    >
      {/* Announcements */}
      <Announcements announcements={announcements} />

      {/* Stat Cards */}
      {dashData && <StatCards items={statItems} />}

      {/* Middle row: Pipeline + Daily Tasks + Backlogs */}
      {dashData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <PipelineBar
            title="Pipeline Stages"
            stages={PIPELINE_STAGES}
            data={dashData.pipeline ?? {}}
          />

          {/* Daily Tasks — two circle progresses */}
          <div
            className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300"
            style={{
              boxShadow:
                "0 1px 0 rgba(255, 255, 255, 0.95) inset, 0 16px 36px -24px rgba(15, 23, 42, 0.12)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-purple-50/90 border border-purple-200/60 flex items-center justify-center text-[var(--brand-700)] shadow-2xs">
                  <ClipboardList size={15} />
                </div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider m-0">
                  Daily Manager Quotas
                </h3>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                Pacing
              </span>
            </div>
            <div className="flex justify-around items-center py-2">
              <CircleProgress
                done={dashData.dailyTasks?.coldCall?.done ?? 0}
                target={dashData.dailyTasks?.coldCall?.target ?? 1}
                label="Cold Calls"
                color="var(--brand-600)"
              />
              <CircleProgress
                done={dashData.dailyTasks?.followUp?.done ?? 0}
                target={dashData.dailyTasks?.followUp?.target || 1}
                label="Follow-ups"
                color="oklch(0.50 0.18 145)"
              />
            </div>
          </div>

          <BacklogPanel
            coldCallBacklogCount={dashData.backlogs?.coldCallBacklogCount ?? 0}
            missedFollowUps={dashData.backlogs?.missedFollowUps ?? []}
          />
        </div>
      )}

      {/* Bottom row: Follow-ups + Leaderboard */}
      {dashData && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <FollowUpList
              items={dashData.todayFollowUpList ?? []}
              onConfirm={confirmFollowUp}
              viewAllHref={`/dashboard/pre-sales/lead-management?followUpDate=${new Date().toLocaleDateString(
                "en-CA"
              )}`}
            />
          </div>
          <div className="lg:col-span-3">
            <Leaderboard
              title="Monthly Team Leaderboard"
              entries={lbEntries}
              currentUserId={leaderboard?.currentUserId}
              columns={[
                { key: "coldCalls", label: "Calls" },
                { key: "followUps", label: "F-ups" },
                { key: "siteVisits", label: "Visits" },
                { key: "score", label: "Score" },
              ]}
            />
          </div>
        </div>
      )}
    </DashboardPageWrapper>
  );
}
