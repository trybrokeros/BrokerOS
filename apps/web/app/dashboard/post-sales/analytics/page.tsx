"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import PremiumBarChart from "@/components/analytics/PremiumBarChart";
import {
  PostSalesAnalyticsWidgets,
  PostSalesAnalyticsWidgetsData,
} from "../components/PostSalesAnalyticsWidgets";
import { VelocityGauge } from "../components/VelocityGauge";
import { StatusPieChart } from "../components/StatusPieChart";
import {
  InventorySellThroughChart,
  InventorySellThroughData,
} from "../components/InventorySellThroughChart";
import { Loader2, KeyRound, AlertCircle } from "lucide-react";
import { ExportAnalyticsReportButton } from "@/components/analytics/ExportAnalyticsReportButton";

interface AnalyticsData {
  widgets: PostSalesAnalyticsWidgetsData;
  funnel: {
    booking: number;
    document: number;
    loan: number;
    agreement: number;
    handover: number;
  };
  velocity: number;
  loanSuccessRate: {
    approved: number;
    rejected: number;
    inProgress: number;
  };
  handoverReadiness: {
    notReady: number;
    scheduled: number;
    handedOver: number;
  };
  internalSalesDistribution: { projectName: string; soldUnits: number }[];
  inventorySellThrough: InventorySellThroughData[];
}

