"use client";

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Eye,
  PhoneCall,
  Mail,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Building,
} from "lucide-react";

export interface AnalyticsScorecardsProps {
  totalSpend: number;
  blendedCpl: number;
  totalLeads: number;
  totalImpressions: number;
  outreachVolume: number;
  pipelineValueCr: number;
  avgCallDurationSec?: number;
}

export function AnalyticsScorecards({
  totalSpend = 268500,
  blendedCpl = 2065,
  totalLeads = 130,
  totalImpressions = 142500,
  outreachVolume = 38400,
  pipelineValueCr = 18.5,
  avgCallDurationSec = 142,
}: AnalyticsScorecardsProps) {
  const cards = [
    {
      id: "spend",
      label: "Total Marketing Spend",
      value: `₹${totalSpend.toLocaleString("en-IN")}`,
      sub: "Paid Ads & Outbound Gateways",
      change: "+12.4%",
      isPositive: true,
      icon: DollarSign,
      iconBg: "bg-blue-50 text-blue-600",
      borderAccent: "hover:border-blue-300",
    },
    {
      id: "cpl",
      label: "Blended Cost per Lead (CPL)",
      value: `₹${blendedCpl.toLocaleString("en-IN")}`,
      sub: "Target CPL: ₹2,500 (-17.4% under budget)",
      change: "-17.4%",
      isPositive: true, // Lower CPL is good!
      icon: TrendingDown,
      iconBg: "bg-emerald-50 text-emerald-600",
      borderAccent: "hover:border-emerald-300",
    },
    {
      id: "leads",
      label: "Acquired Buyer Leads",
      value: totalLeads.toLocaleString(),
      sub: "Verified phone & budget confirmed",
      change: "+28.6%",
      isPositive: true,
      icon: Users,
      iconBg: "bg-purple-50 text-purple-600",
      borderAccent: "hover:border-purple-300",
    },
    {
      id: "impressions",
      label: "Omnichannel Reach",
      value: totalImpressions.toLocaleString(),
      sub: "Meta, Google, IG, YouTube & Direct",
      change: "+34.1%",
      isPositive: true,
      icon: Eye,
      iconBg: "bg-amber-50 text-amber-600",
      borderAccent: "hover:border-amber-300",
    },
    {
      id: "outreaches",
      label: "Direct Outreaches Dispatched",
      value: outreachVolume.toLocaleString(),
      sub: "WhatsApp HSM, Voice Calls, SMS & Email",
      change: "+19.0%",
      isPositive: true,
      icon: PhoneCall,
      iconBg: "bg-indigo-50 text-indigo-600",
      borderAccent: "hover:border-indigo-300",
    },
    {
      id: "pipeline",
      label: "Marketing Pipeline Value",
      value: `₹${pipelineValueCr} Cr`,
      sub: "Attributed Booking Gross Deal Value",
      change: "+22.5%",
      isPositive: true,
      icon: Building,
      iconBg: "bg-rose-50 text-rose-600",
      borderAccent: "hover:border-rose-300",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.id}
            className={`bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs transition-all duration-200 flex flex-col justify-between ${c.borderAccent}`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                  {c.label}
                </span>
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${c.iconBg}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="text-xl font-black text-[var(--text-primary)] tracking-tight">
                {c.value}
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 truncate max-w-[110px]" title={c.sub}>
                {c.sub}
              </span>
              <span
                className={`inline-flex items-center gap-0.5 font-bold px-1.5 py-0.5 rounded text-[10px] ${
                  c.isPositive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                <ArrowUpRight className="w-2.5 h-2.5" />
                {c.change}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
