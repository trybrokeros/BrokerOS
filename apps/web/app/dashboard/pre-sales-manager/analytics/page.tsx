"use client";

import React, { useEffect, useState } from "react";
import PremiumBarChart from "@/components/analytics/PremiumBarChart";
import { CircularPercentage } from "@/components/analytics/CircularPercentage";
import { StatCard } from "@/components/analytics/StatCard";
import { CallOutcomes } from "@/components/analytics/CallOutcomes";
import { LeadSourceChart } from "@/components/analytics/LeadSourceChart";
import { ConnectionHeatmap } from "@/components/analytics/ConnectionHeatmap";
import {
  PhoneOutgoing,
  PhoneIncoming,
  Target,
  XCircle,
  AlertCircle,
  ListChecks,
  Clock,
  Zap,
  Users2,
  Loader2,
  TrendingUp,
  Flame,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { ExportAnalyticsReportButton } from "@/components/analytics/ExportAnalyticsReportButton";

export default function ManagerAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("monthly");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
        const res = await authClient.$fetch<any>(
          "/api/dashboard/pre-sales-manager/analytics",
          {
            baseURL: baseUrl,
            query: { timeRange },
          }
        );

        if (res.data) {
          setData(res.data);
        }
        if (res.error) {
          throw new Error(res.error.message || "Failed to load analytics");
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load team analytics");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [timeRange]);

  const reportPayload = data
    ? {
        departmentName: "Pre-Sales Manager Team Analytics",
        departmentCode: "PRE_SALES_MANAGER",
        timeRange,
        generatedAt: new Date().toLocaleString(),
        summaryCards: [
          { label: "Team Pipeline Leads", value: data.pipeline?.totalLeads ?? 0, subtitle: "Total Leads" },
          { label: "Team Calls Made", value: data.calls?.made ?? 0, subtitle: "Outbound dials" },
          { label: "Calls Connected", value: data.calls?.connected ?? 0, change: `${data.calls?.connectedPercentage ?? 0}%`, subtitle: "Conversations" },
          { label: "Site Visits", value: data.pipeline?.siteVisits ?? 0, subtitle: "Total Visits" },
          { label: "Deals Booked", value: data.pipeline?.booked ?? 0, subtitle: "Converted" },
          { label: "Speed to Lead", value: `${data.managerMetrics?.avgSpeedToLeadMinutes ?? 0}m`, subtitle: "Avg intake response" },
        ],
        funnelStages: [
          { name: "Total Leads", count: data.pipeline?.totalLeads ?? 0, color: "#6366f1" },
          { name: "New Leads", count: data.pipeline?.newLeads ?? 0, color: "#818cf8" },
          { name: "Contacted", count: data.pipeline?.contacted ?? 0, color: "#a855f7" },
          { name: "Interested", count: data.pipeline?.interested ?? 0, color: "#fbbf24" },
          { name: "Qualified", count: data.pipeline?.qualified ?? 0, color: "#34d399" },
          { name: "Site Visits", count: data.pipeline?.siteVisits ?? 0, color: "#10b981" },
          { name: "Booked", count: data.pipeline?.booked ?? 0, color: "#059669" },
          { name: "Lost", count: data.pipeline?.lost ?? 0, color: "#ef4444" },
        ],
        activityMetrics: [
          { label: "Team Outbound Dials", value: data.calls?.made ?? 0 },
          { label: "Connected Conversations", value: data.calls?.connected ?? 0 },
          { label: "Connection Rate", value: `${data.calls?.connectedPercentage ?? 0}%` },
          { label: "Speed to Lead", value: `${data.managerMetrics?.avgSpeedToLeadMinutes ?? 0} mins` },
        ],
      }
    : null;

  if (loading && !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Aggregating Team Telemetry & Speed-to-Lead…
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 border border-rose-200/90 rounded-3xl p-6 m-4 flex items-center gap-4 shadow-sm">
        <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
        <div>
          <h3 className="text-sm font-extrabold text-rose-950 m-0">
            Error loading team analytics
          </h3>
          <p className="text-xs text-rose-700 font-medium mt-1 m-0">
            {error || "Unknown error occurred"}
          </p>
        </div>
      </div>
    );
  }

  const pipelineStages = [
    { name: "Total Leads", value: data.pipeline?.totalLeads || 0 },
    { name: "New Leads", value: data.pipeline?.newLeads || 0 },
    { name: "Contacted", value: data.pipeline?.contacted || 0 },
    { name: "Interested", value: data.pipeline?.interested || 0 },
    { name: "Qualified", value: data.pipeline?.qualified || 0 },
    { name: "Site Visits", value: data.pipeline?.siteVisits || 0 },
    { name: "Booked", value: data.pipeline?.booked || 0 },
  ];

  const ranges = [
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
    { id: "yearly", label: "Yearly" },
    { id: "all-time", label: "All Time" },
  ];

  const contactedDropoff =
    data.pipeline?.newLeads > 0
      ? Math.round(
          ((data.pipeline.newLeads - data.pipeline.contacted) /
            data.pipeline.newLeads) *
            100
        )
      : 0;

  const siteVisitConversion =
    data.pipeline?.qualified > 0
      ? Math.round(
          (data.pipeline.siteVisits / data.pipeline.qualified) * 100
        )
      : 0;

  return (
    <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 shadow-2xs">
              <Users2 size={18} className="stroke-[2.2]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight m-0">
              Pre-Sales Manager Team Intelligence
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1 m-0">
            Aggregated performance, pipeline throughput, call telemetry, and speed-to-lead across all agents.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200/80 shadow-2xs">
            {ranges.map((r) => (
              <button
                key={r.id}
                onClick={() => setTimeRange(r.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  timeRange === r.id
                    ? "bg-white text-slate-900 shadow-xs font-extrabold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <ExportAnalyticsReportButton
            payload={reportPayload}
            filenamePrefix="presales_team_analytics"
          />
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Team Pipeline"
          value={data.pipeline?.totalLeads || 0}
          subtitle="All active reps"
          icon={Target}
          delay={0.04}
        />
        <StatCard
          title="Calls Made"
          value={data.calls?.made || 0}
          subtitle="Outbound dials"
          icon={PhoneOutgoing}
          delay={0.08}
        />
        <StatCard
          title="Connects"
          value={data.calls?.connected || 0}
          subtitle={`${data.calls?.connectedPercentage || 0}% connect rate`}
          icon={PhoneIncoming}
          trend={data.calls?.connectedPercentage >= 35 ? "up" : "neutral"}
          trendValue={`${data.calls?.connectedPercentage || 0}%`}
          delay={0.12}
        />
        <StatCard
          title="Follow-ups"
          value={data.followUps?.completed || 0}
          subtitle="Callbacks done"
          icon={ListChecks}
          delay={0.16}
        />
        <StatCard
          title="Speed to Lead"
          value={`${data.managerMetrics?.avgSpeedToLeadMinutes || 0}m`}
          subtitle="Avg first contact"
          icon={Zap}
          delay={0.2}
        />
        <StatCard
          title="Lost Leads"
          value={data.pipeline?.lost || 0}
          subtitle="Disqualified leads"
          icon={XCircle}
          trend="down"
          trendValue="Audit needed"
          delay={0.24}
        />
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Progression & Disposition */}
        <div className="lg:col-span-2 space-y-6">
          <PremiumBarChart
            data={pipelineStages}
            title="Team Pipeline Progression"
            description="Cumulative advancement across all active pre-sales representatives"
            dataKey="value"
            categoryKey="name"
            color="#6366f1"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Team Call Outcomes */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_14px_34px_-18px_rgba(15,23,42,0.08)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-800 m-0">
                    Team Call Outcomes
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 m-0">
                    Aggregated talk dispositions
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/80">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-xs font-black text-slate-900 tabular-nums">
                    {data.calls?.avgTalkTimeSeconds || 0}s avg
                  </span>
                </div>
              </div>
              <CallOutcomes outcomes={data.calls || {}} />
            </div>

            {/* Funnel Drop-off Analysis */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_14px_34px_-18px_rgba(15,23,42,0.08)] flex flex-col justify-between space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-800 m-0">
                  Funnel Leakage & Wins
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5 m-0">
                  Critical transition rates across stages
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-rose-50/80 rounded-2xl border border-rose-200/80 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700">
                      New → Contacted Drop-Off
                    </span>
                    <span className="text-xs font-extrabold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md">
                      Failed To Reach
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-2">
                    <div className="text-2xl font-black text-rose-900 tabular-nums">
                      {contactedDropoff}%
                    </div>
                    <span className="text-xs font-medium text-rose-700">
                      Intake leakage
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                      Qualified → Site Visit Rate
                    </span>
                    <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      Conversion Win
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-2">
                    <div className="text-2xl font-black text-emerald-900 tabular-nums">
                      {siteVisitConversion}%
                    </div>
                    <span className="text-xs font-medium text-emerald-700">
                      Visits booked
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Side Column: Conversion & Lead Channels */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_14px_34px_-18px_rgba(15,23,42,0.08)] flex flex-col items-center justify-center">
            <div className="w-full flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                Team Conversion
              </span>
              <span className="text-[10px] font-black text-slate-900">
                Lead to Site Visit
              </span>
            </div>
            <CircularPercentage
              percentage={data.conversions?.leadToSiteVisitPercentage || 0}
              label="Team Conversion Rate"
              subLabel="Overall pipeline qualification efficiency"
              color="primary"
              delay={0.2}
            />
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_14px_34px_-18px_rgba(15,23,42,0.08)] space-y-3">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-800 m-0">
                Best Lead Channels
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5 m-0">
                Sources driving confirmed site visits
              </p>
            </div>
            <LeadSourceChart data={data.sources || []} />
          </div>
        </div>
      </div>

      {/* Peak Connection Heatmap */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_14px_34px_-18px_rgba(15,23,42,0.08)] space-y-4">
        <div>
          <h3 className="text-sm font-black text-slate-900 tracking-tight m-0">
            Peak Calling & Connection Heatmap
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5 m-0">
            Identify the highest probability days and hours to connect with leads based on team historical records.
          </p>
        </div>
        <ConnectionHeatmap
          data={data.managerMetrics?.connectionHeatmap || []}
        />
      </div>
    </div>
  );
}
