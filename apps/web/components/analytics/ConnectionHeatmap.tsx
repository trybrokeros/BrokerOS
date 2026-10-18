"use client";

import React, { useMemo, useState } from "react";
import { Zap, Clock } from "lucide-react";

interface HeatmapData {
  day: number;
  hour: number;
  count: number;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function ConnectionHeatmap({ data }: { data: HeatmapData[] }) {
  const [hoveredCell, setHoveredCell] = useState<{
    day: string;
    hour: number;
    count: number;
  } | null>(null);

  const maxCount = useMemo(() => {
    return Math.max(...(data || []).map((d) => d.count), 1);
  }, [data]);

  // Find peak day & hour
  const peakCell = useMemo(() => {
    if (!data || data.length === 0) return null;
    return [...data].sort((a, b) => b.count - a.count)[0];
  }, [data]);

  const getColorClass = (count: number) => {
    if (count === 0) return "bg-slate-100/90 border-slate-200/40 text-transparent";
    const intensity = count / maxCount;
    if (intensity < 0.25)
      return "bg-emerald-100 border-emerald-200 text-emerald-800";
    if (intensity < 0.5)
      return "bg-emerald-300 border-emerald-400 text-emerald-950";
    if (intensity < 0.75)
      return "bg-emerald-500 border-emerald-600 text-white";
    return "bg-emerald-700 border-emerald-800 text-white shadow-xs";
  };

  return (
    <div className="w-full space-y-4">
      {/* Peak Intelligence Banner */}
      {peakCell && peakCell.count > 0 && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
              <Zap size={14} className="fill-current" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 block">
                Peak Connect Intelligence
              </span>
              <p className="text-xs font-bold text-emerald-950 m-0">
                Highest connection volume occurs on{" "}
                <span className="underline decoration-emerald-400 font-black">
                  {DAYS[peakCell.day]} at{" "}
                  {peakCell.hour % 12 === 0 ? 12 : peakCell.hour % 12}
                  {peakCell.hour >= 12 ? ":00 PM" : ":00 AM"}
                </span>{" "}
                ({peakCell.count} connects)
              </p>
            </div>
          </div>

          {hoveredCell && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-black text-slate-800 bg-white px-3 py-1 rounded-xl border border-slate-200/80 shadow-2xs">
              <Clock size={12} className="text-slate-400" />
              <span>
                {hoveredCell.day}{" "}
                {hoveredCell.hour % 12 === 0 ? 12 : hoveredCell.hour % 12}
                {hoveredCell.hour >= 12 ? "pm" : "am"}:
              </span>
              <span className="text-emerald-700">{hoveredCell.count} calls</span>
            </div>
          )}
        </div>
      )}

      {/* Grid container with horizontal scroll */}
      <div className="w-full overflow-x-auto pb-2">
        <div className="min-w-[700px] max-w-full">
          {/* Header - Hours */}
          <div className="flex mb-1 pl-10 pr-2">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="flex-1 text-[9px] text-center font-extrabold text-slate-400 tabular-nums"
              >
                {hour % 12 === 0 ? 12 : hour % 12}
                <span className="text-[8px] font-medium opacity-75">
                  {hour >= 12 ? "p" : "a"}
                </span>
              </div>
            ))}
          </div>

          {/* Grid rows */}
          <div className="flex flex-col gap-1.5">
            {DAYS.map((dayName, dayIdx) => (
              <div key={dayName} className="flex items-center gap-2">
                <div className="w-8 shrink-0 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider text-right pr-1">
                  {dayName}
                </div>
                <div className="flex flex-1 gap-1">
                  {HOURS.map((hour) => {
                    const cellData = (data || []).find(
                      (d) => d.day === dayIdx && d.hour === hour
                    ) || { count: 0 };
                    return (
                      <div
                        key={`${dayIdx}-${hour}`}
                        onMouseEnter={() =>
                          setHoveredCell({
                            day: dayName,
                            hour,
                            count: cellData.count,
                          })
                        }
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`flex-1 h-6 rounded-lg border ${getColorClass(
                          cellData.count
                        )} transition-all duration-150 hover:scale-125 hover:z-10 hover:shadow-md cursor-pointer`}
                        title={`${dayName} ${
                          hour % 12 === 0 ? 12 : hour % 12
                        }${hour >= 12 ? "pm" : "am"} • ${
                          cellData.count
                        } connected calls`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-2.5 mt-4 text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">
            <span>Low Volume</span>
            <div className="flex gap-1 items-center">
              <div className="w-3.5 h-3.5 rounded-md bg-slate-100 border border-slate-200" />
              <div className="w-3.5 h-3.5 rounded-md bg-emerald-100 border border-emerald-200" />
              <div className="w-3.5 h-3.5 rounded-md bg-emerald-300 border border-emerald-400" />
              <div className="w-3.5 h-3.5 rounded-md bg-emerald-500 border border-emerald-600" />
              <div className="w-3.5 h-3.5 rounded-md bg-emerald-700 border border-emerald-800" />
            </div>
            <span>High Connect Rate</span>
          </div>
        </div>
      </div>
    </div>
  );
}
