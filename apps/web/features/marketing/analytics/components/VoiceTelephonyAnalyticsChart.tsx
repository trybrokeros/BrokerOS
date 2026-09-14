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
import { PhoneCall, Radio, Clock, Mic, CheckCircle2, ShieldAlert } from "lucide-react";

const DURATION_DATA = [
  { bucket: "< 30s", label: "Quick Drop / Gatekeeper", calls: 340, color: "#f43f5e", pct: "18.5%" },
  { bucket: "30s - 90s", label: "Initial Pitch & Basic Intro", calls: 520, color: "#f59e0b", pct: "28.3%" },
  { bucket: "90s - 180s", label: "Project Details & Budget Fit", calls: 680, color: "#3b82f6", pct: "37.0%" },
  { bucket: "> 3 mins", label: "Full VIP Site Visit Consultation", calls: 300, color: "#10b981", pct: "16.3%" },
];

export function VoiceTelephonyAnalyticsChart() {
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs">
            <Radio className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
              AI Voice Calling & Call Duration Distribution
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live PSTN carrier trunk performance, conversational depth, and audio telemetry.
            </p>
          </div>
        </div>

        {/* Quick Voice KPIs */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-200/80 text-center">
            <span className="text-[10px] text-indigo-600 font-bold uppercase block">Avg Duration</span>
            <span className="text-xs font-black text-indigo-900">2m 22s</span>
          </div>
          <div className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200/80 text-center">
            <span className="text-[10px] text-emerald-600 font-bold uppercase block">First Token Latency</span>
            <span className="text-xs font-black text-emerald-900">580 ms</span>
          </div>
        </div>
      </div>

      {/* Recharts Bar Chart */}
      <div className="w-full h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={DURATION_DATA}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="bucket"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#475569", fontSize: 11, fontWeight: 700 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const item = payload[0].payload;
                return (
                  <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-800 text-xs space-y-1 min-w-[170px]">
                    <div className="font-extrabold text-slate-200">{item.bucket}</div>
                    <div className="text-slate-400 text-[11px]">{item.label}</div>
                    <div className="flex justify-between text-emerald-400 pt-1 border-t border-slate-800">
                      <span>Total Calls:</span>
                      <span className="font-bold font-mono">{item.calls} ({item.pct})</span>
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="calls" radius={[6, 6, 0, 0]} barSize={36}>
              {DURATION_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Telephony Outcomes Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
          <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Connected (64.2%)</span>
          </div>
          <span className="text-xs font-extrabold text-slate-800 mt-1 block">
            1,180 Conversations
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
          <div className="flex items-center gap-1.5 text-blue-600 text-xs font-bold">
            <Mic className="w-3.5 h-3.5" />
            <span>AI Summaries (98.4%)</span>
          </div>
          <span className="text-xs font-extrabold text-slate-800 mt-1 block">
            1,162 Transcribed
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
          <div className="flex items-center gap-1.5 text-amber-600 text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>Voicemail (18.1%)</span>
          </div>
          <span className="text-xs font-extrabold text-slate-800 mt-1 block">
            333 Auto-Detected
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
          <div className="flex items-center gap-1.5 text-rose-600 text-xs font-bold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Busy/Unreachable (17.7%)</span>
          </div>
          <span className="text-xs font-extrabold text-slate-800 mt-1 block">
            327 Queued for Retry
          </span>
        </div>
      </div>
    </div>
  );
}
