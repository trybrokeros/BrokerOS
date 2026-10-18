"use client";

import React from "react";
import {
  Target,
  CheckCircle,
  Clock,
  FileText,
  Banknote,
  IndianRupee,
  PieChart,
  CheckSquare,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function DetailedMetricsGrid({ metrics }: { metrics: any }) {
  if (!metrics) return null;

  const { salesFunnel, teamAnalytics, revenueAnalytics } = metrics;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-6 items-start">
      {/* Sales Pipeline Throughput (Rapport ov-mix Inspiration) */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_14px_34px_-18px_rgba(15,23,42,0.08)] flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 shadow-2xs">
                <PieChart size={16} strokeWidth={2.2} />
              </div>
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-800 m-0">
                  Pipeline Throughput
                </h3>
                <span className="text-[10px] text-slate-400 font-semibold">Funnel Stage Progression</span>
              </div>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full shadow-2xs">
              Live Funnel
            </span>
          </div>

          <div className="space-y-2">
            <MetricRow
              icon={<Target size={14} className="text-indigo-600" />}
              label="Assigned Inquiries"
              value={salesFunnel.assignedCustomers}
            />
            <MetricRow
              icon={<Clock size={14} className="text-amber-600" />}
              label="Site Visits Scheduled"
              value={salesFunnel.siteVisitsScheduled}
            />
            <MetricRow
              icon={<CheckCircle size={14} className="text-emerald-600" />}
              label="Site Visits Completed"
              value={salesFunnel.siteVisitsCompleted}
            />
            <MetricRow
              icon={<FileText size={14} className="text-sky-600" />}
              label="Active Price Negotiations"
              value={salesFunnel.negotiations}
            />
            <MetricRow
              icon={<CheckSquare size={14} className="text-indigo-600" />}
              label="Executive Follow-ups Done"
              value={teamAnalytics.followUpsCompleted}
            />
            <MetricRow
              icon={<Banknote size={14} className="text-emerald-700" />}
              label="Confirmed Bookings"
              value={salesFunnel.confirmedBookings}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={14} className="text-emerald-600 stroke-[2.5]" />
            <span className="text-xs font-extrabold text-slate-700">
              Win Rate Efficiency
            </span>
          </div>
          <span className="text-lg font-black text-emerald-700 tabular-nums">
            {salesFunnel.conversionRate}%
          </span>
        </div>
      </div>

      {/* Revenue Analytics (Rapport ov-rev Style) */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_14px_34px_-18px_rgba(15,23,42,0.08)] flex flex-col justify-between lg:col-span-2 space-y-5">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700 shadow-2xs">
                <IndianRupee size={16} strokeWidth={2.2} />
              </div>
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-800 m-0">
                  Revenue Velocity & Booking Projections
                </h3>
                <span className="text-[10px] text-slate-400 font-semibold">Audited Team Realized GMV</span>
              </div>
            </div>
            <span className="text-[10px] font-extrabold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
              Ledger Feed
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <RevenueCard label="Daily Bookings" value={revenueAnalytics.daily} />
            <RevenueCard label="Weekly Bookings" value={revenueAnalytics.weekly} />
            <RevenueCard label="Monthly Bookings" value={revenueAnalytics.monthly} />
            <RevenueCard label="Projected Absorption" value={revenueAnalytics.projected} />
          </div>
        </div>

        <div className="space-y-2 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
              Booking Revenue Velocity Curve (Last 7 Days)
            </span>
            <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-full shadow-2xs">
              Daily Realized
            </span>
          </div>

          <div className="h-36 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueAnalytics.trend}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  formatter={(value: any) =>
                    new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                    }).format(value)
                  }
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid #1e293b",
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    color: "#ffffff",
                    boxShadow: "0 14px 28px rgba(0,0,0,0.15)",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorTrend)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-xl bg-slate-50 border border-slate-100 shadow-2xs">{icon}</div>
        <span className="text-xs font-bold text-slate-700">{label}</span>
      </div>
      <span className="text-xs font-black text-slate-900 tabular-nums bg-slate-100/90 border border-slate-200/80 px-2.5 py-0.5 rounded-lg shadow-2xs">
        {value.toLocaleString()}
      </span>
    </div>
  );
}

function RevenueCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 bg-slate-50/90 border border-slate-200/90 rounded-2xl flex flex-col justify-between hover:bg-slate-100/60 transition-all shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_4px_12px_-6px_rgba(15,23,42,0.06)]">
      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 truncate">
        {label}
      </span>
      <span className="text-lg font-black text-slate-900 tabular-nums truncate">
        {value >= 10000000
          ? `₹${(value / 10000000).toFixed(2)} Cr`
          : value >= 100000
          ? `₹${(value / 100000).toFixed(2)} L`
          : new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(value)}
      </span>
    </div>
  );
}
