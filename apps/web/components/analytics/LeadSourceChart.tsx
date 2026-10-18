"use client";

import React, { useState } from "react";
import { PieChart as PieIcon, Globe, MessageSquare, Megaphone, Share2, Users, Building, ShieldCheck } from "lucide-react";

interface LeadSourceData {
  source: string;
  count: number;
}

interface LeadSourceChartProps {
  data: LeadSourceData[];
}

export function LeadSourceChart({ data }: LeadSourceChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const channelColors = [
    { bg: "from-indigo-600 to-indigo-500", text: "text-indigo-600", dot: "#6366f1" },
    { bg: "from-emerald-600 to-emerald-500", text: "text-emerald-600", dot: "#10b981" },
    { bg: "from-amber-600 to-amber-500", text: "text-amber-600", dot: "#f59e0b" },
    { bg: "from-rose-600 to-rose-500", text: "text-rose-600", dot: "#f43f5e" },
    { bg: "from-sky-600 to-sky-500", text: "text-sky-600", dot: "#0ea5e9" },
    { bg: "from-purple-600 to-purple-500", text: "text-purple-600", dot: "#9333ea" },
    { bg: "from-teal-600 to-teal-500", text: "text-teal-600", dot: "#14b8a6" },
  ];

  const getSourceIcon = (src: string) => {
    const s = (src || "").toLowerCase();
    if (s.includes("whatsapp")) return MessageSquare;
    if (s.includes("meta") || s.includes("facebook") || s.includes("ad")) return Megaphone;
    if (s.includes("google") || s.includes("web")) return Globe;
    if (s.includes("referral") || s.includes("partner")) return Share2;
    if (s.includes("broker") || s.includes("cp")) return Building;
    if (s.includes("walkin") || s.includes("direct")) return Users;
    return ShieldCheck;
  };

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[240px] flex flex-col items-center justify-center text-xs font-semibold text-slate-400 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 gap-2">
        <PieIcon size={20} className="text-slate-300 stroke-[1.5]" />
        <span>No lead source distribution data for this period.</span>
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => b.count - a.count);
  const totalLeads = sortedData.reduce((acc, curr) => acc + curr.count, 0);
  const maxCount = Math.max(...sortedData.map((d) => d.count), 1);

  return (
    <div className="w-full space-y-3">
      {sortedData.map((item, index) => {
        const pct = totalLeads > 0 ? Math.round((item.count / totalLeads) * 100) : 0;
        const barWidth = Math.max(Math.round((item.count / maxCount) * 100), 4);
        const color = channelColors[index % channelColors.length];
        const Icon = getSourceIcon(item.source);
        const isHovered = hoveredIdx === index;

        return (
          <div
            key={item.source}
            onMouseEnter={() => setHoveredIdx(index)}
            onMouseLeave={() => setHoveredIdx(null)}
            className={`p-2.5 rounded-2xl transition-all duration-200 border cursor-pointer ${
              isHovered
                ? "bg-slate-50 border-slate-300 shadow-2xs -translate-x-0.5"
                : "bg-white border-transparent hover:border-slate-200/80"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center shrink-0"
                  style={{ color: color.dot }}
                >
                  <Icon size={12} className="stroke-[2.2]" />
                </div>
                <span className="text-xs font-extrabold text-slate-800 truncate">
                  {item.source}
                </span>
              </div>

              <div className="flex items-baseline gap-1.5 shrink-0 ml-2">
                <span className="text-xs font-black text-slate-900 tabular-nums">
                  {item.count.toLocaleString()}
                </span>
                <span className="text-[10px] font-extrabold text-slate-400 tabular-nums">
                  {pct}%
                </span>
              </div>
            </div>

            {/* Horizontal pill meter */}
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden relative">
              <div
                style={{
                  width: `${barWidth}%`,
                  transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                className={`h-full rounded-full bg-gradient-to-r ${color.bg}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
