"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";

interface CircularPercentageProps {
  percentage: number;
  label: string;
  subLabel?: string;
  size?: number;
  strokeWidth?: number;
  color?: "primary" | "success" | "warning" | "danger";
  delay?: number;
}

export function CircularPercentage({
  percentage,
  label,
  subLabel,
  size = 190,
  strokeWidth = 14,
  color = "primary",
  delay = 0,
}: CircularPercentageProps) {
  // Arc calculation: 270-degree arc gauge for an instrument feel
  const radius = (size - strokeWidth) / 2;
  const arcLengthDegrees = 270;
  const totalCircumference = 2 * Math.PI * radius;
  const arcCircumference = (arcLengthDegrees / 360) * totalCircumference;
  const clampedPct = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset =
    arcCircumference - (clampedPct / 100) * arcCircumference;

  const colorConfig = {
    primary: {
      gradient: ["#6366f1", "#8b5cf6"],
      track: "#f1f5f9",
      glow: "rgba(99, 102, 241, 0.15)",
      badgeBg: "bg-indigo-50 border-indigo-200/80 text-indigo-700",
      pacingText: clampedPct >= 50 ? "Ahead of Pace" : "Normal Pacing",
      Icon: Sparkles,
    },
    success: {
      gradient: ["#10b981", "#059669"],
      track: "#f0fdf4",
      glow: "rgba(16, 185, 129, 0.15)",
      badgeBg: "bg-emerald-50 border-emerald-200/80 text-emerald-800",
      pacingText: "Target Achieved",
      Icon: CheckCircle2,
    },
    warning: {
      gradient: ["#f59e0b", "#d97706"],
      track: "#fffbeb",
      glow: "rgba(245, 158, 11, 0.15)",
      badgeBg: "bg-amber-50 border-amber-200/80 text-amber-800",
      pacingText: "Pacing Warning",
      Icon: AlertTriangle,
    },
    danger: {
      gradient: ["#f43f5e", "#e11d48"],
      track: "#fff1f2",
      glow: "rgba(244, 63, 94, 0.15)",
      badgeBg: "bg-rose-50 border-rose-200/80 text-rose-800",
      pacingText: "Critical Deficit",
      Icon: AlertTriangle,
    },
  };

  const selected = colorConfig[color];
  const gradId = `ov-ring-grad-${color}-${label.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center p-3 relative group"
    >
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Ambient Ring Glow */}
        <div
          className="absolute inset-4 rounded-full blur-xl pointer-events-none transition-opacity duration-300 opacity-60 group-hover:opacity-100"
          style={{ background: selected.glow }}
        />

        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform rotate-[135deg] overflow-visible"
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={selected.gradient[0]} />
              <stop offset="100%" stopColor={selected.gradient[1]} />
            </linearGradient>
          </defs>

          {/* Background Track Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${arcCircumference} ${totalCircumference}`}
            strokeLinecap="round"
          />

          {/* Active Gradient Arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradId})`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={`${arcCircumference} ${totalCircumference}`}
            initial={{ strokeDashoffset: arcCircumference }}
            animate={{ strokeDashoffset }}
            transition={{
              duration: 1.1,
              delay: delay + 0.15,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        </svg>

        {/* Center Figure & Counter */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: delay + 0.35 }}
            className="flex flex-col items-center"
          >
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight tabular-nums">
              {percentage}%
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mt-0.5">
              Efficiency
            </span>
          </motion.div>
        </div>
      </div>

      {/* Label and Pacing Pill */}
      <div className="mt-2 text-center flex flex-col items-center">
        <h4 className="text-xs font-black text-slate-800 tracking-tight m-0">
          {label}
        </h4>
        {subLabel && (
          <p className="text-[11px] text-slate-500 font-medium mt-0.5 m-0 max-w-[200px]">
            {subLabel}
          </p>
        )}

        <div className={`mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold shadow-2xs ${selected.badgeBg}`}>
          <selected.Icon size={11} className="stroke-[2.5]" />
          <span>{selected.pacingText}</span>
        </div>
      </div>
    </motion.div>
  );
}
