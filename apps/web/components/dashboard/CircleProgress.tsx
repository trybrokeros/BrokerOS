"use client";

import React from "react";

export function CircleProgress({
  done,
  target,
  label,
  color = "var(--brand-600)",
}: {
  done: number;
  target: number;
  label: string;
  color?: string;
}) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const pct = target === 0 ? 0 : Math.min(100, Math.round((done / target) * 100));
  const offset = circ - (pct / 100) * circ;

  const isComplete = pct >= 100;
  const isHealthy = pct >= 70;

  return (
    <div className="flex flex-col items-center gap-3 p-2">
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg width={112} height={112} className="-rotate-90">
          {/* Background Track */}
          <circle
            cx={56}
            cy={56}
            r={r}
            fill="none"
            className="stroke-slate-100"
            strokeWidth={8}
          />
          {/* Animated Arc Gauge */}
          <circle
            cx={56}
            cy={56}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Target Metric (Rapport ov-ring__mid) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-extrabold tracking-tight text-[var(--text-primary)] tabular-nums leading-none">
            {pct}%
          </span>
          <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
            {isComplete ? "Target Met" : isHealthy ? "Pacing" : "In Progress"}
          </span>
        </div>
      </div>

      <div className="text-center">
        <div className="text-xs font-bold text-[var(--text-primary)] tracking-tight">
          {label}
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-[11px] font-bold text-slate-700 tabular-nums mt-1 border border-slate-200/60">
          <span>{done}</span>
          <span className="text-slate-400">/</span>
          <span>{target} target</span>
        </div>
      </div>
    </div>
  );
}
