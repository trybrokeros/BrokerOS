"use client";

import React, { useState } from "react";
import { PhoneCall, PhoneForwarded, PhoneMissed, PhoneOff, Voicemail } from "lucide-react";

interface CallOutcomesProps {
  outcomes: {
    connected: number;
    notAnswered: number;
    busy: number;
    failed: number;
    voicemail: number;
  };
}

export function CallOutcomes({ outcomes }: CallOutcomesProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total =
    outcomes.connected +
    outcomes.notAnswered +
    outcomes.busy +
    outcomes.failed +
    outcomes.voicemail;

  const getWidth = (val: number) => {
    if (total === 0) return 0;
    return (val / total) * 100;
  };

  const categories = [
    {
      label: "Connected",
      value: outcomes.connected,
      color: "bg-emerald-500",
      hex: "#10b981",
      icon: PhoneCall,
      text: "text-emerald-900",
      bg: "bg-emerald-50/80 border-emerald-200/80 hover:bg-emerald-100/60",
    },
    {
      label: "Not Answered",
      value: outcomes.notAnswered,
      color: "bg-amber-500",
      hex: "#f59e0b",
      icon: PhoneMissed,
      text: "text-amber-900",
      bg: "bg-amber-50/80 border-amber-200/80 hover:bg-amber-100/60",
    },
    {
      label: "Busy / Callback",
      value: outcomes.busy,
      color: "bg-orange-500",
      hex: "#f97316",
      icon: PhoneForwarded,
      text: "text-orange-900",
      bg: "bg-orange-50/80 border-orange-200/80 hover:bg-orange-100/60",
    },
    {
      label: "Voicemail",
      value: outcomes.voicemail,
      color: "bg-sky-500",
      hex: "#0ea5e9",
      icon: Voicemail,
      text: "text-sky-900",
      bg: "bg-sky-50/80 border-sky-200/80 hover:bg-sky-100/60",
    },
    {
      label: "Failed / Invalid",
      value: outcomes.failed,
      color: "bg-rose-500",
      hex: "#f43f5e",
      icon: PhoneOff,
      text: "text-rose-900",
      bg: "bg-rose-50/80 border-rose-200/80 hover:bg-rose-100/60",
    },
  ]
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <div className="w-full space-y-4">
      {/* Rapport ov-mix Segmented Track */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
          <span>Disposition Mix</span>
          <span>{total.toLocaleString()} Total Calls</span>
        </div>

        <div className="flex w-full h-4 rounded-xl overflow-hidden bg-slate-100 p-0.5 border border-slate-200/80 shadow-2xs gap-0.5">
          {categories.map((cat, idx) => {
            const widthPct = getWidth(cat.value);
            const isHovered = hoveredIdx === idx;
            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  width: `${widthPct}%`,
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  transform: isHovered ? "scaleY(1.15)" : "scaleY(1)",
                  filter:
                    hoveredIdx !== null && !isHovered
                      ? "opacity(0.55)"
                      : "opacity(1)",
                }}
                className={`h-full ${cat.color} first:rounded-l-lg last:rounded-r-lg cursor-pointer relative shadow-2xs`}
                title={`${cat.label}: ${cat.value} (${Math.round(widthPct)}%)`}
              />
            );
          })}
          {total === 0 && (
            <div className="w-full h-full bg-slate-200/80 rounded-lg" />
          )}
        </div>
      </div>

      {/* Tactile Outcome Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {categories.map((cat, idx) => {
          const isHovered = hoveredIdx === idx;
          const pct = Math.round(getWidth(cat.value));
          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 cursor-pointer shadow-2xs ${cat.bg} ${
                isHovered ? "ring-2 ring-slate-900/10 -translate-y-0.5" : ""
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center bg-white/90 shadow-2xs shrink-0"
                  style={{ color: cat.hex }}
                >
                  <cat.icon size={14} className="stroke-[2.2]" />
                </div>
                <span className={`text-xs font-bold truncate ${cat.text}`}>
                  {cat.label}
                </span>
              </div>

              <div className="flex items-baseline gap-1.5 shrink-0 ml-2">
                <span className="text-sm font-black text-slate-900 tabular-nums">
                  {cat.value.toLocaleString()}
                </span>
                <span className="text-[10px] font-extrabold text-slate-500 tabular-nums">
                  ({pct}%)
                </span>
              </div>
            </div>
          );
        })}

        {categories.length === 0 && (
          <div className="col-span-full text-center py-8 text-xs font-semibold text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-2">
            <PhoneCall size={20} className="text-slate-300 stroke-[1.5]" />
            <span>No call outcomes recorded in this period.</span>
          </div>
        )}
      </div>
    </div>
  );
}
