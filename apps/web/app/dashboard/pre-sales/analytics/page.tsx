"use client";

import React, { useEffect, useState } from "react";
import PremiumBarChart from "@/components/analytics/PremiumBarChart";
import { CircularPercentage } from "@/components/analytics/CircularPercentage";
import { StatCard } from "@/components/analytics/StatCard";
import { CallOutcomes } from "@/components/analytics/CallOutcomes";
import { LeadSourceChart } from "@/components/analytics/LeadSourceChart";
import {
  PhoneOutgoing,
  PhoneIncoming,
  Target,
  XCircle,
  AlertCircle,
  ListChecks,
  Clock,
  BarChart3,
  Loader2,
  Headphones,
  Sparkles,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { ExportAnalyticsReportButton } from "@/components/analytics/ExportAnalyticsReportButton";

interface AnalyticsData {
  pipeline: {
    totalLeads: number;
    newLeads: number;
    contacted: number;
    interested: number;
    qualified: number;
    visitScheduled: number;
    visitCompleted: number;
    siteVisits: number;
    booked: number;
    lost: number;
  };
  calls: {
    made: number;
    connected: number;
    notAnswered: number;
    busy: number;
    failed: number;
    voicemail: number;
    connectedPercentage: number;
    avgTalkTimeSeconds: number;
  };
  followUps: {
    completed: number;
  };
  sources: {
    source: string;
    count: number;
  }[];
  conversions: {
    leadToSiteVisitPercentage: number;
  };
}

export default function PreSalesAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("monthly");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
        const res = await authClient.$fetch<AnalyticsData>(
          "/api/dashboard/pre-sales/analytics",
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
        setError(e?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [timeRange]);

  const ranges = [
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
    { id: "yearly", label: "Yearly" },
    { id: "all-time", label: "All Time" },
  ];

  const reportPayload = data
    ? {
        departmentName: "Pre-Sales Performance Analytics",
        departmentCode: "PRE_SALES",
        timeRange,
        generatedAt: new Date().toLocaleString(),
        summaryCards: [
          { label: "Total Pipeline", value: data.pipeline.totalLeads, subtitle: "Total Leads" },
          { label: "Calls Made", value: data.calls.made, subtitle: "Outbound dials" },
          { label: "Connected Calls", value: data.calls.connected, change: `${data.calls.connectedPercentage}%`, subtitle: "Conversations" },
          { label: "Follow-Ups Done", value: data.followUps.completed, subtitle: "Schedule compliance" },
          { label: "Site Visits Scheduled", value: data.pipeline.siteVisits, change: `${data.conversions.leadToSiteVisitPercentage}%`, subtitle: "Qualification conversion" },
          { label: "Deals Booked", value: data.pipeline.booked, subtitle: "Confirmed bookings" },
        ],
        funnelStages: [
          { name: "Total Leads", count: data.pipeline.totalLeads, color: "#6366f1" },
          { name: "Contacted", count: data.pipeline.contacted, color: "#818cf8" },
          { name: "Interested", count: data.pipeline.interested, color: "#a855f7" },
          { name: "Qualified", count: data.pipeline.qualified, color: "#fbbf24" },
          { name: "Site Visits", count: data.pipeline.siteVisits, color: "#34d399" },
          { name: "Booked", count: data.pipeline.booked, color: "#10b981" },
          { name: "Lost", count: data.pipeline.lost, color: "#ef4444" },
        ],
        activityMetrics: [
          { label: "Total Dials", value: data.calls.made },
          { label: "Connected Calls", value: data.calls.connected },
          { label: "Connection Percentage", value: `${data.calls.connectedPercentage}%` },
          { label: "Avg Talk Time", value: `${Math.round(data.calls.avgTalkTimeSeconds || 0)}s` },
          { label: "Follow-ups Completed", value: data.followUps.completed },
          { label: "Lead-to-SV Rate", value: `${data.conversions.leadToSiteVisitPercentage}%` },
        ],
      }
    : null;

  if (loading && !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Synthesizing Pre-Sales Telemetry…
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 border border-rose-200/90 rounded-3xl p-6 m-4 flex items-center gap-4 shadow-sm">
        <AlertCircle size={22} className="text-rose-600 shrink-0" />
        <div>
          <h3 className="text-sm font-extrabold text-rose-950 m-0">
            Error loading pre-sales analytics
          </h3>
          <p className="text-xs text-rose-700 font-medium mt-1 m-0">
            {error || "Unknown error occurred while fetching metrics."}
          </p>
        </div>
      </div>
    );
  }

  const pipelineStages = [
    { name: "Total Leads", value: data.pipeline.totalLeads },
    { name: "New Leads", value: data.pipeline.newLeads },
    { name: "Contacted", value: data.pipeline.contacted },
    { name: "Interested", value: data.pipeline.interested },
    { name: "Qualified", value: data.pipeline.qualified },
    { name: "Site Visits", value: data.pipeline.siteVisits },
    { name: "Booked", value: data.pipeline.booked },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header with Title, Range Switcher & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 shadow-2xs">
              <Headphones size={18} className="stroke-[2.2]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight m-0">
              Pre-Sales Performance Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1 m-0">
            Pipeline velocity, telephonic efficiency, and qualification conversions.
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
            filenamePrefix="presales_analytics"
          />
        </div>
      </div>

      {/* KPI Stats Grid with Concentric Elevation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Pipeline"
          value={data.pipeline.totalLeads}
          subtitle="Active leads in queue"
          icon={Target}
          delay={0.04}
        />
        <StatCard
          title="Calls Made"
          value={data.calls.made}
          subtitle="Outbound dials"
          icon={PhoneOutgoing}
          delay={0.08}
        />
        <StatCard
          title="Conversations"
          value={data.calls.connected}
          subtitle={`${data.calls.connectedPercentage}% connection rate`}
          icon={PhoneIncoming}
          trend={data.calls.connectedPercentage >= 35 ? "up" : "neutral"}
          trendValue={`${data.calls.connectedPercentage}% connect`}
          delay={0.12}
        />
        <StatCard
          title="Follow-ups Done"
          value={data.followUps.completed}
          subtitle="Scheduled callbacks"
          icon={ListChecks}
          delay={0.16}
        />
        <StatCard
          title="Lost / Dropped"
          value={data.pipeline.lost}
          subtitle="Disqualified or cold"
          icon={XCircle}
          trend="down"
          trendValue="Requires audit"
          delay={0.2}
        />
      </div>

      {/* Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Stage & Telephony Section */}
        <div className="lg:col-span-2 space-y-6">
          <PremiumBarChart
            data={pipelineStages}
            title="Pipeline Stage Progression"
            description="Cumulative lead advancement through qualification stages"
            dataKey="value"
            categoryKey="name"
            color="#6366f1"
          />

          {/* Disposition & Avg Talk Time Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_14px_34px_-18px_rgba(15,23,42,0.08)] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-800 m-0">
                    Call Outcomes & Talk Time
                  </h3>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5 m-0">
                  Dial disposition breakdown across the selected period
                </p>
              </div>

              <div className="flex items-center gap-2.5 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200/80">
                <Clock size={14} className="text-indigo-600" />
                <div className="text-right">
                  <span className="text-[9px] uppercase font-extrabold text-slate-400 block tracking-wider">
                    Avg Talk Time
                  </span>
                  <span className="text-xs font-black text-slate-900 tabular-nums">
                    {data.calls.avgTalkTimeSeconds}s
                  </span>
                </div>
              </div>
            </div>

            <CallOutcomes outcomes={data.calls} />
          </div>
        </div>

        {/* Side Gauges & Lead Acquisition */}
        <div className="lg:col-span-1 space-y-6">
          {/* Telephonic Connect Rate Ring */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_14px_34px_-18px_rgba(15,23,42,0.08)] flex flex-col items-center justify-center">
            <div className="w-full flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                Connection Ratio
              </span>
              <span className="text-[10px] font-black text-slate-900">
                {data.calls.connected} / {data.calls.made}
              </span>
            </div>
            <CircularPercentage
              percentage={data.calls.connectedPercentage}
              label="Connected Rate"
              subLabel="Percentage of outbound dials answered"
              color={data.calls.connectedPercentage >= 35 ? "success" : "warning"}
              delay={0.2}
            />
          </div>

          {/* Lead to Site Visit Conversion Ring */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_14px_34px_-18px_rgba(15,23,42,0.08)] flex flex-col items-center justify-center">
            <div className="w-full flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                Pipeline Health
              </span>
              <span className="text-[10px] font-black text-slate-900">
                {data.pipeline.siteVisits} SVs Booked
              </span>
            </div>
            <CircularPercentage
              percentage={data.conversions.leadToSiteVisitPercentage}
              label="Lead to Site Visit"
              subLabel="Overall pipeline qualification conversion"
              color="primary"
              delay={0.25}
            />
          </div>

          {/* Top Channels */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_14px_34px_-18px_rgba(15,23,42,0.08)] space-y-3">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-800 m-0">
                Top Lead Channels
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5 m-0">
                Source attribution for incoming inquiries
              </p>
            </div>
            <LeadSourceChart data={data.sources} />
          </div>
        </div>
      </div>
    </div>
  );
}
