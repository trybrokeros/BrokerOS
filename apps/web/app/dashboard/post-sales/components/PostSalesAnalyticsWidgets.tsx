"use client";

import React from "react";
import { Users, Key, IndianRupee, Wallet, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/analytics/StatCard";

export interface PostSalesAnalyticsWidgetsData {
  totalBooked: number;
  totalHandoverCompleted: number;
  totalRevenue: number;
  totalCommission: number;
  conversionRate: string;
}

export function PostSalesAnalyticsWidgets({
  widgets,
}: {
  widgets: PostSalesAnalyticsWidgetsData;
}) {
  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const widgetData = [
    {
      label: "Booked Clients",
      value: widgets.totalBooked,
      subtitle: "Active post-sales customers",
      icon: Users,
      trend: "up" as const,
      trendValue: "In Intake",
    },
    {
      label: "Handovers Complete",
      value: widgets.totalHandoverCompleted,
      subtitle: "Keys delivered & possession",
      icon: Key,
      trend: "up" as const,
      trendValue: "Delivered",
    },
    {
      label: "Total Collections",
      value: formatCurrency(widgets.totalRevenue),
      subtitle: "Gross milestone collections",
      icon: IndianRupee,
      trend: "neutral" as const,
      trendValue: "Realized",
    },
    {
      label: "Inbound Brokerage",
      value: formatCurrency(widgets.totalCommission),
      subtitle: "Firm builder commission",
      icon: Wallet,
      trend: "up" as const,
      trendValue: "Earned",
    },
    {
      label: "Handover Yield",
      value: `${widgets.conversionRate}%`,
      subtitle: "Booking to possession efficiency",
      icon: TrendingUp,
      trend: "up" as const,
      trendValue: "Yield",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {widgetData.map((w, i) => (
        <StatCard
          key={w.label}
          title={w.label}
          value={w.value}
          subtitle={w.subtitle}
          icon={w.icon}
          trend={w.trend}
          trendValue={w.trendValue}
          delay={i * 0.04}
        />
      ))}
    </div>
  );
}
