"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { AlertCircle, Loader2, Building, Layers } from "lucide-react";
import { Overview } from "./_components/Overview";
import { BookingFunnel } from "./_components/BookingFunnel";
import { RevenueCharts } from "./_components/RevenueCharts";
import { InventoryAnalytics } from "./_components/InventoryAnalytics";
import { BrokerPerformance } from "./_components/BrokerPerformance";
import { SMLeaderboard } from "./_components/SMLeaderboard";
import { CMLeaderboard } from "./_components/CMLeaderboard";
import { ConversionAnalytics } from "./_components/ConversionAnalytics";
import { BrokerageSettlement } from "./_components/BrokerageSettlement";
import { SiteVisitAnalytics } from "./_components/SiteVisitAnalytics";
import { ExportAnalyticsReportButton } from "@/components/analytics/ExportAnalyticsReportButton";

export default function CPAnalyticsPage() {
  const [range, setRange] = useState("all-time");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      setStatus("loading");
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
        const res = await authClient.$fetch(
          `/api/dashboard/channel-partner/analytics?range=${range}`,
          { baseURL: baseUrl }
        );
        if ((res as any).error) throw new Error("Failed");
        setData((res as any).data ?? res);
        setStatus("success");
      } catch {
        setStatus("error");
      }
    }
    load();
  }, [range]);

  const ranges = [
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
    { id: "yearly", label: "Yearly" },
    { id: "all-time", label: "All Time" },
  ];

  const reportPayload = data
    ? {
        departmentName: "Channel Partner Enterprise Operations & Network Analytics",
        departmentCode: "CHANNEL_PARTNER",
        timeRange: range,
        generatedAt: new Date().toLocaleString(),
        summaryCards: [
          {
            label: "Total Booked Revenue",
            value: `₹${(data.topWidgets?.totalRevenue || 0).toLocaleString()}`,
            subtitle: "Gross token value",
          },
          {
            label: "Total Bookings",
            value: data.topWidgets?.totalBookings ?? 0,
            subtitle: "Deals closed",
          },
          {
            label: "Units Sold",
            value: data.topWidgets?.totalUnitsSold ?? 0,
            subtitle: "Handover complete",
          },
          {
            label: "Units Reserved",
            value: data.topWidgets?.totalUnitsReserved ?? 0,
            subtitle: "Under token",
          },
          {
            label: "Handover Pending",
            value: data.topWidgets?.totalHandoverPending ?? 0,
            subtitle: "In pipeline",
          },
        ],
        funnelStages: [
          {
            name: "Active Brokers",
            count: data.topWidgets?.totalBrokers ?? 0,
            color: "#6366f1",
          },
          {
            name: "Site Visits",
            count: data.topWidgets?.totalSiteVisits ?? 0,
            color: "#a855f7",
          },
          {
            name: "Reserved Units",
            count: data.topWidgets?.totalUnitsReserved ?? 0,
            color: "#f59e0b",
          },
          {
            name: "Confirmed Bookings",
            count: data.topWidgets?.totalBookings ?? 0,
            color: "#10b981",
          },
          {
            name: "Units Handed Over",
            count: data.topWidgets?.totalUnitsSold ?? 0,
            color: "#059669",
          },
        ],
        financialMetrics: [
          {
            label: "Total CP Development Revenue",
            value: `₹${(data.topWidgets?.totalRevenue || 0).toLocaleString()}`,
          },
          {
            label: "Booking Token Revenue",
            value: `₹${(data.topWidgets?.totalBookingRevenue || 0).toLocaleString()}`,
          },
        ],
        activityMetrics: [
          {
            label: "Total Confirmed Bookings",
            value: data.topWidgets?.totalBookings ?? 0,
          },
          { label: "Units Sold", value: data.topWidgets?.totalUnitsSold ?? 0 },
          {
            label: "Units Reserved",
            value: data.topWidgets?.totalUnitsReserved ?? 0,
          },
          {
            label: "Handovers Pending",
            value: data.topWidgets?.totalHandoverPending ?? 0,
          },
        ],
      }
    : null;

  return (
    <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 shadow-2xs">
              <Layers size={18} className="stroke-[2.2]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight m-0">
              Channel Partner Enterprise Intelligence
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1 m-0">
            Comprehensive business intelligence across broker networks, sourcing/closing divisions & development inventory.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200/80 shadow-2xs">
            {ranges.map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  range === r.id
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
            filenamePrefix="channel_partner_analytics"
          />
        </div>
      </div>

      {status === "loading" && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Aggregating Channel Partner Enterprise Intelligence…
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200/90 text-center shadow-sm">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <h2 className="text-sm font-extrabold text-rose-900 mb-0.5">
            Failed to Load CP Analytics
          </h2>
          <p className="text-xs text-rose-600 font-medium m-0">
            Please check network connectivity or backend API endpoints.
          </p>
        </div>
      )}

      {status === "success" && data && (
        <div className="space-y-8">
          <Overview topWidgets={data.topWidgets} />
          <BookingFunnel bookingFunnel={data.bookingFunnel} />
          <RevenueCharts revenueCharts={data.revenueCharts} />
          <InventoryAnalytics inventoryAnalytics={data.inventoryAnalytics} />
          <BrokerPerformance brokerPerformance={data.brokerPerformance} />
          <SMLeaderboard smLeaderboard={data.smLeaderboard} />
          <CMLeaderboard cmLeaderboard={data.cmLeaderboard} />
          <ConversionAnalytics conversionRates={data.conversionRates} />
          <BrokerageSettlement brokerageSettlement={data.brokerageSettlement} />
          <SiteVisitAnalytics siteVisitAnalytics={data.siteVisitAnalytics} />
        </div>
      )}
    </div>
  );
}
