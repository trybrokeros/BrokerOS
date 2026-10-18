"use client";

import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

export interface StatCardItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  /** Hex color, OKLCH or CSS var for the icon and accent */
  accent: string;
  /** Optional background tint */
  bg?: string;
  /** Optional subtitle under the value */
  sub?: string;
  /** Optional trend badge (e.g. "+12.4% vs last week") */
  trend?: string;
  positive?: boolean;
}

export function StatCards({
  items,
  cols,
}: {
  items: StatCardItem[];
  /** grid columns override — defaults to auto-fit minmax(190px) */
  cols?: number;
}) {
  const gridClasses = cols
    ? `grid grid-cols-1 sm:grid-cols-${cols} gap-4`
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4";

  return (
    <div className={gridClasses}>
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="group relative bg-white rounded-2xl p-5 border border-slate-200/90 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_12px_28px_-16px_rgba(20,24,36,0.08)] hover:shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_20px_40px_-20px_rgba(20,24,36,0.12)] hover:-translate-y-0.5 transition-all duration-200 cursor-default overflow-hidden flex flex-col justify-between"
          >
            {/* Ambient Corner Glow (Wharf / Rapport Style) */}
            <div
              className="absolute -top-8 -right-8 w-24 h-24 rounded-full pointer-events-none opacity-15 blur-xl transition-opacity duration-300 group-hover:opacity-25"
              style={{ background: item.accent }}
            />

            <div>
              {/* Top Row: Icon + Optional Trend Delta */}
              <div className="flex items-center justify-between mb-3.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center relative transition-transform duration-200 group-hover:scale-105"
                  style={{
                    background: item.bg || `color-mix(in srgb, ${item.accent} 12%, #ffffff)`,
                    border: `1px solid color-mix(in srgb, ${item.accent} 25%, transparent)`,
                  }}
                >
                  <Icon size={18} strokeWidth={2.2} style={{ color: item.accent }} />
                </div>

                {item.trend && (
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      item.positive !== false
                        ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                        : "text-rose-700 bg-rose-50 border-rose-200"
                    }`}
                  >
                    {item.positive !== false ? (
                      <TrendingUp size={11} strokeWidth={2.5} />
                    ) : (
                      <TrendingDown size={11} strokeWidth={2.5} />
                    )}
                    <span>{item.trend}</span>
                  </span>
                )}
              </div>

              {/* Metric Value */}
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] tabular-nums leading-tight mb-1.5 font-feature-tnum">
                {item.value}
              </div>

              {/* Label */}
              <div className="text-xs font-bold text-[var(--text-secondary)] tracking-tight">
                {item.label}
              </div>
            </div>

            {/* Optional Subtitle */}
            {item.sub && (
              <div className="text-[11px] font-medium text-[var(--text-muted)] mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 truncate">
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="truncate">{item.sub}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
