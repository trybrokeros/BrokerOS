"use client";

import React, { useState } from "react";
import { BarChart3, Layers, Filter } from "lucide-react";

export interface PipelineStage {
  key: string;
  label: string;
  color: string;
}

export function resolveStageCount(
  data: Record<string, number> = {},
  key: string
): number {
  if (!data || typeof data !== "object") return 0;

  // 1. Exact match
  if (typeof data[key] === "number") return data[key];

  // 2. Case-insensitive lookups
  const upperKey = key.toUpperCase();
  const lowerKey = key.toLowerCase();
  if (typeof data[upperKey] === "number") return data[upperKey];
  if (typeof data[lowerKey] === "number") return data[lowerKey];

  // 3. Snake/Camel-case variations
  const snakeKey = key.replace(/([A-Z])/g, "_$1").toUpperCase();
  if (typeof data[snakeKey] === "number") return data[snakeKey];

  // 4. Semantic aliases
  if (upperKey === "NEW" || upperKey === "NEW_LEAD" || upperKey === "NEWLEAD") {
    return data["NEW"] ?? data["new"] ?? 0;
  }
  if (upperKey === "CONTACTED") {
    return data["CONTACTED"] ?? data["contacted"] ?? 0;
  }
  if (upperKey === "INTERESTED") {
    return data["INTERESTED"] ?? data["interested"] ?? 0;
  }
  if (upperKey === "QUALIFIED") {
    return data["QUALIFIED"] ?? data["qualified"] ?? 0;
  }
  if (
    upperKey === "SITEVISIT" ||
    upperKey === "SITE_VISIT" ||
    upperKey === "SITE_VISITS"
  ) {
    if (typeof data["siteVisit"] === "number") return data["siteVisit"];
    if (typeof data["SITE_VISIT"] === "number") return data["SITE_VISIT"];
    return (
      (data["SITE_VISIT_SCHEDULED"] ?? 0) + (data["SITE_VISIT_COMPLETED"] ?? 0)
    );
  }
  if (upperKey === "SITE_VISIT_SCHEDULED" || upperKey === "SITEVISITSCHEDULED") {
    return data["SITE_VISIT_SCHEDULED"] ?? data["siteVisitScheduled"] ?? 0;
  }
  if (upperKey === "SITE_VISIT_COMPLETED" || upperKey === "SITEVISITCOMPLETED") {
    return data["SITE_VISIT_COMPLETED"] ?? data["siteVisitCompleted"] ?? 0;
  }
  if (upperKey === "NEGOTIATION" || upperKey === "NEGOTIATIONS") {
    return (
      data["NEGOTIATION"] ??
      data["negotiation"] ??
      data["negotiations"] ??
      0
    );
  }
  if (
    upperKey === "BOOKED" ||
    upperKey === "BOOKING" ||
    upperKey === "BOOKINGS"
  ) {
    return (
      data["BOOKING"] ??
      data["BOOKED"] ??
      data["booked"] ??
      data["booking"] ??
      data["bookings"] ??
      0
    );
  }
  if (
    upperKey === "LOST" ||
    upperKey === "CANCELLED" ||
    upperKey === "DISQUALIFIED"
  ) {
    return (
      data["LOST"] ??
      data["lost"] ??
      data["CANCELLED"] ??
      data["cancelled"] ??
      0
    );
  }

  // 5. Case-insensitive key scan
  for (const [k, v] of Object.entries(data)) {
    if (k.toLowerCase() === lowerKey && typeof v === "number") return v;
  }

  return 0;
}

export function PipelineBar({
  title = "Pipeline Stages",
  stages,
  data,
}: {
  title?: string;
  stages: PipelineStage[];
  data: Record<string, number>;
}) {
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);

  // Compute total volume across configured stages, or fallback to sum of data values
  const stageSum = stages.reduce(
    (acc, stage) => acc + resolveStageCount(data, stage.key),
    0
  );
  const dataSum = Object.values(data || {}).reduce(
    (acc, curr) => acc + (typeof curr === "number" ? curr : 0),
    0
  );
  const totalCount = stageSum > 0 ? stageSum : dataSum;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_12px_28px_-16px_rgba(20,24,36,0.08)] flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[var(--brand-600)]">
              <Layers size={16} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[var(--text-primary)] tracking-tight m-0">
                {title}
              </h2>
              <span className="text-[10px] font-medium text-slate-400">
                Continuous Conversion Flow
              </span>
            </div>
          </div>

          <span className="text-[11px] font-bold text-slate-700 bg-slate-100/80 px-2 py-0.5 rounded-md tabular-nums">
            {totalCount} Total Deals
          </span>
        </div>

        {/* Multi-Segment Continuous Distribution Bar (Rapport ov-mix__bar) */}
        <div className="h-4 w-full bg-slate-100/90 rounded-xl overflow-hidden flex gap-1 p-1 mb-4 shadow-inner">
          {stages.map((stage) => {
            const count = resolveStageCount(data, stage.key);
            const pct = totalCount > 0 ? (count / totalCount) * 100 : 0;
            if (pct <= 0) return null;

            const isHovered = hoveredStage === stage.key;
            return (
              <div
                key={stage.key}
                onMouseEnter={() => setHoveredStage(stage.key)}
                onMouseLeave={() => setHoveredStage(null)}
                className={`h-full rounded-md transition-all duration-200 cursor-pointer ${
                  isHovered ? "brightness-110 scale-y-110 shadow-xs" : ""
                } ${hoveredStage && !isHovered ? "opacity-35" : "opacity-100"}`}
                style={{
                  width: `${pct}%`,
                  backgroundColor: stage.color,
                }}
                title={`${stage.label}: ${count} (${Math.round(pct)}%)`}
              />
            );
          })}
        </div>
      </div>

      {/* Stage Breakdown Grid (Rapport ov-mix__legend) */}
      <div className="space-y-1.5 pt-1 border-t border-slate-100 flex-1">
        {stages.map((stage) => {
          const count = resolveStageCount(data, stage.key);
          const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
          const isHovered = hoveredStage === stage.key;

          return (
            <div
              key={stage.key}
              onMouseEnter={() => setHoveredStage(stage.key)}
              onMouseLeave={() => setHoveredStage(null)}
              className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer ${
                isHovered
                  ? "bg-slate-100/90 shadow-2xs font-bold"
                  : "hover:bg-slate-50/80"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform duration-150"
                  style={{
                    backgroundColor: stage.color,
                    transform: isHovered ? "scale(1.3)" : "scale(1)",
                  }}
                />
                <span className="font-semibold text-[var(--text-secondary)] truncate">
                  {stage.label}
                </span>
              </div>

              <div className="flex items-center gap-3 tabular-nums">
                <span className="font-extrabold text-[var(--text-primary)]">
                  {count}
                </span>
                <span className="text-[10px] font-bold text-slate-400 w-8 text-right">
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
