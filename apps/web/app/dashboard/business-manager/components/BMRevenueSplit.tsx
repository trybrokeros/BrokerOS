"use client";

import React from "react";
import { TrendingUp, PieChart, Building2, Briefcase } from "lucide-react";

interface RevenueItem {
  brokerage: number;
  cp: number;
  total: number;
  brokeragePercent: number;
  cpPercent: number;
}

export function BMRevenueSplit({ revenueByBusiness }: { revenueByBusiness: RevenueItem }) {
  if (!revenueByBusiness) return null;

  const { brokerage, cp, total, brokeragePercent, cpPercent } = revenueByBusiness;

  const formatCr = (n: number) =>
    n >= 10000000
      ? `₹${(n / 10000000).toFixed(2)} Cr`
      : n >= 100000
      ? `₹${(n / 100000).toFixed(1)} L`
      : `₹${n.toLocaleString("en-IN")}`;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_12px_28px_-16px_rgba(20,24,36,0.08)] flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700">
              <PieChart size={16} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 tracking-tight m-0">
                Two-World Revenue Partition
              </h2>
              <span className="text-[10px] text-slate-400">
                Direct Brokerage vs External Channel Partner
              </span>
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900 tnum">
            {formatCr(total)}
          </div>
        </div>

        {/* Split bar (Rapport ov-mix Style) */}
        <div className="h-4 w-full bg-slate-100 rounded-xl overflow-hidden flex gap-1 p-1 mb-5 shadow-inner">
          <div
            className="h-full bg-indigo-600 rounded-lg transition-all duration-700"
            style={{ width: `${brokeragePercent}%` }}
            title={`Direct Brokerage: ${brokeragePercent}%`}
          />
          <div
            className="h-full bg-sky-500 rounded-lg transition-all duration-700"
            style={{ width: `${cpPercent}%` }}
            title={`CP Network: ${cpPercent}%`}
          />
        </div>

        {/* Legends */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Direct Sales Brokerage */}
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-900">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                Direct Sales (Internal)
              </span>
              <span className="text-[10px] font-extrabold text-indigo-700 bg-white/80 border border-indigo-200 px-1.5 py-0.2 rounded-md">
                isCpProject = false
              </span>
            </div>
            <div className="text-lg font-extrabold text-slate-900 tnum">
              {formatCr(brokerage)}
            </div>
            <div className="text-xs font-bold text-indigo-700 mt-1">
              {brokeragePercent}% of total revenue
            </div>
          </div>

          {/* CP Network */}
          <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-sky-900">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                CP Broker Network
              </span>
              <span className="text-[10px] font-extrabold text-sky-700 bg-white/80 border border-sky-200 px-1.5 py-0.2 rounded-md">
                isCpProject = true
              </span>
            </div>
            <div className="text-lg font-extrabold text-slate-900 tnum">
              {formatCr(cp)}
            </div>
            <div className="text-xs font-bold text-sky-700 mt-1">
              {cpPercent}% of total revenue
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