export default function PostSalesAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("monthly");

  useEffect(() => {
    async function load() {
      try {
        setStatus("loading");
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
        const res = await authClient.$fetch<AnalyticsData>(
          `/api/dashboard/post-sales/analytics?timeRange=${timeRange}`,
          { baseURL: baseUrl }
        );

        if (res.data) {
          setData(res.data);
          setStatus("success");
        } else if (res.error) {
          throw new Error(res.error.message || "Failed to load analytics");
        } else {
          setData(res as any);
          setStatus("success");
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load analytics");
        setStatus("error");
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
        departmentName: "Post-Sales Operational Analytics",
        departmentCode: "POST_SALES",
        timeRange,
        generatedAt: new Date().toLocaleString(),
        summaryCards: [
          {
            label: "Booked Customers",
            value: data.widgets?.totalBooked ?? 0,
            subtitle: "Total Booked",
          },
          {
            label: "Handover Complete",
            value: data.widgets?.totalHandoverCompleted ?? 0,
            subtitle: "Keys Delivered",
          },
          {
            label: "Total Revenue",
            value: `₹${(data.widgets?.totalRevenue || 0).toLocaleString()}`,
            subtitle: "Collections",
          },
          {
            label: "Total Commission",
            value: `₹${(data.widgets?.totalCommission || 0).toLocaleString()}`,
            subtitle: "Earned",
          },
          {
            label: "Velocity to Handover",
            value: `${data.velocity ?? 0} days`,
            subtitle: "Mean duration",
          },
        ],
        funnelStages: [
          {
            name: "Booking",
            count: data.funnel?.booking ?? 0,
            color: "#ec4899",
          },
          {
            name: "Document Verification",
            count: data.funnel?.document ?? 0,
            color: "#8b5cf6",
          },
          {
            name: "Bank Loan",
            count: data.funnel?.loan ?? 0,
            color: "#f59e0b",
          },
          {
            name: "Builder Agreement",
            count: data.funnel?.agreement ?? 0,
            color: "#3b82f6",
          },
          {
            name: "Possession Handover",
            count: data.funnel?.handover ?? 0,
            color: "#10b981",
          },
        ],
        financialMetrics: [
          {
            label: "Total Revenue Collected",
            value: `₹${(data.widgets?.totalRevenue || 0).toLocaleString()}`,
          },
          {
            label: "Inbound Brokerage Commission",
            value: `₹${(data.widgets?.totalCommission || 0).toLocaleString()}`,
          },
        ],
        activityMetrics: [
          {
            label: "Loan Success - Approved",
            value: data.loanSuccessRate?.approved ?? 0,
          },
          {
            label: "Loan In Progress",
            value: data.loanSuccessRate?.inProgress ?? 0,
          },
          {
            label: "Loan Rejected",
            value: data.loanSuccessRate?.rejected ?? 0,
          },
          {
            label: "Handover Scheduled",
            value: data.handoverReadiness?.scheduled ?? 0,
          },
          {
            label: "Handed Over",
            value: data.handoverReadiness?.handedOver ?? 0,
          },
          { label: "Velocity (Days)", value: `${data.velocity ?? 0} days` },
        ],
      }
    : null;

  return (
    <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 shadow-2xs">
              <KeyRound size={18} className="stroke-[2.2]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight m-0">
              Post-Sales Operations & Handover Intelligence
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1 m-0">
            Monitor client documentation, bank loan sanction ratios, possession readiness & inbound commission.
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
            filenamePrefix="postsales_analytics"
          />
        </div>
      </div>

      {status === "loading" && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Aggregating Post-Sales Telemetry…
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="bg-rose-50 border border-rose-200/90 rounded-3xl p-6 flex items-center gap-4 text-xs font-bold text-rose-800 shadow-sm">
          <AlertCircle size={22} className="text-rose-600 shrink-0" />
          <span>{error || "Failed to load post-sales analytics."}</span>
        </div>
      )}

      {status === "success" && data && (
        <div className="space-y-8">
          {/* Top KPI Widgets */}
          <PostSalesAnalyticsWidgets widgets={data.widgets} />

          {/* Funnel Progression & Velocity Gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2">
              <PremiumBarChart
                data={[
                  { name: "Booking", value: data.funnel.booking },
                  { name: "Document", value: data.funnel.document },
                  { name: "Bank Loan", value: data.funnel.loan },
                  { name: "Agreement", value: data.funnel.agreement },
                  { name: "Handover", value: data.funnel.handover },
                ]}
                title="Post-Sales Funnel Progression"
                description="Conversion journey from initial booking to possession keys"
                dataKey="value"
                categoryKey="name"
                color="#6366f1"
              />
            </div>
            <div className="lg:col-span-1 h-full">
              <VelocityGauge days={data.velocity} />
            </div>
          </div>

          {/* Loan Approval & Handover Readiness Donut Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <StatusPieChart
              title="Loan Sanction Success Rate"
              description="Breakdown of customer mortgage cases with partner banks"
              data={[
                {
                  name: "Approved",
                  value: data.loanSuccessRate.approved,
                  color: "#10b981",
                },
                {
                  name: "In Progress",
                  value: data.loanSuccessRate.inProgress,
                  color: "#f59e0b",
                },
                {
                  name: "Rejected",
                  value: data.loanSuccessRate.rejected,
                  color: "#f43f5e",
                },
              ]}
            />
            <StatusPieChart
              title="Possession Readiness Status"
              description="Readiness of units for final buyer walk-through"
              data={[
                {
                  name: "Not Ready",
                  value: data.handoverReadiness.notReady,
                  color: "#f43f5e",
                },
                {
                  name: "Scheduled",
                  value: data.handoverReadiness.scheduled,
                  color: "#3b82f6",
                },
                {
                  name: "Handed Over",
                  value: data.handoverReadiness.handedOver,
                  color: "#10b981",
                },
              ]}
            />
          </div>

          {/* Internal Sales Distribution & Inventory Sell-Through */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <StatusPieChart
              title="Internal Project Sales Distribution"
              description="Share of sold & reserved units per development"
              data={data.internalSalesDistribution.map((p, index) => {
                const colors = [
                  "#6366f1",
                  "#8b5cf6",
                  "#ec4899",
                  "#f59e0b",
                  "#10b981",
                  "#0ea5e9",
                  "#14b8a6",
                ];
                return {
                  name: p.projectName,
                  value: p.soldUnits,
                  color: colors[index % colors.length],
                };
              })}
            />
            <InventorySellThroughChart data={data.inventorySellThrough} />
          </div>
        </div>
      )}
    </div>
  );
}
