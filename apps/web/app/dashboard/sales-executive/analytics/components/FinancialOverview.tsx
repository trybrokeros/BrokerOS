"use client";

import React from "react";
import { IndianRupee, Wallet, TrendingUp, Sparkles } from "lucide-react";
import { StatCard } from "@/components/analytics/StatCard";

export function FinancialOverview({ financialData }: { financialData: any }) {
  if (!financialData) return null;

  const formatINR = (val: number) => {
    const num = Number(val || 0);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
      <StatCard
        title="Total Revenue (Sold)"
        value={formatINR(financialData.totalRevenue)}
        subtitle="Locked-in Gross Booking Value"
        icon={IndianRupee}
        trend="up"
        trendValue="Closed Deals"
        delay={0.04}
      />
      <StatCard
        title="Realized Commission"
        value={formatINR(financialData.realizedCommission)}
        subtitle="Earned from Confirmed Bookings"
        icon={Wallet}
        trend="up"
        trendValue="Realized"
        delay={0.08}
      />
      <StatCard
        title="Projected Commission"
        value={formatINR(financialData.projectedCommission)}
        subtitle="Pipeline from Active Negotiations"
        icon={TrendingUp}
        trend="neutral"
        trendValue="In-Flight"
        delay={0.12}
      />
    </div>
  );
}
