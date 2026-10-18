"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Filter, TrendingUp, ArrowDown } from "lucide-react";

export function ConversionFunnelChart({ funnelData }: { funnelData: any }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  if (!funnelData) return null;

  const stages = [
    { name: "Total Leads", value: funnelData.leads || 0, color: "#6366f1" },
    { name: "Site Visits", value: funnelData.siteVisits || 0, color: "#8b5cf6" },
    { name: "Negotiations", value: funnelData.negotiations || 0, color: "#f59e0b" },
    { name: "Reserved", value: funnelData.reserved || 0, color: "#0ea5e9" },
    { name: "Sold", value: funnelData.sold || 0, color: "#10b981" },
  ];

  const topValue = Math.max(stages[0].value, 1);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="bg-white p-6 rounded-3xl shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_14px_34px_-18px_rgba(15,23,42,0.08)] border border-slate-200/90 h-full flex flex-col justify-between space-y-4"
    >
      <div className="flex justify-between items-start pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-800 m-0">
              Conversion Funnel
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5 m-0">
            Pipeline stage progression & drop-off
          </p>
        </div>

        <div className="text-right bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-2xl">
          <div className="text-lg font-black text-emerald-800 tabular-nums leading-none">
            {funnelData.conversionRate || "0.0"}%
          </div>
          <div className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-widest mt-0.5">
            Win Rate
          </div>
        </div>
      </div>

      {/* Stepped Funnel Pods */}
      <div className="space-y-2.5 py-1">
        {stages.map((stage, idx) => {
          const pct = Math.round((stage.value / topValue) * 100);
          const barWidth = Math.max(pct, 20);
          const isHovered = hoveredIdx === idx;

          let dropoff = 0;
          if (idx > 0 && stages[idx - 1].value > 0) {
            dropoff = Math.round(
              ((stages[idx - 1].value - stage.value) / stages[idx - 1].value) *
                100
            );
          }

          return (
            <div key={stage.name} className="space-y-1">
              {idx > 0 && dropoff > 0 && (
                <div className="flex items-center justify-end pr-2 text-[9px] font-extrabold text-slate-400 gap-1">
                  <ArrowDown size={10} className="text-slate-300" />
                  <span>-{dropoff}% drop</span>
                </div>
              )}

              <div
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`p-2.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isHovered
                    ? "bg-slate-50 border-slate-300 shadow-2xs -translate-x-0.5"
                    : "bg-white border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-md"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="text-xs font-bold text-slate-800">
                      {stage.name}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs font-black text-slate-900 tabular-nums">
                      {stage.value.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-extrabold text-slate-400 tabular-nums">
                      ({pct}%)
                    </span>
                  </div>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: stage.color,
                      transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                    className="h-full rounded-full"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
