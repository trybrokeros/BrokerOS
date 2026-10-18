"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <div className="h-full bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 relative group overflow-hidden transition-all duration-300 hover:-translate-y-0.5 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_14px_34px_-18px_rgba(15,23,42,0.08)] hover:shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_20px_36px_-16px_rgba(15,23,42,0.12)]">
        {/* Subtle accent sheen */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="flex justify-between items-start gap-3">
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest truncate">
              {title}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 mb-0 tabular-nums truncate">
              {value}
            </div>
            {subtitle && (
              <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                {subtitle}
              </p>
            )}

            {/* {trend && trendValue && (
              <div className="flex items-center mt-3 gap-1.5 w-fit">
                {trend === "up" ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full shadow-2xs">
                    <TrendingUp size={11} className="stroke-[2.5]" />
                    {trendValue}
                  </span>
                ) : trend === "down" ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-800 bg-rose-50 border border-rose-200/80 px-2.5 py-0.5 rounded-full shadow-2xs">
                    <TrendingDown size={11} className="stroke-[2.5]" />
                    {trendValue}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                    <Minus size={11} className="stroke-[2.5]" />
                    {trendValue}
                  </span>
                )}
              </div>
            )} */}
          </div>

          <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-700 border border-slate-200/80 shrink-0 group-hover:scale-105 group-hover:border-slate-300 transition-all shadow-2xs">
            <Icon size={18} className="stroke-[2]" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
