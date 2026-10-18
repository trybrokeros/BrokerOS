"use client";

import React, { useState } from "react";
import { DashboardData } from "../types";
import {
  ClipboardList,
  MapPin,
  PhoneForwarded,
  ChevronRight,
  AlertCircle,
  Calendar,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function SalesExecTasks({ dashData }: { dashData: DashboardData }) {
  const [activeTab, setActiveTab] = useState<
    "TODAY_SV" | "BACKLOG_SV" | "FOLLOW_UPS"
  >("TODAY_SV");

  const todaySVs = dashData.todaySiteVisitList || [];
  const backlogSVs = dashData.backlogSiteVisitList || [];
  const followUps = [
    ...(dashData.missedFollowUpBacklog || []),
    ...(dashData.todayFollowUpList || []),
  ];

  const tabs = [
    {
      id: "TODAY_SV",
      label: "Today's SVs",
      count: todaySVs.length,
      badgeColor: "bg-blue-100/70 text-blue-700",
    },
    {
      id: "BACKLOG_SV",
      label: "SV Backlog",
      count: backlogSVs.length,
      badgeColor: backlogSVs.length > 0 ? "bg-rose-100/80 text-rose-700" : "bg-slate-100 text-slate-600",
    },
    {
      id: "FOLLOW_UPS",
      label: "Follow-ups",
      count: followUps.length,
      badgeColor: "bg-emerald-100/70 text-emerald-700",
    },
  ];

  return (
    <div
      className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl flex flex-col h-full overflow-hidden transition-all duration-300"
      style={{
        boxShadow:
          "0 1px 0 rgba(255, 255, 255, 0.95) inset, 0 16px 36px -24px rgba(15, 23, 42, 0.12)",
      }}
    >
      {/* Header */}
      <div className="p-5 pb-3 border-b border-slate-100/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50/90 border border-purple-200/60 flex items-center justify-center text-[var(--brand-700)] shadow-2xs">
              <ClipboardList size={16} />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
                <span>Daily Tasks &amp; Operational Backlog</span>
              </h3>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5 m-0">
                Site visit execution queue &amp; scheduled phone touchpoints
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
            {todaySVs.length + backlogSVs.length + followUps.length} Actions
          </span>
        </div>

        {/* Wharf-style Fluid Sliding Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/70 mt-3.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex-1 py-1.5 px-2 rounded-xl text-[11px] font-extrabold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                  isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="salesExecTasksTab"
                    className="absolute inset-0 bg-white rounded-xl shadow-xs border border-slate-200/80"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
                <span
                  className={`relative z-10 px-1.5 py-0.2 rounded-full text-[9px] font-black tabular-nums ${tab.badgeColor}`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-4 max-h-[380px] space-y-2">
        {activeTab === "TODAY_SV" && (
          <ListSVs
            items={todaySVs}
            emptyMsg="No site visits scheduled for today."
            iconColor="text-blue-600"
            iconBg="bg-blue-50/80 border-blue-200/60"
          />
        )}
        {activeTab === "BACKLOG_SV" && (
          <ListSVs
            items={backlogSVs}
            emptyMsg="No backlog site visits. All client visits verified!"
            isBacklog
            iconColor="text-rose-600"
            iconBg="bg-rose-50/80 border-rose-200/60"
          />
        )}
        {activeTab === "FOLLOW_UPS" && (
          <ListFollowUps
            items={followUps}
            emptyMsg="No follow-up calls pending right now."
          />
        )}
      </div>
    </div>
  );
}

function ListSVs({
  items,
  emptyMsg,
  isBacklog = false,
  iconColor,
  iconBg,
}: {
  items: any[];
  emptyMsg: string;
  isBacklog?: boolean;
  iconColor: string;
  iconBg: string;
}) {
  if (items.length === 0) {
    return (
      <div className="text-xs font-semibold text-slate-400 text-center py-12 flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
          <MapPin size={20} className="text-slate-300" />
        </div>
        <span>{emptyMsg}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {items.map((sv) => (
        <Link
          href={`/dashboard/sales-executive/lead-management/${sv.lead.id}`}
          key={sv.id}
          className="flex items-center justify-between p-3 border border-slate-200/70 hover:border-slate-300 hover:bg-slate-50/90 rounded-2xl transition-all duration-200 group no-underline shadow-2xs hover:shadow-xs"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${iconBg} shadow-2xs`}
            >
              <MapPin size={16} className={iconColor} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2 truncate">
                <span className="truncate">
                  {sv.lead.firstName} {sv.lead.lastName}
                </span>
                {isBacklog && (
                  <span className="flex items-center gap-1 text-[9px] font-black text-rose-700 bg-rose-50 border border-rose-200/70 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                    <AlertCircle size={10} /> Overdue
                  </span>
                )}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 mt-0.5 flex items-center gap-1.5 tabular-nums">
                <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md text-[9px] uppercase tracking-wider font-extrabold border border-slate-200/60">
                  {sv.project?.name || "Project"}
                </span>
                <span>•</span>
                <span>
                  {new Date(sv.scheduledDate).toLocaleString([], {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            </div>
          </div>
          <div className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-[var(--brand-700)] group-hover:bg-purple-50 border border-transparent group-hover:border-purple-200/60 transition-all">
            <ChevronRight size={15} />
          </div>
        </Link>
      ))}
    </div>
  );
}

function ListFollowUps({
  items,
  emptyMsg,
}: {
  items: any[];
  emptyMsg: string;
}) {
  if (items.length === 0) {
    return (
      <div className="text-xs font-semibold text-slate-400 text-center py-12 flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
          <PhoneForwarded size={20} className="text-slate-300" />
        </div>
        <span>{emptyMsg}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {items.map((fup) => (
        <Link
          href={`/dashboard/sales-executive/lead-management/${fup.lead.id}`}
          key={fup.id}
          className="flex items-center justify-between p-3 border border-slate-200/70 hover:border-slate-300 hover:bg-slate-50/90 rounded-2xl transition-all duration-200 group no-underline shadow-2xs hover:shadow-xs"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-50/90 border border-emerald-200/60 flex items-center justify-center shrink-0 shadow-2xs">
              <PhoneForwarded size={16} className="text-emerald-700" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2 truncate">
                <span className="truncate">
                  {fup.lead.firstName} {fup.lead.lastName}
                </span>
                {fup.status === "MISSED" && (
                  <span className="flex items-center gap-1 text-[9px] font-black text-rose-700 bg-rose-50 border border-rose-200/70 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                    <AlertCircle size={10} /> Missed
                  </span>
                )}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 mt-0.5 tabular-nums">
                Scheduled:{" "}
                {new Date(fup.scheduledDate).toLocaleString([], {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </div>
            </div>
          </div>
          <div className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-emerald-700 group-hover:bg-emerald-50 border border-transparent group-hover:border-emerald-200/60 transition-all">
            <ChevronRight size={15} />
          </div>
        </Link>
      ))}
    </div>
  );
}
