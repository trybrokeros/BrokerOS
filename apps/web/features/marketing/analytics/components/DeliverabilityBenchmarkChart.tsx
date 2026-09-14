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
} from "recharts";
import { ShieldCheck, CheckCircle2, AlertTriangle, Send } from "lucide-react";

const DELIVERABILITY_DATA = [
  { channel: "WhatsApp HSM", delivered: 98.6, readRate: 88.4, bounceRate: 0.8, fill: "#10b981" },
  { channel: "AWS SES Email", delivered: 99.2, readRate: 46.5, bounceRate: 0.3, fill: "#a855f7" },
  { channel: "Twilio/Sinch SMS", delivered: 94.8, readRate: 24.2, bounceRate: 3.2, fill: "#f59e0b" },
  { channel: "Voice SIP Carrier", delivered: 88.5, readRate: 64.2, bounceRate: 1.4, fill: "#6366f1" },
];

export function DeliverabilityBenchmarkChart() {
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-xs">
            <ShieldCheck className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
              Carrier Deliverability & Inbox Placement Health
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              DLT registration adherence, AWS SES SPF/DKIM verification, and WhatsApp delivery compliance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>99.1% Global Sender Reputation</span>
        </div>
      </div>

      <div className="w-full h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={DELIVERABILITY_DATA}
            margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="channel"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#334155", fontSize: 11, fontWeight: 700 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickFormatter={(v) => `${v}%`}
              domain={[0, 100]}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                return (
                  <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-800 text-xs space-y-1 min-w-[170px]">
                    <div className="font-extrabold text-slate-200 border-b border-slate-800 pb-1">
                      {label}
                    </div>
                    {payload.map((entry: any) => (
                      <div
                        key={entry.dataKey}
                        className="flex justify-between items-center"
                        style={{ color: entry.fill }}
                      >
                        <span>{entry.name}:</span>
                        <span className="font-bold font-mono">{entry.value}%</span>
                      </div>
                    ))}
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
              dataKey="delivered"
              name="Delivered %"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="readRate"
              name="Read / Connected %"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="bounceRate"
              name="Bounce / Blocked %"
              fill="#f43f5e"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            WhatsApp Meta Tier
          </span>
          <span className="text-xs font-black text-slate-900 mt-0.5 block">
            Tier 3 (100k msgs / day)
          </span>
          <span className="text-[10px] text-emerald-600 font-bold">High Quality Rating (Green)</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Email Deliverability
          </span>
          <span className="text-xs font-black text-slate-900 mt-0.5 block">
            SPF, DKIM, DMARC Passing
          </span>
          <span className="text-[10px] text-purple-600 font-bold">0.02% Spam Complaint Rate</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Indian TRAI DLT Headers
          </span>
          <span className="text-xs font-black text-slate-900 mt-0.5 block">
            6 Approved Entity IDs
          </span>
          <span className="text-[10px] text-amber-600 font-bold">Transactional & Promotional</span>
        </div>
      </div>
    </div>
  );
}
