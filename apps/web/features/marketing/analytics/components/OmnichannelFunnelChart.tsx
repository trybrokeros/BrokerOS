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
import { Filter, Users, CheckCircle2, ArrowDown, Sparkles } from "lucide-react";

export interface FunnelStage {
  stage: string;
  count: number;
  conversionRate: string;
  dropoffRate: string;
  color: string;
  description: string;
}

const FUNNEL_DATA: FunnelStage[] = [
  {
    stage: "1. Ad Impressions & Pushes",
    count: 1240000,
    conversionRate: "100%",
    dropoffRate: "0%",
    color: "#3b82f6",
    description: "Paid social ads, search impressions & direct email/SMS dispatches",
  },
  {
    stage: "2. Clicks & Engagements",
    count: 68400,
    conversionRate: "5.5%",
    dropoffRate: "94.5%",
    color: "#6366f1",
    description: "Landing page visits, brochure downloads & WhatsApp link clicks",
  },
  {
    stage: "3. Verified Lead Ingest",
    count: 4250,
    conversionRate: "6.2%",
    dropoffRate: "93.8%",
    color: "#8b5cf6",
    description: "Meta Lead Form submissions, Google search forms & inbound inquiries",
  },
  {
    stage: "4. AI Voice Connected & Qualified",
    count: 1840,
    conversionRate: "43.3%",
    dropoffRate: "56.7%",
    color: "#10b981",
    description: "Conversational AI voice calls completed with budget > ₹1.5 Cr & positive sentiment",
  },
  {
    stage: "5. Site Visit Attended",
    count: 480,
    conversionRate: "26.1%",
    dropoffRate: "73.9%",
    color: "#f59e0b",
    description: "Physical project visit verified with geo-fencing selfie & coordinates",
  },
  {
    stage: "6. Unit Booking Closed",
    count: 92,
    conversionRate: "19.2%",
    dropoffRate: "80.8%",
    color: "#ec4899",
    description: "Token deposit paid, booking agreement drafted & unit reserved",
  },
];

export function OmnichannelFunnelChart() {
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-xs">
            <Filter className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
              Omnichannel Conversion Funnel & Velocity
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Full lifecycle tracking from raw digital impression to GPS-verified site visit and final unit sale.
            </p>
          </div>
        </div>
        <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80">
          Overall Conversion: 0.0074% (92 Deals)
        </span>
      </div>

      {/* Visual Pipeline Funnel Flow */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 pt-1">
        {FUNNEL_DATA.map((st, i) => (
          <div
            key={st.stage}
            className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-2 relative overflow-hidden"
          >
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: st.color }}
            />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                {st.stage}
              </span>
              <div className="text-base font-black text-slate-900 mt-1">
                {st.count >= 1000000
                  ? `${(st.count / 1000000).toFixed(2)}M`
                  : st.count >= 1000
                  ? `${(st.count / 1000).toFixed(1)}k`
                  : st.count}
              </div>
              <p className="text-[10px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                {st.description}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-400 text-[10px]">Pass Rate:</span>
              <span style={{ color: st.color }} className="font-extrabold">
                {st.conversionRate}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recharts Horizontal Logarithmic-scale Bar Visualizer */}
      <div className="w-full h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={FUNNEL_DATA}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis
              type="number"
              scale="log"
              domain={["auto", "auto"]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 10 }}
              tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
            />
            <YAxis
              dataKey="stage"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#334155", fontSize: 11, fontWeight: 700 }}
              width={160}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const item = payload[0].payload as FunnelStage;
                return (
                  <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-800 text-xs space-y-1 min-w-[180px]">
                    <div className="font-extrabold text-slate-200">{item.stage}</div>
                    <div className="flex justify-between text-slate-300">
                      <span>Volume:</span>
                      <span className="font-bold font-mono text-emerald-400">
                        {item.count.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Conversion:</span>
                      <span className="font-bold font-mono">{item.conversionRate}</span>
                    </div>
                    <div className="flex justify-between text-rose-400">
                      <span>Drop-off:</span>
                      <span className="font-bold font-mono">{item.dropoffRate}</span>
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={16}>
              {FUNNEL_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
