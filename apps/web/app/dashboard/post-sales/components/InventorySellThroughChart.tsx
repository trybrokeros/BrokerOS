"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface InventorySellThroughData {
  projectName: string;
  totalUnits: number;
  soldUnits: number;
}

interface InventorySellThroughChartProps {
  data: InventorySellThroughData[];
}

export function InventorySellThroughChart({
  data,
}: InventorySellThroughChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full min-h-[340px] flex flex-col p-6 bg-white rounded-3xl border border-slate-200/90 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_14px_34px_-18px_rgba(15,23,42,0.08)]">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-800 mb-1">
          Inventory Absorption
        </h3>
        <p className="text-xs font-medium text-slate-500 mb-4">
          Sold vs Available Units
        </p>
        <div className="flex-1 flex items-center justify-center text-xs font-semibold text-slate-400 bg-slate-50 w-full rounded-2xl border border-slate-200 border-dashed">
          No inventory allocation records found.
        </div>
      </div>
    );
  }

  const chartData = data.map((item) => {
    const availableUnits = Math.max(0, item.totalUnits - item.soldUnits);
    const absorptionRate =
      item.totalUnits > 0
        ? Math.round((item.soldUnits / item.totalUnits) * 100)
        : 0;
    return {
      ...item,
      availableUnits,
      absorptionRate,
    };
  });

  return (
    <div className="w-full h-full min-h-[340px] flex flex-col p-6 bg-white rounded-3xl border border-slate-200/90 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_14px_34px_-18px_rgba(15,23,42,0.08)] space-y-4">
      <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-800 m-0">
            Inventory Sell-Through Rate
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5 m-0">
            Absorption velocity across active residential developments
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span>Sold</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-200" />
            <span>Available</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="#f1f5f9"
            />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }}
            />
            <YAxis
              dataKey="projectName"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#334155", fontSize: 11, fontWeight: 700 }}
              width={110}
            />
            <Tooltip
              cursor={{ fill: "rgba(241, 245, 249, 0.6)" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-slate-950/95 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl shadow-xl border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-extrabold text-slate-300">
                          {item.projectName}
                        </span>
                        <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded">
                          {item.absorptionRate}% Sold
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-between gap-4">
                        <span>Sold: <strong className="text-white">{item.soldUnits}</strong></span>
                        <span>Available: <strong className="text-white">{item.availableUnits}</strong></span>
                        <span>Total: <strong className="text-white">{item.totalUnits}</strong></span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="soldUnits"
              name="Sold"
              stackId="a"
              fill="#10b981"
              barSize={20}
              radius={[4, 0, 0, 4]}
            />
            <Bar
              dataKey="availableUnits"
              name="Available"
              stackId="a"
              fill="#e2e8f0"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
