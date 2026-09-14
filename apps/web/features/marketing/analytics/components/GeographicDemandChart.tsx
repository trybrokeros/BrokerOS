"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { MapPin, Globe, Compass } from "lucide-react";

const GEO_DATA = [
  { region: "Mumbai MMR (South/West)", leads: 52, avgBudgetCr: 3.2, share: "40.0%", color: "#3b82f6" },
  { region: "Pune Tech Hub (Kharadi/Baner)", leads: 28, avgBudgetCr: 1.4, share: "21.5%", color: "#6366f1" },
  { region: "Bangalore (Indiranagar/Whitefield)", leads: 22, avgBudgetCr: 2.4, share: "16.9%", color: "#8b5cf6" },
  { region: "NRI Corridors (Dubai/UAE/UK)", leads: 16, avgBudgetCr: 4.8, share: "12.3%", color: "#10b981" },
  { region: "Delhi NCR (Gurgaon Golf Course)", leads: 12, avgBudgetCr: 2.9, share: "9.3%", color: "#f59e0b" },
];

export function GeographicDemandChart() {
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs">
            <MapPin className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
              Geographic Buyer Demand &amp; Regional Budget Tiers
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Origin location of acquired CRM leads and average budget readiness.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200/80">
          <Globe className="w-3.5 h-3.5" />
          <span>Highest Ticket: NRI Corridors (₹4.8 Cr avg)</span>
        </div>
      </div>

      <div className="w-full h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={GEO_DATA}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickFormatter={(v) => `${v} leads`}
            />
            <YAxis
              dataKey="region"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#334155", fontSize: 11, fontWeight: 700 }}
              width={180}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const item = payload[0]?.payload;
                return (
                  <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-800 text-xs space-y-1 min-w-[170px]">
                    <div className="font-extrabold text-slate-200 border-b border-slate-800 pb-1">
                      {item.region}
                    </div>
                    <div className="flex justify-between text-blue-400">
                      <span>Leads Acquired:</span>
                      <span className="font-bold font-mono">{item.leads} leads ({item.share})</span>
                    </div>
                    <div className="flex justify-between text-emerald-400">
                      <span>Avg Buyer Budget:</span>
                      <span className="font-bold font-mono">₹{item.avgBudgetCr} Cr</span>
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="leads" radius={[0, 6, 6, 0]} barSize={16}>
              {GEO_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100">
        {GEO_DATA.map((g) => (
          <div
            key={g.region}
            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60"
          >
            <span className="text-[10px] font-bold text-slate-500 truncate block">
              {g.region.split(" (")[0]}
            </span>
            <div className="text-xs font-black text-slate-900 mt-1 font-mono">
              {g.leads} Leads
            </div>
            <span className="text-[10px] text-indigo-600 font-bold block">
              ₹{g.avgBudgetCr} Cr Avg
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
