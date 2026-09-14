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
import { Mic, Zap, Sparkles, Award } from "lucide-react";

const VOICE_BENCHMARK_DATA = [
  { platform: "Sarvam AI (Indic)", latencyMs: 420, naturalness: 4.7, costPerMinInr: 2.2, color: "#06b6d4", languages: "10+ Indic" },
  { platform: "Vapi AI Speech", latencyMs: 580, naturalness: 4.8, costPerMinInr: 4.75, color: "#6366f1", languages: "English / Hindi" },
  { platform: "Retell AI Real-Time", latencyMs: 510, naturalness: 4.9, costPerMinInr: 7.60, color: "#8b5cf6", languages: "Global Multilingual" },
  { platform: "ElevenLabs Conversational", latencyMs: 690, naturalness: 4.95, costPerMinInr: 9.50, color: "#ec4899", languages: "Ultra-Realistic" },
  { platform: "Bolna AI Agent", latencyMs: 610, naturalness: 4.5, costPerMinInr: 2.85, color: "#14b8a6", languages: "Indian Accents" },
];

export function VoiceAgentBenchmarkChart() {
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600 font-bold text-xs">
            <Mic className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
              AI Voice Engine Speed &amp; Latency Benchmarks
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Turn-taking latency (lower is better) and Indic speech synthesis fidelity compared across platforms.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-200/80">
          <Zap className="w-3.5 h-3.5" />
          <span>Fastest: Sarvam AI (420ms)</span>
        </div>
      </div>

      <div className="w-full h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={VOICE_BENCHMARK_DATA}
            margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="platform"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#334155", fontSize: 10, fontWeight: 700 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 10 }}
              tickFormatter={(v) => `${v}ms`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const item = payload[0]?.payload;
                return (
                  <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-800 text-xs space-y-1 min-w-[170px]">
                    <div className="font-extrabold text-slate-200 border-b border-slate-800 pb-1">
                      {label}
                    </div>
                    <div className="flex justify-between text-cyan-400">
                      <span>Turn Latency:</span>
                      <span className="font-bold font-mono">{item.latencyMs} ms</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Speech Fidelity:</span>
                      <span className="font-bold font-mono">{item.naturalness} / 5.0 MOS</span>
                    </div>
                    <div className="flex justify-between text-emerald-400">
                      <span>Unit Cost:</span>
                      <span className="font-bold font-mono">₹{item.costPerMinInr} / min</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[10px] pt-1 border-t border-slate-800">
                      <span>Language Focus:</span>
                      <span>{item.languages}</span>
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="latencyMs" name="First Token Latency (ms)" radius={[6, 6, 0, 0]} barSize={28}>
              {VOICE_BENCHMARK_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100">
        {VOICE_BENCHMARK_DATA.map((v) => (
          <div
            key={v.platform}
            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60"
          >
            <span className="text-[10px] font-bold text-slate-500 truncate block">
              {v.platform}
            </span>
            <div className="text-xs font-black text-slate-900 mt-1 font-mono">
              {v.latencyMs} ms
            </div>
            <span className="text-[10px] text-emerald-600 font-bold block">
              ₹{v.costPerMinInr}/m · {v.naturalness}★
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
