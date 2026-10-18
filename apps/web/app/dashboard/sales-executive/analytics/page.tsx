"use client";

import React, { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Loader2, TrendingUp, AlertCircle, Award } from "lucide-react";
import { FinancialOverview } from "./components/FinancialOverview";
import { ConversionFunnelChart } from "./components/ConversionFunnelChart";
import { TowerHeatmap } from "./components/TowerHeatmap";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
import { ProjectAnalytics } from "./components/ProjectAnalytics";
import { DailyActivityHeatmap } from "./components/DailyActivityHeatmap";
import { ExportAnalyticsReportButton } from "@/components/analytics/ExportAnalyticsReportButton";

export default function SalesExecAnalyticsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [leaderboardData, setLeaderboardData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState("monthly");

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
      return;
    }

    if (session) {
      loadData();
    }
  }, [session, isPending, router, timeRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

      const [analyticsRes, lbRes] = await Promise.all([
        authClient.$fetch<any>(
          `/api/dashboard/sales-executive/analytics?timeRange=${timeRange}`,
          { baseURL: baseUrl }
        ),
        authClient.$fetch<any>("/api/dashboard/sales-executive/leaderboard", {
          baseURL: baseUrl,
        }),
      ]);

      if (analyticsRes.data) setAnalyticsData(analyticsRes.data);
      if (lbRes.data) setLeaderboardData(lbRes.data);
    } catch (e: any) {
      setError(e?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const reportPayload = analyticsData
    ? {
        departmentName: "Sales Executive Performance Analytics",
        departmentCode: "SALES_EXECUTIVE",
        timeRange,
        generatedAt: new Date().toLocaleString(),
        summaryCards: [
          {
            label: "Total Sales Revenue",
            value: `₹${(analyticsData.financial?.totalRevenue || 0).toLocaleString()}`,
            subtitle: "Booked Value",
          },
          {
            label: "Realized Commission",
            value: `₹${(analyticsData.financial?.realizedCommission || 0).toLocaleString()}`,
            subtitle: "Earned",
          },
          {
            label: "Projected Commission",
            value: `₹${(analyticsData.financial?.projectedCommission || 0).toLocaleString()}`,
            subtitle: "In-flight",
          },
          {
            label: "Units Sold",
            value: analyticsData.financial?.unitsSold ?? 0,
            subtitle: "Closed bookings",
          },
        ],
        funnelStages: [
          {
            name: "Active Leads",
            count: analyticsData.funnel?.leads ?? 0,
            color: "#6366f1",
          },
          {
            name: "Site Visits Done",
            count: analyticsData.funnel?.siteVisits ?? 0,
            color: "#a855f7",
          },
          {
            name: "In Negotiation",
            count: analyticsData.funnel?.negotiations ?? 0,
            color: "#f59e0b",
          },
          {
            name: "Confirmed Bookings",
            count: analyticsData.funnel?.bookings ?? 0,
            color: "#10b981",
          },
        ],
        financialMetrics: [
          {
            label: "Total Booked Revenue",
            value: `₹${(analyticsData.financial?.totalRevenue || 0).toLocaleString()}`,
          },
          {
            label: "Realized Commission Payout",
            value: `₹${(analyticsData.financial?.realizedCommission || 0).toLocaleString()}`,
          },
          {
            label: "Pipeline Projected Commission",
            value: `₹${(analyticsData.financial?.projectedCommission || 0).toLocaleString()}`,
          },
          {
            label: "Units Sold Count",
            value: analyticsData.financial?.unitsSold ?? 0,
          },
        ],
        detailedSections: [
          {
            title: "Funnel Progression & Conversion",
            metrics: [
              {
                label: "Total Assigned Leads",
                value: analyticsData.funnel?.leads ?? 0,
              },
              {
                label: "Site Visits Completed",
                value: analyticsData.funnel?.siteVisits ?? 0,
              },
              {
                label: "Offers Negotiated",
                value: analyticsData.funnel?.negotiations ?? 0,
              },
              {
                label: "Bookings Closed",
                value: analyticsData.funnel?.bookings ?? 0,
              },
              {
                label: "Overall Conversion Rate",
                value: `${analyticsData.funnel?.conversionRate ?? 0}%`,
              },
            ],
          },
        ],
      }
    : null;

  if (loading && !analyticsData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Synthesizing Executive Sales Performance…
        </p>
      </div>
    );
  }

  if (error && !analyticsData) {
    return (
      <div className="bg-rose-50 border border-rose-200/90 rounded-3xl p-6 m-4 flex items-center gap-4 shadow-sm">
        <AlertCircle size={22} className="text-rose-600 shrink-0" />
        <div>
          <h3 className="text-sm font-extrabold text-rose-950 m-0">
            Error loading performance analytics
          </h3>
          <p className="text-xs text-rose-700 font-medium mt-1 m-0">{error}</p>
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
              <Award size={18} className="stroke-[2.2]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight m-0">
              Executive Performance Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1 m-0">
            Revenue tracking, conversion funnels, unit inventory heatmaps & daily execution consistency.
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
            filenamePrefix="sales_exec_analytics"
          />
        </div>
      </div>

      {analyticsData && (
        <div className="space-y-8">
          {/* Financial Overview Cards */}
          <FinancialOverview financialData={analyticsData.financial} />

          {/* Funnel & Leaderboard Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            <div className="xl:col-span-1 h-full">
              <ConversionFunnelChart funnelData={analyticsData.funnel} />
            </div>
            <div className="xl:col-span-2">
              {leaderboardData && (
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_14px_34px_-18px_rgba(15,23,42,0.08)] overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-800 m-0">
                        Monthly Peer Leaderboard
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5 m-0">
                        Ranked real-time performance across sales executives
                      </p>
                    </div>
                  </div>
                  <Leaderboard
                    title="Peer Performance"
                    entries={leaderboardData.leaderboard || []}
                    currentUserId={leaderboardData.currentUserId || ""}
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

          {/* Tower Inventory Heatmap */}
          <TowerHeatmap inventoryData={analyticsData.inventory} />

          {/* 90-day Activity Heatmap */}
          <DailyActivityHeatmap activityData={analyticsData.activity} />

          {/* Project Analytics */}
          <ProjectAnalytics projectData={analyticsData.project} />
        </div>
      )}
    </div>
  );
}
