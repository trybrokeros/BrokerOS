"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Globe, Zap, Award } from "lucide-react";
import { GoogleIcon } from "@/features/marketing/ads/google/components/GoogleIcon";
import { YouTubeIcon } from "@/features/marketing/ads/youtube/components/YouTubeIcon";

const PLACEMENT_DATA = [
  { placement: "Instagram 9:16 Reels", ctr: 3.42, cpl: 1620, leads: 28, spend: 45360, color: "#e1306c" },
  { placement: "Google Search Keywords", ctr: 4.85, cpl: 2024, leads: 42, spend: 85000, color: "#ea4335" },
  { placement: "Facebook Feed Carousel", ctr: 2.15, cpl: 1882, leads: 34, spend: 64000, color: "#1877f2" },
  { placement: "YouTube In-Stream Video", ctr: 1.85, cpl: 2285, leads: 14, spend: 32000, color: "#ff0000" },
  { placement: "WhatsApp Click-to-Chat", ctr: 5.12, cpl: 1420, leads: 18, spend: 25560, color: "#10b981" },
];

export function AdPlacementEfficiencyChart() {
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-pink-50 text-pink-600 font-bold text-xs">
            <Globe className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
              Paid Ad Placement Efficiency (CTR vs CPL)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Efficiency matrix comparing click-through engagement with acquisition cost per lead.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-pink-700 bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200/80">
          <Award className="w-3.5 h-3.5" />
          <span>Top Yield: WhatsApp Click-to-Chat &amp; IG Reels</span>
        </div>
      </div>

      <div className="w-full h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={PLACEMENT_DATA}
            margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="placement"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#475569", fontSize: 10, fontWeight: 700 }}
            />
            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 10 }}
              tickFormatter={(v) => `₹${v}`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 10 }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const item = payload[0]?.payload;
                return (
                  <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-800 text-xs space-y-1.5 min-w-[170px]">
                    <div className="font-extrabold text-slate-200 border-b border-slate-800 pb-1">
                      {label}
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Click-Through Rate:</span>
                      <span className="font-bold font-mono text-emerald-400">{item.ctr}%</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Cost per Lead:</span>
                      <span className="font-bold font-mono text-amber-400">
                        ₹{item.cpl.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Total Leads:</span>
                      <span className="font-bold font-mono text-blue-400">{item.leads}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-800">
                      <span>Spend:</span>
                      <span>₹{item.spend.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                );
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: "8px", fontSize: "11px", fontWeight: 700 }}
            />
            <Bar
              yAxisId="left"
              dataKey="cpl"
              name="Cost Per Lead (₹)"
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Bar
              yAxisId="right"
              dataKey="ctr"
              name="CTR (%)"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100">
        {PLACEMENT_DATA.map((p) => (
          <div
            key={p.placement}
            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-center"
          >
            <span className="text-[10px] font-bold text-slate-500 truncate block">
              {p.placement}
            </span>
            <div className="text-xs font-black text-slate-900 mt-1 font-mono">
              ₹{p.cpl.toLocaleString("en-IN")}
            </div>
            <span className="text-[10px] text-emerald-600 font-extrabold block">
              {p.ctr}% CTR · {p.leads} leads
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
