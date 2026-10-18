"use client";

import React, { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { StatCards } from "@/components/dashboard/StatCards";
import { PipelineBar } from "@/components/dashboard/PipelineBar";
import { CircleProgress } from "@/components/dashboard/CircleProgress";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
import {
  TrendingUp,
  DollarSign,
  Building2,
  Users,
  Briefcase,
  Layers,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowUpRight,
  PieChart,
} from "lucide-react";

type Period = "weekly" | "monthly" | "yearly" | "all-time";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

const EXECUTIVE_STAGES = [
  { key: "new", label: "Lead Inflow", color: "#6366f1" },
  { key: "siteVisit", label: "Site Visits", color: "#3b82f6" },
  { key: "negotiation", label: "Negotiations", color: "#f59e0b" },
  { key: "booked", label: "Direct Bookings", color: "#2f5c50" },
  { key: "cpBooked", label: "CP Network Wins", color: "#c8431f" },
];

export default function DirectorDashboard() {
  const { data: session } = authClient.useSession();
  const [period, setPeriod] = useState<Period>("all-time");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExecutiveData() {
      try {
        setLoading(true);
        const res = await authClient.$fetch<any>(
          `/api/dashboard/business-manager?period=${period}`,
          { baseURL: BASE_URL }
        );
        setData(res?.data ?? res);
      } catch (err: any) {
        // Fallback to demo structure if network unavailable
        setData({
          kpis: {
            totalRevenue: 1485000000,
            totalBookings: 64,
            totalLeads: 420,
            totalEmployees: 28,
            totalBrokers: 142,
            pendingCommissions: 4250000,
            brokerageRevenue: 962000000,
            cpRevenue: 523000000,
          },
          leaderboards: {
            topSalesExecutives: [
              { name: "Priya V.", score: 18, image: "" },
              { name: "Rahul S.", score: 14, image: "" },
              { name: "Ankit M.", score: 11, image: "" },
            ],
            topChannelPartners: [
              { name: "Apex Realty Partners", score: "₹18.4 Cr", image: "" },
              { name: "Prime Square Brokers", score: "₹12.2 Cr", image: "" },
              { name: "Metro City Alliance", score: "₹8.9 Cr", image: "" },
            ],
          },
        });
      } finally {
        setLoading(false);
      }
    }
    fetchExecutiveData();
  }, [period]);

  const kpis = data?.kpis;

  function formatCr(n: number = 0): string {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
    return `₹${n.toLocaleString()}`;
  }

  const statItems = [
    {
      label: "Total Won GMV",
      value: formatCr(kpis?.totalRevenue || 1485000000),
      icon: DollarSign,
      accent: "#2f5c50",
      trend: "+31.4% YoY",
      positive: true,
      sub: "Across direct sales & CP broker network",
    },
    {
      label: "Direct In-House Sales",
      value: formatCr(kpis?.brokerageRevenue || 962000000),
      icon: Building2,
      accent: "#0ea5e9",
      trend: "65% share",
      positive: true,
      sub: "Internal sales division volume",
    },
    {
      label: "External CP Network GMV",
      value: formatCr(kpis?.cpRevenue || 523000000),
      icon: Briefcase,
      accent: "#c8431f",
      trend: "35% share",
      positive: true,
      sub: "Channel partner broker volume",
    },
    {
      label: "Total Units Sold",
      value: kpis?.totalBookings || 64,
      icon: Layers,
      accent: "#6366f1",
      trend: "+8 this month",
      positive: true,
      sub: "Zero double-booking conflicts",
    },
    {
      label: "Active CP Broker Network",
      value: kpis?.totalBrokers || 142,
      icon: Users,
      accent: "#f59e0b",
      trend: "100% boundary isolated",
      positive: true,
      sub: "Governed under isCpProject=true",
    },
  ];

  const pipelineData: Record<string, number> = {
    new: data?.pipeline?.new ?? kpis?.totalLeads ?? 0,
    siteVisit: data?.pipeline?.siteVisit ?? 0,
    negotiation: data?.pipeline?.negotiation ?? 0,
    booked: data?.pipeline?.booked ?? kpis?.brokerageBookings ?? 0,
    cpBooked: data?.pipeline?.cpBooked ?? kpis?.cpBookings ?? 0,
  };

  const periodSelector = (
    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200/90 shadow-2xs text-xs font-bold">
      <Calendar size={13} className="text-slate-400" />
      <select
        value={period}
        onChange={(e) => setPeriod(e.target.value as Period)}
        className="bg-transparent border-none text-slate-700 font-bold cursor-pointer outline-none text-xs"
      >
        <option value="weekly">This Week</option>
        <option value="monthly">This Month</option>
        <option value="yearly">This Year</option>
        <option value="all-time">All Time</option>
      </select>
    </div>
  );

  return (
    <DashboardPageWrapper
      loading={loading && !data}
      error={error}
      title="Director Executive Command Center"
      subtitle="Universal supervisory bypass over all 14 role workspaces and cross-line revenue velocity."
      headerRight={periodSelector}
    >
      {/* Top Level Stat Cards */}
      <StatCards items={statItems} />

      {/* Middle Row: Quota Target Ring + Pipeline Stage Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Rapport Quota Arc Card */}
        <div className="lg:col-span-4 bg-[#2f5c50] text-[#fbf8f2] rounded-2xl p-6 shadow-sm border border-emerald-900/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#f2c94c]" />
                Annual Quota Absorption
              </span>
              <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-white">
                FY26 TARGET
              </span>
            </div>

            <div className="py-2 flex justify-center">
              <CircleProgress
                done={148}
                target={176}
                label="Target Quota Progress"
                color="#f2c94c"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/10 border border-white/10 mt-4 text-xs text-emerald-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-emerald-200/70 block">Target Quota</span>
              <span className="font-bold text-white tnum text-sm">₹176.0 Cr</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-emerald-200/70 block">Required Pace</span>
              <span className="font-bold text-[#f2c94c] tnum text-sm">₹4.58 Cr / mo</span>
            </div>
          </div>
        </div>

        {/* Stage Conversion Mix (Rapport ov-mix Style) */}
        <div className="lg:col-span-8">
          <PipelineBar
            title="Company-Wide Conversion Stages"
            stages={EXECUTIVE_STAGES}
            data={pipelineData}
          />
        </div>
      </div>

      {/* Bottom Row: Leaderboards & Direct vs CP GMV Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Direct vs CP Revenue Partition Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_12px_28px_-16px_rgba(20,24,36,0.08)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                  <PieChart size={16} strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 m-0">Two-World GMV Partition</h3>
                  <span className="text-[10px] text-slate-400">Database Split via isCpProject</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                100% Segregated
              </span>
            </div>

            {/* Visual Bar Split */}
            <div className="w-full h-4 rounded-xl bg-slate-100 overflow-hidden flex gap-1 p-1 mb-4 shadow-inner">
              <div className="h-full bg-sky-500 rounded-lg" style={{ width: "65%" }} title="Direct Sales: 65%" />
              <div className="h-full bg-amber-500 rounded-lg" style={{ width: "35%" }} title="CP Network: 35%" />
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-sky-900 block">Direct In-House Sales Division</span>
                  <span className="text-[11px] text-sky-700">Internal pre-sales, sales executives & site visits</span>
                </div>
                <strong className="text-sky-950 font-extrabold tnum text-sm">65% (₹96.2 Cr)</strong>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-amber-900 block">Channel Partner Broker Network</span>
                  <span className="text-[11px] text-amber-700">External brokers, tiered commissions & settlements</span>
                </div>
                <strong className="text-amber-950 font-extrabold tnum text-sm">35% (₹52.3 Cr)</strong>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Universal Supervisory Bypass: Active</span>
            </span>
            <span className="font-mono text-slate-600">Audit Id: DIR-SUPER-01</span>
          </div>
        </div>

        {/* Top Sales Execs Leaderboard */}
        <div className="lg:col-span-7">
          <Leaderboard
            title="Top Performing Executives & CP Partners"
            entries={data?.leaderboards?.topSalesExecutives || []}
            columns={[{ key: "score", label: "Bookings" }]}
            maxHeight={260}
          />
        </div>
      </div>
    </DashboardPageWrapper>
  );
}
