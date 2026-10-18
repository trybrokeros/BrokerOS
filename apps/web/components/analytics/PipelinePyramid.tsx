"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { TrendingDown, ArrowDown } from "lucide-react";

export interface PipelineStageData {
  stage: string;
  count: number;
  color: string;
}

interface PipelinePyramidProps {
  data: PipelineStageData[];
}

export function PipelinePyramid({ data }: PipelinePyramidProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="py-12 text-center text-xs font-semibold text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        No pipeline stages defined.
      </div>
    );
  }

  const topCount = Math.max(data[0].count, 1);

  return (
    <div className="w-full max-w-xl mx-auto py-4 space-y-3">
      {data.map((item, index) => {
        const pctOfTop = Math.round((item.count / topCount) * 100);
        const widthPct = Math.max(pctOfTop, 28);
        const isHovered = hoveredIdx === index;

        // Calculate drop-off from previous stage
        let dropoff = 0;
        if (index > 0) {
          const prevCount = data[index - 1].count;
          if (prevCount > 0) {
            dropoff = Math.round(((prevCount - item.count) / prevCount) * 100);
          }
        }

        return (
          <div key={item.stage} className="flex flex-col items-center">
            {/* Drop-off bridge indicator */}
            {index > 0 && dropoff > 0 && (
              <div className="flex items-center gap-1.5 py-1 text-[10px] font-extrabold text-slate-400">
                <ArrowDown size={11} className="text-slate-300" />
                <span>
                  -{dropoff}% drop-off
                </span>
              </div>
            )}

            {/* Stage Pod */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              onMouseEnter={() => setHoveredIdx(index)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                width: `${widthPct}%`,
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              className={`relative rounded-2xl p-3 sm:p-4 text-white shadow-md cursor-pointer transition-transform ${
                isHovered ? "scale-[1.03] shadow-xl z-10 ring-2 ring-slate-900/20" : ""
              }`}
            >
              <div
                className="absolute inset-0 rounded-2xl opacity-90 transition-opacity"
                style={{
                  backgroundColor: item.color,
                  boxShadow: "0 1px 0 rgba(255,255,255,0.2) inset",
                }}
              />

              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/80 block truncate">
                    {item.stage}
                  </span>
                  <div className="text-lg sm:text-xl font-black tabular-nums tracking-tight">
                    {item.count.toLocaleString()}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-white">
                    {pctOfTop}%
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
