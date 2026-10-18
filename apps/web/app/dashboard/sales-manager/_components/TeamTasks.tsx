"use client";

import { useState } from "react";
import { Calendar, CheckCircle2, Clock, PhoneForwarded, MapPin, ChevronRight } from "lucide-react";
import { DashboardData } from "./types";
import Link from "next/link";
import { motion } from "framer-motion";

export function TeamTasks({ data }: { data: DashboardData }) {
  const { todaySiteVisitList = [], todayFollowUpList = [] } = data;
  const [activeTab, setActiveTab] = useState<"SITE_VISITS" | "FOLLOW_UPS">("SITE_VISITS");

  return (
    <div
      className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 flex flex-col justify-between h-full transition-all duration-300"
      style={{
        boxShadow:
          "0 1px 0 rgba(255, 255, 255, 0.95) inset, 0 16px 36px -24px rgba(15, 23, 42, 0.12)",
      }}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50/90 border border-purple-200/60 flex items-center justify-center text-[var(--brand-700)] shadow-2xs">
              <Calendar size={16} />
            </div>
            <div>
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider m-0">
                Today's Team Tasks &amp; Dispatches
              </h2>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5 m-0">
                Scheduled client meetings and priority sales follow-ups
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
            {todaySiteVisitList.length + todayFollowUpList.length} Active
          </span>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/70 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab("SITE_VISITS")}
            className={`relative flex-1 py-1.5 px-3 rounded-xl text-[11px] font-extrabold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "SITE_VISITS" ? "text-slate-900" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {activeTab === "SITE_VISITS" && (
              <motion.div
                layoutId="teamTasksActiveTab"
                className="absolute inset-0 bg-white rounded-xl shadow-xs border border-slate-200/80"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <MapPin size={13} className="text-blue-600" />
              Site Visits
            </span>
            <span className="relative z-10 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-blue-100/80 text-blue-700 tabular-nums">
              {todaySiteVisitList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("FOLLOW_UPS")}
            className={`relative flex-1 py-1.5 px-3 rounded-xl text-[11px] font-extrabold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "FOLLOW_UPS" ? "text-slate-900" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {activeTab === "FOLLOW_UPS" && (
              <motion.div
                layoutId="teamTasksActiveTab"
                className="absolute inset-0 bg-white rounded-xl shadow-xs border border-slate-200/80"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <PhoneForwarded size={13} className="text-emerald-600" />
              Follow-ups
            </span>
            <span className="relative z-10 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-100/80 text-emerald-700 tabular-nums">
              {todayFollowUpList.length}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {activeTab === "SITE_VISITS" ? (
            todaySiteVisitList.length === 0 ? (
              <div className="text-center py-10 text-xs font-semibold text-slate-400 flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <MapPin size={20} className="text-slate-300" />
                </div>
                <span>No site visits scheduled for today.</span>
              </div>
            ) : (
              todaySiteVisitList.map((sv) => (
                <Link
                  href={`/dashboard/sales-manager/lead-management/${sv.lead?.id}`}
                  key={sv.id}
                  className="flex justify-between items-center p-3 rounded-2xl border border-slate-200/70 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 no-underline group shadow-2xs hover:shadow-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="m-0 text-xs font-bold text-slate-900 truncate group-hover:text-[var(--brand-700)] transition-colors">
                      {sv.lead?.firstName} {sv.lead?.lastName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] uppercase font-black text-[var(--brand-700)] bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200/60">
                        {sv.salesExec?.name || "Executive"}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 truncate">
                        {sv.project?.name || "No Project"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-2">
                    <div>
                      <p className="m-0 text-xs font-black text-[var(--brand-700)] tabular-nums">
                        {new Date(sv.scheduledDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="m-0 mt-0.5 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                        {sv.status.replace(/_/g, " ")}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </div>
                </Link>
              ))
            )
          ) : (
            todayFollowUpList.length === 0 ? (
              <div className="text-center py-10 text-xs font-semibold text-slate-400 flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <PhoneForwarded size={20} className="text-slate-300" />
                </div>
                <span>No follow-ups scheduled for today.</span>
              </div>
            ) : (
              todayFollowUpList.map((fup) => (
                <Link
                  href={`/dashboard/sales-manager/lead-management/${fup.lead?.id}`}
                  key={fup.id}
                  className="flex justify-between items-center p-3 rounded-2xl border border-slate-200/70 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 no-underline group shadow-2xs hover:shadow-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="m-0 text-xs font-bold text-slate-900 truncate group-hover:text-[var(--brand-700)] transition-colors">
                      {fup.lead?.firstName} {fup.lead?.lastName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] uppercase font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                        {fup.user?.name || "Agent"}
                      </span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider border ${
                          fup.lead?.temperature === "HOT"
                            ? "bg-rose-50 text-rose-700 border-rose-200/70"
                            : fup.lead?.temperature === "WARM"
                            ? "bg-amber-50 text-amber-700 border-amber-200/70"
                            : "bg-blue-50 text-blue-700 border-blue-200/70"
                        }`}
                      >
                        {fup.lead?.temperature || "COLD"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2 shrink-0">
                    <div>
                      <p className="m-0 text-xs font-black text-[var(--brand-700)] tabular-nums">
                        {new Date(fup.scheduledDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {fup.status === "COMPLETED" ? (
                        <span className="flex items-center justify-end gap-1 text-[9px] font-black text-emerald-600 uppercase tracking-wider mt-0.5">
                          <CheckCircle2 size={11} /> Done
                        </span>
                      ) : (
                        <span className="flex items-center justify-end gap-1 text-[9px] font-black text-amber-600 uppercase tracking-wider mt-0.5">
                          <Clock size={11} /> Pending
                        </span>
                      )}
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </div>
                </Link>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
}
