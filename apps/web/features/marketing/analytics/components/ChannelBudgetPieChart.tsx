"use client";

import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { PieChart as PieIcon, DollarSign } from "lucide-react";

export interface ChannelBudgetItem {
  name: string;
  spend: number;
  color: string;
  percentage: number;
  leads: number;
}

const DEFAULT_CHANNEL_BUDGET: ChannelBudgetItem[] = [
  { name: "Google Search Ads", spend: 85000, color: "#ea4335", percentage: 31.7, leads: 42 },
  { name: "Meta Facebook Ads", spend: 64000, color: "#1877f2", percentage: 23.8, leads: 34 },
  { name: "Instagram Reels Ads", spend: 45000, color: "#e1306c", percentage: 16.8, leads: 28 },
  { name: "YouTube Video Ads", spend: 32000, color: "#ff0000", percentage: 11.9, leads: 14 },
  { name: "AI Voice Telephony", spend: 18500, color: "#6366f1", percentage: 6.9, leads: 9 },
  { name: "WhatsApp Cloud API", spend: 12500, color: "#10b981", percentage: 4.7, leads: 8 },
  { name: "SMS Gateways (DLT)", spend: 7500, color: "#f59e0b", percentage: 2.8, leads: 5 },
  { name: "Email Gateways (SES)", spend: 4000, color: "#a855f7", percentage: 1.5, leads: 3 },
];

export function ChannelBudgetPieChart({
  data = DEFAULT_CHANNEL_BUDGET,
}: {
  data?: ChannelBudgetItem[];
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const totalSpend = data.reduce((acc, c) => acc + c.spend, 0);

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4 flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600 font-bold text-xs">
            <PieIcon className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
              Marketing Budget & Spend Allocation
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Capital deployment breakdown across digital ad networks and carrier channels.
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Spend
          </span>
          <span className="text-sm font-black text-slate-900">
            ₹{totalSpend.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      <div className="relative w-full h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={2.5}
              dataKey="spend"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                  className="transition-opacity cursor-pointer stroke-white stroke-2"
                />
              ))}
            </Pie>
            <Tooltip
              wrapperStyle={{ zIndex: 9999, pointerEvents: "none" }}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const item = payload[0].payload as ChannelBudgetItem;
                return (
                  <div className="relative z-50 p-3 bg-slate-950/95 backdrop-blur-md text-white rounded-xl shadow-2xl border border-slate-700 text-xs space-y-1.5 min-w-[170px] pointer-events-none">
                    <div className="font-extrabold text-slate-100 flex items-center gap-1.5 border-b border-slate-800 pb-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Spend:</span>
                      <span className="font-bold font-mono text-emerald-400">
                        ₹{item.spend.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Share:</span>
                      <span className="font-bold font-mono">{item.percentage}%</span>
                    </div>
                    <div className="flex justify-between text-blue-400">
                      <span>Leads:</span>
                      <span className="font-bold font-mono">{item.leads} leads</span>
                    </div>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Label (Lower z-index and dims when a slice is hovered) */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0 transition-opacity duration-150 ${activeIndex !== null ? "opacity-25" : "opacity-100"
            }`}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Active Share
          </span>
          <span className="text-sm font-black text-slate-900">
            {activeIndex !== null ? `${data[activeIndex]?.percentage}%` : "8 Channels"}
          </span>
          <span className="text-[10px] text-slate-500 font-medium truncate max-w-[100px]">
            {activeIndex !== null ? data[activeIndex]?.name : "Omnichannel"}
          </span>
        </div>
      </div>

      {/* Mini Legend Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
        {data.map((c) => (
          <div
            key={c.name}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-2"
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: c.color }}
            />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-slate-600 truncate block">
                {c.name}
              </span>
              <span className="text-[11px] font-black text-slate-900 block font-mono">
                ₹{c.spend >= 1000 ? `${Math.round(c.spend / 1000)}k` : c.spend}
                <span className="text-[9px] font-normal text-slate-400 ml-1">
                  ({c.percentage}%)
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
