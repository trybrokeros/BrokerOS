"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Network, Loader2, AlertCircle } from "lucide-react";
import { ExportAnalyticsReportButton } from "@/components/analytics/ExportAnalyticsReportButton";

import { Overview } from "./_components/Overview";
import { RevenueCharts } from "./_components/RevenueCharts";
import { Insights } from "./_components/Insights";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("all-time");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      setStatus("loading");
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
        const res = await authClient.$fetch(
          `/api/dashboard/sourcing-manager/analytics?range=${timeRange}`,
          { baseURL: baseUrl }
        );
        if ((res as any).error) {
          throw new Error(
            (res as any).error.message || "Failed to load analytics"
          );
        }
        setData((res as any).data ?? res);
        setStatus("success");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    }
    fetchAnalytics();
  }, [timeRange]);

  const reportPayload = data
    ? {
        departmentName: "Sourcing Manager CP Analytics & Network Yield",
        departmentCode: "SOURCING_MANAGER",
        timeRange,
        generatedAt: new Date().toLocaleString(),
        summaryCards: [
          {
            label: "Active Brokers",
            value: data.topWidgets?.totalBrokers ?? 0,
            subtitle: "Registered CP Network",
          },
          {
            label: "Partner Meetings",
            value: data.topWidgets?.totalMeetings ?? 0,
            subtitle: "CP Connects",
          },
          {
            label: "Follow-ups Done",
            value: data.topWidgets?.totalFollowUps ?? 0,
            subtitle: "Relationship touches",
          },
          {
            label: "Deals Sourced",
            value: data.topWidgets?.totalBookingsGenerated ?? 0,
            subtitle: "Bookings generated",
          },
          {
            label: "Total Booking Revenue",
            value: `₹${(data.topWidgets?.totalBookingRevenue || 0).toLocaleString()}`,
            subtitle: "Gross token value",
          },
          {
            label: "Commission Disbursed",
            value: `₹${(data.topWidgets?.totalBrokerCommissionPaid || 0).toLocaleString()}`,
            subtitle: "Broker settlements",
          },
        ],
        funnelStages: [
          {
            name: "Active Brokers",
            count: data.topWidgets?.totalBrokers ?? 0,
            color: "#6366f1",
          },
          {
            name: "Partner Meetings",
            count: data.topWidgets?.totalMeetings ?? 0,
            color: "#a855f7",
          },
          {
            name: "Follow-ups Done",
            count: data.topWidgets?.totalFollowUps ?? 0,
            color: "#f59e0b",
          },
          {
            name: "Deals Sourced",
            count: data.topWidgets?.totalBookingsGenerated ?? 0,
            color: "#10b981",
          },
        ],
        financialMetrics: [
          {
            label: "Gross CP Booking Revenue",
            value: `₹${(data.topWidgets?.totalBookingRevenue || 0).toLocaleString()}`,
          },
          {
            label: "Disbursed Broker Commission",
            value: `₹${(data.topWidgets?.totalBrokerCommissionPaid || 0).toLocaleString()}`,
          },
          {
            label: "Handover Realized Revenue",
            value: `₹${(data.topWidgets?.totalRevenueHandoverDone || 0).toLocaleString()}`,
          },
        ],
        activityMetrics: [
          {
            label: "Registered CP Brokers",
            value: data.topWidgets?.totalBrokers ?? 0,
          },
          {
            label: "Sourcing Meetings Conducted",
            value: data.topWidgets?.totalMeetings ?? 0,
          },
          {
            label: "Broker Follow-ups",
            value: data.topWidgets?.totalFollowUps ?? 0,
          },
          {
            label: "Converted CP Bookings",
            value: data.topWidgets?.totalBookingsGenerated ?? 0,
          },
        ],
      }
    : null;

  const ranges = [
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
    { id: "yearly", label: "Yearly" },
    { id: "all-time", label: "All Time" },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 shadow-2xs">
              <Network size={18} className="stroke-[2.2]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight m-0">
              Sourcing Manager Network Yield Intelligence
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1 m-0">
            Analyze broker deal conversion funnels, partner activation rates & commission disbursement streams.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200/80 shadow-2xs">
            {ranges.map((range) => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  timeRange === range.id
                    ? "bg-white text-slate-900 shadow-xs font-extrabold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          <ExportAnalyticsReportButton
            payload={reportPayload}
            filenamePrefix="sourcing_manager_analytics"
          />
        </div>
      </div>

      {status === "loading" && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Synthesizing Broker Network Yield…
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="bg-rose-50 border border-rose-200/90 rounded-3xl p-6 flex items-center gap-4 text-xs font-bold text-rose-800 shadow-sm">
          <AlertCircle size={22} className="text-rose-600 shrink-0" />
          <span>Failed to load sourcing analytics. Please check backend connection.</span>
        </div>
      )}

      {status === "success" && data && (
        <div className="space-y-8">
          <Overview topWidgets={data.topWidgets} />
          <RevenueCharts charts={data.charts} />
          <Insights data={data} />
        </div>
      )}
    </div>
  );
}
