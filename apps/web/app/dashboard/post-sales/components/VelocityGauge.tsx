"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, Zap, CheckCircle2, AlertTriangle } from "lucide-react";

interface VelocityGaugeProps {
  days: number;
  label?: string;
  subLabel?: string;
  maxDays?: number;
}

export function VelocityGauge({
  days,
  label = "Handover Velocity",
  subLabel = "Mean duration from booking to possession keys",
  maxDays = 120,
}: VelocityGaugeProps) {
  const size = 200;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI;

  const percentage = Math.min((days / maxDays) * 100, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const isFast = days <= 30;
  const isMedium = days > 30 && days <= 60;
  const color = isFast ? "#10b981" : isMedium ? "#f59e0b" : "#f43f5e";
  const glow = isFast
    ? "rgba(16, 185, 129, 0.15)"
    : isMedium
    ? "rgba(245, 158, 11, 0.15)"
    : "rgba(244, 63, 94, 0.15)";

  const statusBadge = isFast
    ? { text: "Optimal Velocity", bg: "bg-emerald-50 text-emerald-800 border-emerald-200/80", Icon: CheckCircle2 }
    : isMedium
    ? { text: "Standard Pacing", bg: "bg-amber-50 text-amber-800 border-amber-200/80", Icon: Zap }
    : { text: "Backlog Delay", bg: "bg-rose-50 text-rose-800 border-rose-200/80", Icon: AlertTriangle };

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-3xl border border-slate-200/90 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_14px_34px_-18px_rgba(15,23,42,0.08)] relative overflow-hidden h-full justify-between group">
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-20 rounded-full blur-2xl pointer-events-none transition-opacity"
        style={{ background: glow }}
      />

      <div className="text-center w-full pb-3 border-b border-slate-100">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-800 m-0">
          {label}
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5 m-0">
          {subLabel}
        </p>
      </div>

      <div className="relative my-4" style={{ width: size, height: size / 2 }}>
        <svg
          width={size}
          height={size / 2}
          viewBox={`0 0 ${size} ${size / 2}`}
          className="overflow-visible"
        >
          {/* Background Arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${
              size - strokeWidth / 2
            } ${size / 2}`}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Foreground Arc */}
          <motion.path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${
              size - strokeWidth / 2
            } ${size / 2}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          />
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1 pointer-events-none">
          <span
            className="text-3xl sm:text-4xl font-black tabular-nums tracking-tight"
            style={{ color }}
          >
            {days}
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Calendar Days
          </span>
        </div>
      </div>

      <div className="w-full flex flex-col items-center gap-2">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-extrabold shadow-2xs ${statusBadge.bg}`}>
          <statusBadge.Icon size={12} className="stroke-[2.5]" />
          <span>{statusBadge.text}</span>
        </div>

        <div className="w-full flex justify-between px-2 pt-2 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
          <span>0 Days</span>
          <span>{maxDays}+ Days Target</span>
        </div>
      </div>
    </div>
  );
}
