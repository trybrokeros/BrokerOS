"use client";

import React, { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Loader2, Users2, AlertCircle, TrendingUp } from "lucide-react";

import { FinancialOverview } from "../../sales-executive/analytics/components/FinancialOverview";
import { ConversionFunnelChart } from "../../sales-executive/analytics/components/ConversionFunnelChart";
import { TowerHeatmap } from "../../sales-executive/analytics/components/TowerHeatmap";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
import { DetailedMetricsGrid } from "../_components/DetailedMetricsGrid";
import { ExportAnalyticsReportButton } from "@/components/analytics/ExportAnalyticsReportButton";

export default function SalesManagerAnalyticsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("monthly");
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  const userId = session?.user?.id;

  useEffect(() => {
    if (!isPending && !userId) {
      router.replace("/login");
      return;
    }

    if (userId) {
      loadData();
    }
  }, [userId, isPending, router, timeRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

      const res = await authClient.$fetch<any>(
        `/api/dashboard/sales-manager/analytics?timeRange=${timeRange}`,
        { baseURL: baseUrl }
      );

      if (res.data) setAnalyticsData(res.data);
    } catch (e: any) {
      setError(e?.message || "Failed to load team analytics");
    } finally {
      setLoading(false);
    }
  };

  const reportPayload = analyticsData
    ? {
        departmentName: "Sales Manager Team Analytics & Forecasting",
        departmentCode: "SALES_MANAGER",
        timeRange,
        generatedAt: new Date().toLocaleString(),
        summaryCards: [
          {
            label: "Team Total Revenue",
            value: `₹${(analyticsData.financial?.totalRevenue || 0).toLocaleString()}`,
            subtitle: "Booked Gross Sales",
          },
          {
            label: "Team Deals Closed",
            value: analyticsData.financial?.dealsClosed ?? 0,
            subtitle: "Confirmed bookings",
          },
          {
            label: "Average Deal Size",
            value: `₹${(analyticsData.financial?.averageDealSize || 0).toLocaleString()}`,
            subtitle: "Per booking average",
          },
          {
            label: "Pipeline Value",
            value: `₹${(analyticsData.financial?.pipelineValue || 0).toLocaleString()}`,
            subtitle: "Open negotiation value",
          },
        ],
        funnelStages: analyticsData.funnel
          ? [
              {
                name: "Team Leads",
                count: analyticsData.funnel.leads ?? 0,
                color: "#6366f1",
              },
              {
                name: "Site Visits",
                count: analyticsData.funnel.siteVisits ?? 0,
                color: "#a855f7",
              },
              {
                name: "Negotiations",
                count: analyticsData.funnel.negotiations ?? 0,
                color: "#f59e0b",
              },
              {
                name: "Bookings",
                count: analyticsData.funnel.bookings ?? 0,
                color: "#10b981",
              },
            ]
          : undefined,
        financialMetrics: [
          {
            label: "Aggregate Team Revenue",
            value: `₹${(analyticsData.financial?.totalRevenue || 0).toLocaleString()}`,
          },
          {
            label: "Total Bookings Count",
            value: analyticsData.financial?.dealsClosed ?? 0,
          },
          {
            label: "Mean Ticket Size",
            value: `₹${(analyticsData.financial?.averageDealSize || 0).toLocaleString()}`,
          },
          {
            label: "In-Flight Pipeline Value",
            value: `₹${(analyticsData.financial?.pipelineValue || 0).toLocaleString()}`,
          },
        ],
      }
    : null;

  if (error) {
    return (
      <div className="p-4 sm:p-8 max-w-[1600px] mx-auto">
        <div className="bg-rose-50 border border-rose-200/90 rounded-3xl p-6 flex items-center gap-4 text-xs font-bold text-rose-800 shadow-sm">
          <AlertCircle size={22} className="text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const ranges = [
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
    { id: "yearly", label: "Yearly" },
    { id: "all-time", label: "All Time" },
  ];

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
              Team Sales Analytics & Forecasting
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1 m-0">
            Audit aggregate team sales revenue, deal velocity & assigned project inventory status.
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
            filenamePrefix="sales_manager_analytics"
          />
        </div>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Synthesizing Team Sales Intelligence…
          </p>
        </div>
      ) : analyticsData ? (
        <div className="space-y-8">
          {/* Financial Overview Cards */}
          <FinancialOverview financialData={analyticsData.financial} />

          {/* Detailed Pipeline & Revenue Grid */}
          <DetailedMetricsGrid metrics={analyticsData.detailedMetrics} />

          {/* Conversion Funnel & Leaderboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-1 h-full">
              <ConversionFunnelChart funnelData={analyticsData.funnel} />
            </div>
            <div className="lg:col-span-2">
              {analyticsData.leaderboard && (
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_14px_34px_-18px_rgba(15,23,42,0.08)] overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-800 m-0">
                        Sales Executive Leaderboard
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5 m-0">
                        Ranked closing performance across direct reports
                      </p>
                    </div>
                  </div>
                  <Leaderboard
                    title="Executive Performance"
                    entries={analyticsData.leaderboard || []}
                    currentUserId=""
                    columns={[
                      { key: "svCompleted", label: "SVs" },
                      { key: "activeNegotiations", label: "Neg" },
                      { key: "bookings", label: "Books" },
                      { key: "score", label: "Score" },
                    ]}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Assigned Project Inventory Status */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-800 m-0 px-1">
              Assigned Project Inventory Velocity
            </h3>
            <TowerHeatmap inventoryData={analyticsData.inventory} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
