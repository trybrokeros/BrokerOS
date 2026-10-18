"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { StatCards } from "@/components/dashboard/StatCards";
import { PipelineBar } from "@/components/dashboard/PipelineBar";
import { FollowUpList } from "@/components/dashboard/FollowUpList";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
import { Avatar } from "@/components/dashboard/Avatar";
import {
  Users,
  TrendingUp,
  XCircle,
  Clock,
  AlertCircle,
  MapPin,
  Percent,
} from "lucide-react";
import { PIPELINE_STAGES } from "./_components/constants";

export default function PreSalesManagerDashboard() {
  const { data: session } = authClient.useSession();
  const [dashData, setDashData] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userName = (session?.user as any)?.name || "Manager";

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
        const [dashRes, lbRes] = await Promise.all([
          fetch(baseUrl + "/api/dashboard/pre-sales-manager").then((r) =>
            r.json()
          ),
          fetch(baseUrl + "/api/dashboard/pre-sales-manager/leaderboard").then(
            (r) => r.json()
          ),
        ]);
        if (dashRes.widgets) setDashData(dashRes);
        if (Array.isArray(lbRes)) {
          setLeaderboard({
            leaderboard: lbRes.map((r: any, i: number) => ({
              ...r,
              rank: i + 1,
            })),
            currentUserId: session?.user?.id ?? "",
          });
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [session?.user?.id]);

  const w = dashData?.widgets;
  const statItems = w
    ? [
        {
          label: "Total Leads",
          value: w.totalLeads,
          icon: Users,
          accent: "#6b7280",
        },
        {
          label: "New Leads",
          value: w.newLeads,
          icon: TrendingUp,
          accent: "#9333ea",
        },
        {
          label: "Active Leads",
          value: w.activeLeads,
          icon: Users,
          accent: "#10b981",
        },
        {
          label: "Lost Leads",
          value: w.lostLeads,
          icon: XCircle,
          accent: "#e11d48",
        },
        {
          label: "Today's Follow-ups",
          value: w.todayFollowUps,
          icon: Clock,
          accent: "#d97706",
        },
        {
          label: "Missed Follow-ups",
          value: w.missedFollowUps,
          icon: AlertCircle,
          accent: "#be123c",
        },
        {
          label: "Site Visits",
          value: w.siteVisitsScheduled,
          icon: MapPin,
          accent: "#7c3aed",
        },
        {
          label: "Conversion Rate",
          value: (w.conversionRate ?? 0) + "%",
          icon: Percent,
          accent: "#0284c7",
        },
      ]
    : [];

  const lbEntries = (leaderboard?.leaderboard ?? []).map(
    (e: any, i: number) => ({
      ...e,
      userId: e.userId ?? e.id,
      rank: e.rank ?? i + 1,
    })
  );

  return (
    <DashboardPageWrapper
      loading={loading}
      error={error}
      userName={userName}
      subtitle="Performance overview & operational health across your pre-sales team."
    >
      {/* Stats */}
      {dashData && <StatCards items={statItems} />}

      {/* Pipeline + Team Backlogs */}
      {dashData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PipelineBar
            title="Team Pipeline Distribution"
            stages={PIPELINE_STAGES}
            data={dashData.pipeline ?? {}}
          />
          <TeamBacklogsCard backlogs={dashData.backlogs ?? []} />
        </div>
      )}

      {/* Follow-ups + Leaderboard */}
      {dashData && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <FollowUpList
              items={dashData.todayFollowUpList ?? []}
              title="Team Today's Follow-ups"
            />
          </div>
          <div className="lg:col-span-3">
            <Leaderboard
              title="Team Monthly Leaderboard"
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

function TeamBacklogsCard({ backlogs }: { backlogs: any[] }) {
  return (
    <div
      className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300"
      style={{
        boxShadow:
          "0 1px 0 rgba(255, 255, 255, 0.95) inset, 0 16px 36px -24px rgba(15, 23, 42, 0.12)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-50/90 border border-rose-200/60 flex items-center justify-center text-rose-700 shadow-2xs">
            <AlertCircle size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider m-0">
              Team Backlogs &amp; Untouched Leads
            </h3>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5 m-0">
              Agent queue bottlenecks and overdue follow-up tracking
            </p>
          </div>
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
          {backlogs.length} Agents Tracked
        </span>
      </div>

      {backlogs.length === 0 ? (
        <div className="text-center text-slate-400 text-xs font-semibold py-12 flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
            <AlertCircle size={20} className="text-slate-300" />
          </div>
          <span>No agent backlogs found. All sales queues clear!</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 max-h-[360px] overflow-y-auto pr-1">
          {backlogs.map((agent: any) => (
            <div
              key={agent.id}
              className="flex items-center justify-between p-3 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300 rounded-2xl border border-slate-200/70 transition-all duration-200 shadow-2xs hover:shadow-xs"
            >
              <div className="flex items-center gap-3">
                <Avatar name={agent.name} size={32} />
                <span className="text-xs font-bold text-slate-900">
                  {agent.name}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="bg-rose-50 text-rose-700 border border-rose-200/70 px-2.5 py-0.5 rounded-full text-[10px] font-black tabular-nums">
                  {agent.missedFollowUps} Missed F-ups
                </span>
                <span className="bg-amber-50 text-amber-800 border border-amber-200/70 px-2.5 py-0.5 rounded-full text-[10px] font-black tabular-nums">
                  {agent.untouchedLeads} Untouched
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
