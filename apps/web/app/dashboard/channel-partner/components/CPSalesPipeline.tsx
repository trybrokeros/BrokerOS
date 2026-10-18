"use client";

import { useState } from "react";
import { Filter, Layers, TrendingUp } from "lucide-react";

export function CPSalesPipeline({
  pipeline,
}: {
  pipeline: Record<string, number>;
}) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  if (!pipeline) return null;

  const stages = [
    { key: "NEW", label: "New Leads", color: "#3b82f6" },
    { key: "SITE_VISIT_SCHEDULED", label: "Site Visits", color: "#9333ea" },
    { key: "NEGOTIATION", label: "In Negotiation", color: "#f97316" },
    { key: "BOOKED", label: "Booked", color: "#10b981" },
  ];

  const pipelineData: Record<string, number> = {
    NEW:
      (pipeline["NEW"] || 0) +
      (pipeline["CONTACTED"] || 0) +
      (pipeline["INTERESTED"] || 0) +
      (pipeline["QUALIFIED"] || 0),
    SITE_VISIT_SCHEDULED:
      (pipeline["SITE_VISIT_SCHEDULED"] || 0) +
      (pipeline["SITE_VISIT_CONDUCTED"] || 0) +
      (pipeline["SITE_VISIT_COMPLETED"] || 0),
    NEGOTIATION: pipeline["NEGOTIATION"] || 0,
    BOOKED: (pipeline["BOOKED"] || 0) + (pipeline["BOOKING"] || 0),
  };

  const total = Object.values(pipelineData).reduce((a, b) => a + b, 0);

  return (
    <div
      className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 transition-all duration-300 relative overflow-hidden"
      style={{
        boxShadow:
          "0 1px 0 rgba(255, 255, 255, 0.95) inset, 0 16px 36px -24px rgba(15, 23, 42, 0.12)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50/90 border border-purple-200/60 flex items-center justify-center text-[var(--brand-700)] shadow-2xs">
            <Layers size={16} />
          </div>
          <div>
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider m-0">
              Channel Partner Conversion Mix
            </h2>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5 m-0">
              Continuous deal distribution across broker-sourced pipeline
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60 tabular-nums">
            {total} Active Opportunities
          </span>
        </div>
      </div>

      {total === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-xs font-semibold text-slate-400 text-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
            <Filter size={20} className="text-slate-300" />
          </div>
          <span>No broker opportunities currently active in the pipeline.</span>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Rapport .ov-mix continuous multi-segment bar */}
          <div className="relative p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 shadow-inner">
            <div className="flex h-5 rounded-xl overflow-hidden gap-[2px]">
              {stages.map((stage) => {
                const count = pipelineData[stage.key] || 0;
                const percentage = total > 0 ? (count / total) * 100 : 0;
                if (percentage === 0) return null;

                const isHovered = hoveredKey === stage.key;
                return (
                  <div
                    key={stage.key}
                    onMouseEnter={() => setHoveredKey(stage.key)}
                    onMouseLeave={() => setHoveredKey(null)}
                    style={{
                      backgroundColor: stage.color,
                      width: `${percentage}%`,
                      filter: hoveredKey && !isHovered ? "opacity(0.4)" : "opacity(1)",
                    }}
                    className="h-full transition-all duration-300 relative group cursor-pointer flex items-center justify-center overflow-hidden"
                  >
                    {percentage > 9 && (
                      <span className="text-[10px] font-black text-white tabular-nums drop-shadow-xs select-none">
                        {count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Metric cards with percentage share */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stages.map((stage) => {
              const count = pipelineData[stage.key] || 0;
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
              const isHovered = hoveredKey === stage.key;

              return (
                <div
                  key={stage.key}
                  onMouseEnter={() => setHoveredKey(stage.key)}
                  onMouseLeave={() => setHoveredKey(null)}
                  className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                    isHovered
                      ? "bg-white border-slate-300 shadow-xs translate-y-[-1px]"
                      : "bg-slate-50/60 border-slate-200/70 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: stage.color }}
                      />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider truncate">
                        {stage.label}
                      </span>
                    </div>
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-white border border-slate-200/80 text-slate-600 tabular-nums">
                      {percentage}%
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl font-black text-slate-900 tabular-nums tracking-tight">
                      {count}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      deals
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
