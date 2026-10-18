"use client";

import React, { useState } from "react";
import {
  Bar,
  BarChart,
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { BarChart3, TrendingUp } from "lucide-react";

interface PremiumBarChartProps {
  data: any[];
  title: string;
  description?: string;
  dataKey: string;
  categoryKey?: string;
  color?: string;
}

export default function PremiumBarChart({
  data,
  title,
  description,
  dataKey,
  categoryKey = "name",
  color = "#6366f1",
}: PremiumBarChartProps) {
  const [viewMode, setViewMode] = useState<"bar" | "curve">("bar");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const totalValue = data.reduce((acc, item) => acc + (Number(item[dataKey]) || 0), 0);
  const maxValue = Math.max(1, ...data.map((item) => Number(item[dataKey]) || 0));
  const gradientId = `barGradient-${title.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_14px_34px_-18px_rgba(15,23,42,0.08)] overflow-hidden p-6 transition-all">
      {/* Header with View Toggle & Total Volume */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight m-0">
              {title}
            </h3>
          </div>
          {description && (
            <p className="text-xs text-slate-500 font-medium mt-0.5 m-0">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-1.5 bg-slate-50 border border-slate-200/80 px-3 py-1 rounded-xl">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
              Total Volume:
            </span>
            <span className="text-xs font-black text-slate-900 tabular-nums">
              {totalValue.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/60 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("bar")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === "bar"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
                }`}
              title="Bar column view"
            >
              <BarChart3 size={14} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("curve")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === "curve"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
                }`}
              title="Spline curve view"
            >
              <TrendingUp size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Chart Container */}
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === "bar" ? (
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              onMouseMove={(state) => {
                if (state && state.activeTooltipIndex !== undefined && state.activeTooltipIndex !== null) {
                  const parsed = Number(state.activeTooltipIndex);
                  setActiveIndex(isNaN(parsed) ? null : parsed);
                }
              }}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.95} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey={categoryKey}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 600 }}
                tickFormatter={(val) =>
                  val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val
                }
              />
              <Tooltip
                cursor={{ fill: "rgba(241, 245, 249, 0.6)" }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const rawVal = Number(payload[0].value) || 0;
                    const pct = totalValue > 0 ? Math.round((rawVal / totalValue) * 100) : 0;
                    return (
                      <div className="bg-slate-950/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-2xl shadow-2xl border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                            {label}
                          </span>
                          <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-1.5 py-0.2 rounded-md">
                            {pct}% share
                          </span>
                        </div>
                        <p className="text-base font-black text-white tabular-nums m-0">
                          {rawVal.toLocaleString("en-IN")}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey={dataKey}
                fill={`url(#${gradientId})`}
                radius={[8, 8, 2, 2]}
                barSize={32}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={activeIndex === index ? color : `url(#${gradientId})`}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.65}
                    style={{ transition: "all 0.25s ease" }}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id={`${gradientId}-area`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey={categoryKey}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 600 }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const rawVal = Number(payload[0].value) || 0;
                    return (
                      <div className="bg-slate-950/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-2xl shadow-2xl border border-slate-800 text-xs">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                          {label}
                        </span>
                        <p className="text-base font-black text-white tabular-nums m-0 mt-0.5">
                          {rawVal.toLocaleString("en-IN")}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={3}
                fillOpacity={1}
                fill={`url(#${gradientId}-area)`}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
