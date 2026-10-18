"use client";

import React from "react";

export const COLORS = [
  "#6366f1",
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
  "#8b5cf6",
  "#f43f5e",
];

export function fmt(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)} K`;
  return `₹${Number(n || 0).toLocaleString("en-IN")}`;
}

export function Widget({
  icon,
  label,
  value,
  sub,
  accent = "indigo",
  dark = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  dark?: boolean;
}) {
  const accents: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600 border border-indigo-200/80",
    emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200/80",
    amber: "bg-amber-50 text-amber-700 border border-amber-200/80",
    rose: "bg-rose-50 text-rose-700 border border-rose-200/80",
    violet: "bg-purple-50 text-purple-700 border border-purple-200/80",
    sky: "bg-sky-50 text-sky-700 border border-sky-200/80",
    orange: "bg-orange-50 text-orange-700 border border-orange-200/80",
    slate: "bg-slate-50 text-slate-700 border border-slate-200/80",
    teal: "bg-teal-50 text-teal-700 border border-teal-200/80",
    purple: "bg-purple-50 text-purple-700 border border-purple-200/80",
    blue: "bg-blue-50 text-blue-700 border border-blue-200/80",
  };

  const accentClass = accents[accent] || accents.indigo;

  if (dark) {
    return (
      <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-[0_1px_0_rgba(255,255,255,0.1)_inset,0_16px_36px_-20px_rgba(15,23,42,0.4)] relative overflow-hidden flex flex-col justify-between hover:-translate-y-0.5 transition-all">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-800 text-indigo-400 border border-slate-700 shadow-2xs">
            {icon}
          </div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest truncate">
            {label}
          </span>
        </div>
        <div>
          <h3 className="text-2xl font-black tabular-nums tracking-tight m-0 text-white truncate">
            {value}
          </h3>
          {sub && (
            <p className="text-[11px] text-slate-400 font-semibold mt-1 m-0 truncate">
              {sub}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_14px_34px_-18px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 transition-all flex flex-col justify-between">
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-2xs ${accentClass}`}>
          {icon}
        </div>
        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest truncate">
          {label}
        </span>
      </div>
      <div>
        <h3 className="text-2xl font-black text-slate-900 tabular-nums tracking-tight m-0 truncate">
          {value}
        </h3>
        {sub && (
          <p className="text-[11px] text-slate-500 font-medium mt-1 m-0 truncate">
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

export function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-3">
      <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-800 m-0">
        {title}
      </h2>
      {subtitle && (
        <p className="text-xs text-slate-500 font-medium mt-0.5 m-0">
          {subtitle}
        </p>
      )}
    </div>
  );
}
