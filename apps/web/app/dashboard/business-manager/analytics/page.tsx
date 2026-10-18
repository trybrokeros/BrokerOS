"use client";

import React, { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
  Briefcase,
  IndianRupee,
  Layers,
  AlertCircle,
  Loader2,
  DollarSign,
  Building2,
} from "lucide-react";
import { ExportAnalyticsReportButton } from "@/components/analytics/ExportAnalyticsReportButton";
import { StatCard } from "@/components/analytics/StatCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type Period = "weekly" | "monthly" | "yearly" | "all-time";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

const formatCurrency = (val: number) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)} K`;
  return `₹${Number(val || 0).toLocaleString("en-IN")}`;
};

export default function BusinessManagerAnalytics() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [data, setData] = useState<any>(null);
  const [period, setPeriod] = useState<Period>("all-time");

  useEffect(() => {
    async function fetchData() {
      setStatus("loading");
      try {
        const res = await authClient.$fetch(
          `/api/dashboard/business-manager/analytics?period=${period}`,
          { baseURL: BASE_URL }
        );
        if ((res as any).error) throw new Error("Failed");
        setData((res as any).data ?? res);
        setStatus("success");
      } catch {
        setStatus("error");
      }
    }
    fetchData();
  }, [period]);

  const ranges: { id: Period; label: string }[] = [
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
    { id: "yearly", label: "Yearly" },
    { id: "all-time", label: "All Time" },
  ];

  const reportPayload = data
    ? {
      departmentName: "Business Manager Enterprise Cross-Unit Analytics",
      departmentCode: "BUSINESS_MANAGER",
      timeRange: period,
      generatedAt: new Date().toLocaleString(),
      summaryCards: [
        {
          label: "Total Revenue Collected",
          value: formatCurrency(data.paymentEfficiency?.totalCollected || 0),
          subtitle: "Collections",
        },
        {
          label: "Outstanding Receivables",
          value: formatCurrency(data.paymentEfficiency?.outstanding || 0),
          subtitle: "Pending payments",
        },
        {
          label: "Brokerage Confirmed Deals",
          value: data.bookingFunnel?.brokerage?.confirmed ?? 0,
          subtitle: "Internal sales",
        },
        {
          label: "CP Confirmed Deals",
          value: data.bookingFunnel?.cp?.confirmed ?? 0,
          subtitle: "Channel partner network",
        },
      ],
      funnelStages: [
        {
          name: "New Inquiries",
          count:
            (data.leadPipeline?.brokerage?.NEW || 0) +
            (data.leadPipeline?.cp?.NEW || 0),
          color: "#6366f1",
        },
        {
          name: "Contacted Leads",
          count:
            (data.leadPipeline?.brokerage?.CONTACTED || 0) +
            (data.leadPipeline?.cp?.CONTACTED || 0),
          color: "#818cf8",
        },
        {
          name: "Interested",
          count:
            (data.leadPipeline?.brokerage?.INTERESTED || 0) +
            (data.leadPipeline?.cp?.INTERESTED || 0),
          color: "#a855f7",
        },
        {
          name: "Qualified",
          count:
            (data.leadPipeline?.brokerage?.QUALIFIED || 0) +
            (data.leadPipeline?.cp?.QUALIFIED || 0),
          color: "#fbbf24",
        },
        {
          name: "Site Visits",
          count:
            (data.leadPipeline?.brokerage?.SITE_VISIT_SCHEDULED || 0) +
            (data.leadPipeline?.cp?.SITE_VISIT_SCHEDULED || 0),
          color: "#34d399",
        },
        {
          name: "Confirmed Bookings",
          count:
            (data.bookingFunnel?.brokerage?.confirmed || 0) +
            (data.bookingFunnel?.cp?.confirmed || 0),
          color: "#10b981",
        },
      ],
      financialMetrics: [
        {
          label: "Total Collected Capital",
          value: formatCurrency(data.paymentEfficiency?.totalCollected || 0),
        },
        {
          label: "Total Outstanding Demands",
          value: formatCurrency(data.paymentEfficiency?.outstanding || 0),
        },
      ],
      activityMetrics: [
        {
          label: "Brokerage Confirmed Bookings",
          value: data.bookingFunnel?.brokerage?.confirmed ?? 0,
        },
        {
          label: "CP Confirmed Bookings",
          value: data.bookingFunnel?.cp?.confirmed ?? 0,
        },
        {
          label: "Brokerage Handover Completed",
          value: data.bookingFunnel?.brokerage?.handover ?? 0,
        },
        {
          label: "CP Handover Completed",
          value: data.bookingFunnel?.cp?.handover ?? 0,
        },
      ],
    }
    : null;

  // Transform data for charts
  const leadPipelineData = data?.leadPipeline
    ? [
      {
        stage: "New",
        Brokerage: data.leadPipeline.brokerage?.NEW || 0,
        CP: data.leadPipeline.cp?.NEW || 0,
      },
      {
        stage: "Contacted",
        Brokerage: data.leadPipeline.brokerage?.CONTACTED || 0,
        CP: data.leadPipeline.cp?.CONTACTED || 0,
      },
      {
        stage: "Interested",
        Brokerage: data.leadPipeline.brokerage?.INTERESTED || 0,
        CP: data.leadPipeline.cp?.INTERESTED || 0,
      },
      {
        stage: "Qualified",
        Brokerage: data.leadPipeline.brokerage?.QUALIFIED || 0,
        CP: data.leadPipeline.cp?.QUALIFIED || 0,
      },
      {
        stage: "Site Visit",
        Brokerage: data.leadPipeline.brokerage?.SITE_VISIT_SCHEDULED || 0,
        CP: data.leadPipeline.cp?.SITE_VISIT_SCHEDULED || 0,
      },
      {
        stage: "Negotiation",
        Brokerage: data.leadPipeline.brokerage?.NEGOTIATION || 0,
        CP: data.leadPipeline.cp?.NEGOTIATION || 0,
      },
      {
        stage: "Booking",
        Brokerage: data.leadPipeline.brokerage?.BOOKING || 0,
        CP: data.leadPipeline.cp?.BOOKING || 0,
      },
    ]
    : [];

  const bookingFunnelData = data?.bookingFunnel
    ? [
      {
        stage: "Confirmed",
        Brokerage: data.bookingFunnel.brokerage?.confirmed || 0,
        CP: data.bookingFunnel.cp?.confirmed || 0,
      },
      {
        stage: "Documentation",
        Brokerage: data.bookingFunnel.brokerage?.documentation || 0,
        CP: data.bookingFunnel.cp?.documentation || 0,
      },
      {
        stage: "Loan/Agreement",
        Brokerage: data.bookingFunnel.brokerage?.loanAgreement || 0,
        CP: data.bookingFunnel.cp?.loanAgreement || 0,
      },
      {
        stage: "Possession",
        Brokerage: data.bookingFunnel.brokerage?.possession || 0,
        CP: data.bookingFunnel.cp?.possession || 0,
      },
      {
        stage: "Handover",
        Brokerage: data.bookingFunnel.brokerage?.handover || 0,
        CP: data.bookingFunnel.cp?.handover || 0,
      },
    ]
    : [];

  const paymentData = data?.paymentEfficiency
    ? [
      { name: "Collected", value: data.paymentEfficiency.totalCollected },
      { name: "Outstanding", value: data.paymentEfficiency.outstanding },
    ]
    : [];
  const PAYMENT_COLORS = ["#10b981", "#f59e0b"];

  const renderCard = (
    title: string,
    subtitle: string,
    children: React.ReactNode,
    className = ""
  ) => (
    <div
      className={`bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_14px_34px_-18px_rgba(15,23,42,0.08)] flex flex-col justify-between ${className}`}
    >
      <div className="pb-3 border-b border-slate-100 mb-4">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-800 m-0">
          {title}
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5 m-0">
          {subtitle}
        </p>
      </div>
      <div className="h-[280px] w-full">{children}</div>
    </div>
  );

  return (
    <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 shadow-2xs">
              <Briefcase size={18} className="stroke-[2.2]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight m-0">
              Cross-Business Enterprise Intelligence
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1 m-0">
            Comparative performance between Internal Brokerage and External Channel Partner divisions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200/80 shadow-2xs">
            {ranges.map((r) => (
              <button
                key={r.id}
                onClick={() => setPeriod(r.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${period === r.id
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
            filenamePrefix="business_manager_analytics"
          />
        </div>
      </div>

      {status === "loading" && !data && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Synthesizing Cross-Business Enterprise Analytics…
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200/90 text-center shadow-sm">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <h2 className="text-sm font-extrabold text-rose-900 mb-0.5">
            Failed to Load Business Analytics
          </h2>
          <p className="text-xs text-rose-600 font-medium m-0">
            Please check network connectivity or backend API endpoints.
          </p>
        </div>
      )}

      {status === "success" && data && (
        <div className="space-y-8">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Collected"
              value={formatCurrency(data.paymentEfficiency?.totalCollected || 0)}
              subtitle="Audited collections"
              icon={IndianRupee}
              trend="up"
              trendValue="Realized"
              delay={0.04}
            />
            <StatCard
              title="Receivables Pending"
              value={formatCurrency(data.paymentEfficiency?.outstanding || 0)}
              subtitle="Outstanding milestones"
              icon={DollarSign}
              trend={data.paymentEfficiency?.outstanding > 0 ? "down" : "neutral"}
              trendValue="Receivables"
              delay={0.08}
            />
            <StatCard
              title="Brokerage Bookings"
              value={data.bookingFunnel?.brokerage?.confirmed ?? 0}
              subtitle="Internal sales closures"
              icon={Building2}
              trend="up"
              trendValue="Internal"
              delay={0.12}
            />
            <StatCard
              title="CP Network Bookings"
              value={data.bookingFunnel?.cp?.confirmed ?? 0}
              subtitle="External broker sales"
              icon={Layers}
              trend="up"
              trendValue="CP Network"
              delay={0.16}
            />
          </div>

          {/* Analytical Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* 1. Revenue Trend Area Chart */}
            {renderCard(
              "Revenue Trajectory (Brokerage vs CP)",
              "Dual-engine gross sales volume comparison over time",
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueTrend}>
                  <defs>
                    <linearGradient id="colorBrok" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorCp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fontWeight: 700, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    dy={6}
                  />
                  <YAxis
                    tickFormatter={(val) => formatCurrency(val)}
                    tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    width={70}
                  />
                  <Tooltip
                    formatter={(value: any) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      borderRadius: "16px",
                      border: "1px solid #1e293b",
                      color: "#fff",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="brokerage"
                    name="Brokerage"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fill="url(#colorBrok)"
                  />
                  <Area
                    type="monotone"
                    dataKey="cp"
                    name="Channel Partner"
                    stroke="#0ea5e9"
                    strokeWidth={2.5}
                    fill="url(#colorCp)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {/* 2. Lead Pipeline Funnel Comparison */}
            {renderCard(
              "Lead Pipeline Distribution",
              "Comparative prospect volume at each sales milestone",
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadPipelineData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="stage"
                    tick={{ fontSize: 11, fontWeight: 700, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    dy={6}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      borderRadius: "16px",
                      border: "1px solid #1e293b",
                      color: "#fff",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                    }}
                  />
                  <Bar
                    dataKey="Brokerage"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                    barSize={16}
                  />
                  <Bar
                    dataKey="CP"
                    name="Channel Partner"
                    fill="#0ea5e9"
                    radius={[6, 6, 0, 0]}
                    barSize={16}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* 3. Booking Progression */}
            {renderCard(
              "Booking Progression Journey",
              "Throughput from confirmed booking to key possession",
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingFunnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    dataKey="stage"
                    type="category"
                    tick={{ fontSize: 11, fontWeight: 700, fill: "#334155" }}
                    axisLine={false}
                    tickLine={false}
                    width={105}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      borderRadius: "16px",
                      border: "1px solid #1e293b",
                      color: "#fff",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                    }}
                  />
                  <Bar
                    dataKey="Brokerage"
                    stackId="a"
                    fill="#8b5cf6"
                    barSize={20}
                    radius={[4, 0, 0, 4]}
                  />
                  <Bar
                    dataKey="CP"
                    name="Channel Partner"
                    stackId="a"
                    fill="#10b981"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* 4. Payment Collection Efficiency */}
            {renderCard(
              "Capital Collection Efficiency",
              "Realized milestone inflows vs outstanding buyer dues",
              <div className="flex h-full items-center gap-4">
                <div className="relative w-1/2 h-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={72}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={6}
                      >
                        {paymentData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => formatCurrency(Number(value))}
                        contentStyle={{
                          backgroundColor: "rgba(15, 23, 42, 0.95)",
                          borderRadius: "16px",
                          border: "1px solid #1e293b",
                          color: "#fff",
                          fontSize: "11px",
                          fontWeight: 700,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xs font-black text-slate-900 tabular-nums">
                      {data.paymentEfficiency?.totalPayable > 0
                        ? `${Math.round(
                          ((data.paymentEfficiency?.totalCollected || 0) /
                            data.paymentEfficiency.totalPayable) *
                          100
                        )}%`
                        : "0%"}
                    </span>
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                      Recovered
                    </span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-center space-y-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                      Total Payable
                    </span>
                    <div className="text-xl font-black text-slate-900 tabular-nums">
                      {formatCurrency(data.paymentEfficiency?.totalPayable || 0)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">
                        Collected
                      </span>
                      <span className="text-xs font-black text-slate-900 tabular-nums">
                        {formatCurrency(data.paymentEfficiency?.totalCollected || 0)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">
                        Outstanding
                      </span>
                      <span className="text-xs font-black text-slate-900 tabular-nums">
                        {formatCurrency(data.paymentEfficiency?.outstanding || 0)}
                      </span>
                    </div>
                  </div>

                  {data.paymentEfficiency?.overdue > 0 && (
                    <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200">
                      <span className="text-[9px] text-rose-600 font-extrabold uppercase tracking-wider block">
                        Overdue Risk
                      </span>
                      <span className="text-xs font-black text-rose-900 tabular-nums">
                        {formatCurrency(data.paymentEfficiency.overdue)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. Expense vs Revenue Composed Chart */}
            {renderCard(
              "Operating Expense vs Revenue",
              "Net cash-flow tracking and margin consistency",
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.expenseRevenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fontWeight: 700, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    dy={6}
                  />
                  <YAxis
                    yAxisId="left"
                    tickFormatter={(val) => formatCurrency(val)}
                    tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    width={70}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={(val) => formatCurrency(val)}
                    tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    width={70}
                  />
                  <Tooltip
                    formatter={(value: any) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      borderRadius: "16px",
                      border: "1px solid #1e293b",
                      color: "#fff",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                    }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="revenue"
                    name="Revenue"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    barSize={20}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="expense"
                    name="Expense"
                    stroke="#f43f5e"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#f43f5e" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}

            {/* 6. Lead Conversion Trend */}
            {renderCard(
              "Lead-to-Booking Velocity Trend",
              "Intake inquiries vs confirmed sales volume over time",
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.leadConversionTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fontWeight: 700, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    dy={6}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      borderRadius: "16px",
                      border: "1px solid #1e293b",
                      color: "#fff",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                    }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="leads"
                    name="New Leads"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                    barSize={20}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="bookings"
                    name="Bookings"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#f59e0b" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
