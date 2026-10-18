"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { StatCards } from "@/components/dashboard/StatCards";
import { CPActionTasks } from "./components/CPActionTasks";
import { CPLeaderboards } from "./components/CPLeaderboards";
import { CPSalesPipeline } from "./components/CPSalesPipeline";
import { Calendar } from "lucide-react";
import {
  Key, DollarSign, Building, Briefcase, Target, RefreshCw,
} from "lucide-react";

type Period = "weekly" | "monthly" | "yearly" | "all-time";

export default function ChannelPartnerDashboard() {
  const { data: session } = authClient.useSession();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [data, setData]     = useState<any>(null);
  const [period, setPeriod] = useState<Period>("all-time");

  useEffect(() => {
    async function fetchData() {
      setStatus("loading");
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
        const res = await authClient.$fetch(`/api/dashboard/channel-partner?period=${period}`, { baseURL: baseUrl });
        if (res.error) throw new Error(res.error.message || "Failed");
        setData(res.data ?? res);
        setStatus("success");
      } catch {
        setStatus("error");
      }
    }
    fetchData();
  }, [period]);

  const kpis = data?.kpis;
  const statItems = kpis ? [
    { label: "Total Units Sold",      value: kpis.totalUnitsSold ?? 0,       icon: Key,       accent: "#0369a1" },
    { label: "Total Booking Revenue", value: "₹" + ((kpis.totalBookingRevenue || 0) / 100000).toFixed(1) + "L", icon: DollarSign, accent: "#15803d" },
    { label: "Revenue Generated",     value: "₹" + ((kpis.totalRevenueGenerated || 0) / 100000).toFixed(1) + "L", icon: Building,   accent: "#6d28d9" },
    { label: "Broker Commission",     value: "₹" + ((kpis.totalBrokerCommission || 0) / 100000).toFixed(1) + "L", icon: DollarSign, accent: "#b45309" },
    { label: "Total Brokers",         value: kpis.totalBrokers ?? 0,         icon: Briefcase, accent: "#7c3aed" },
    { label: "Total Leads",           value: kpis.totalLeads ?? 0,           icon: Target,    accent: "#7c3aed" },
    { label: "Pending Follow-ups",    value: kpis.totalFollowsPending ?? 0,  icon: RefreshCw, accent: "#be123c" },
  ] : [];

  /* Period selector */
  const periodSelector = (
    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md border border-slate-200/90 px-3.5 py-1.5 rounded-2xl shadow-xs transition-all hover:border-slate-300">
      <Calendar size={14} className="text-slate-400" />
      <select
        value={period}
        onChange={(e) => setPeriod(e.target.value as Period)}
        aria-label="Filter Channel Partner dashboard by period"
        className="bg-transparent border-none text-xs font-black text-slate-800 cursor-pointer outline-none tracking-tight pr-1"
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
      loading={status === "loading" && !data}
      error={status === "error" ? "Failed to load dashboard data." : null}
      title="Channel Partner Management"
      subtitle={`Welcome back${data?.broker?.name ? ", " + data.broker.name : ""}. Track the performance of your broker network.`}
      headerRight={periodSelector}
    >
      {/* KPI Stats */}
      {kpis && <StatCards items={statItems} />}

      {/* Action Tasks */}
      {data?.actionTasks && (
        <CPActionTasks tasks={data.actionTasks} />
      )}

      {/* Sales Pipeline */}
      {data?.pipeline && (
        <CPSalesPipeline pipeline={data.pipeline} />
      )}

      {/* Leaderboards */}
      {data?.leaderboards && (
        <CPLeaderboards leaderboards={data.leaderboards} />
      )}
    </DashboardPageWrapper>
  );
}
