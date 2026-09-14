"use client";

import React, { useState } from "react";
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
import { Clock, Zap, SunMedium, Moon } from "lucide-react";

const HOURLY_DATA = [
  { hour: "9 AM", whatsapp: 42, voice: 31, email: 28 },
  { hour: "10 AM", whatsapp: 64, voice: 48, email: 51 },
  { hour: "11 AM", whatsapp: 88, voice: 76, email: 68 }, // Peak morning
  { hour: "12 PM", whatsapp: 92, voice: 79, email: 64 }, // Peak morning
  { hour: "1 PM", whatsapp: 78, voice: 55, email: 49 },
  { hour: "2 PM", whatsapp: 52, voice: 41, email: 38 },
  { hour: "3 PM", whatsapp: 58, voice: 46, email: 42 },
  { hour: "4 PM", whatsapp: 71, voice: 58, email: 53 },
  { hour: "5 PM", whatsapp: 82, voice: 67, email: 60 },
  { hour: "6 PM", whatsapp: 94, voice: 84, email: 72 }, // Peak evening
  { hour: "7 PM", whatsapp: 96, voice: 86, email: 69 }, // Peak evening
  { hour: "8 PM", whatsapp: 89, voice: 72, email: 58 },
  { hour: "9 PM", whatsapp: 65, voice: 38, email: 34 },
];

export function PeakEngagementTimingChart() {
  const [activeChannel, setActiveChannel] = useState<"ALL" | "WHATSAPP" | "VOICE" | "EMAIL">("ALL");

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 font-bold text-xs">
            <Clock className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
              Peak Buyer Engagement Hours & Best Time to Dispatch
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hourly response velocity and open rates across WhatsApp, Voice Calling, and Email.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 text-xs font-bold">
          <button
            onClick={() => setActiveChannel("ALL")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeChannel === "ALL"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            All Channels
          </button>
          <button
            onClick={() => setActiveChannel("WHATSAPP")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeChannel === "WHATSAPP"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            WhatsApp
          </button>
          <button
            onClick={() => setActiveChannel("VOICE")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeChannel === "VOICE"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Voice Calls
          </button>
          <button
            onClick={() => setActiveChannel("EMAIL")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeChannel === "EMAIL"
                ? "bg-white text-purple-700 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Email
          </button>
        </div>
      </div>

      <div className="w-full h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={HOURLY_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="hour"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 10 }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                return (
                  <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-800 text-xs space-y-1 min-w-[150px]">
                    <div className="font-extrabold text-slate-200 border-b border-slate-800 pb-1">
                      Time: {label}
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

            {(activeChannel === "ALL" || activeChannel === "WHATSAPP") && (
              <Bar
                dataKey="whatsapp"
                name="WhatsApp Read %"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            )}
            {(activeChannel === "ALL" || activeChannel === "VOICE") && (
              <Bar
                dataKey="voice"
                name="Voice Connect %"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
              />
            )}
            {(activeChannel === "ALL" || activeChannel === "EMAIL") && (
              <Bar
                dataKey="email"
                name="Email Open %"
                fill="#a855f7"
                radius={[4, 4, 0, 0]}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Golden Window Banner */}
      <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-amber-200/60 text-amber-800">
            <Zap className="w-3.5 h-3.5" />
          </span>
          <span className="font-extrabold text-amber-950">
            Golden Hours for Maximum Site Visit Conversions:
          </span>
          <span className="text-amber-900 font-medium">
            11:00 AM – 1:00 PM (Morning Window) &amp; 6:30 PM – 8:30 PM (Evening Post-Work)
          </span>
        </div>
        <span className="text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md self-start sm:self-auto">
          +44% Response Lift
        </span>
      </div>
    </div>
  );
}
