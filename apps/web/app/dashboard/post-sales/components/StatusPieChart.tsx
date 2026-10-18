"use client";

import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface StatusPieChartProps {
  data: ChartData[];
  title: string;
  description?: string;
}

export function StatusPieChart({
  data,
  title,
  description,
}: StatusPieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!data || data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <div className="w-full h-full min-h-[300px] flex flex-col p-6 bg-white rounded-3xl border border-slate-200/90 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_14px_34px_-18px_rgba(15,23,42,0.08)]">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-800 mb-1">
          {title}
        </h3>
        {description && (
          <p className="text-xs font-medium text-slate-500 mb-4">
            {description}
          </p>
        )}
        <div className="flex-1 flex items-center justify-center text-xs font-semibold text-slate-400 bg-slate-50 w-full rounded-2xl border border-slate-200 border-dashed">
          No records found for this period.
        </div>
      </div>
    );
  }

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="w-full h-full min-h-[320px] flex flex-col p-6 bg-white rounded-3xl border border-slate-200/90 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_14px_34px_-18px_rgba(15,23,42,0.08)] space-y-4">
      <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-800 m-0">
            {title}
          </h3>
          {description && (
            <p className="text-xs font-medium text-slate-500 mt-0.5 m-0">
              {description}
            </p>
          )}
        </div>
        <span className="text-xs font-black text-slate-900 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-xl">
          {total} Total
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center flex-1">
        {/* Donut Container with Centered Total */}
        <div className="relative h-44 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={74}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
                cornerRadius={6}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                    style={{ transition: "opacity 0.2s ease" }}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as ChartData;
                    const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                    return (
                      <div className="bg-slate-950/95 backdrop-blur-md text-white px-3 py-1.5 rounded-xl shadow-xl border border-slate-800 text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-bold">{item.name}:</span>
                          <span className="font-black tabular-nums">{item.value} ({pct}%)</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-black text-slate-900 tabular-nums leading-none">
              {activeIndex !== null ? data[activeIndex]?.value : total}
            </span>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mt-0.5 truncate max-w-[80px] text-center">
              {activeIndex !== null ? data[activeIndex]?.name : "Aggregate"}
            </span>
          </div>
        </div>

        {/* Rapport-style Legend Rows */}
        <div className="space-y-1.5">
          {data.map((item, index) => {
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
            const isHovered = activeIndex === index;
            return (
              <div
                key={item.name}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer border ${
                  isHovered
                    ? "bg-slate-50 border-slate-200/90 shadow-2xs"
                    : "bg-white border-transparent hover:border-slate-100"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-md shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs font-bold text-slate-700 truncate">
                    {item.name}
                  </span>
                </div>

                <div className="flex items-baseline gap-1.5 shrink-0 ml-2">
                  <span className="text-xs font-black text-slate-900 tabular-nums">
                    {item.value}
                  </span>
                  <span className="text-[10px] font-extrabold text-slate-400 tabular-nums">
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
