"use client";

import React, { useState } from "react";
import {
  ClipboardList,
  Calendar,
  PhoneForwarded,
  ChevronRight,
} from "lucide-react";

import { motion } from "framer-motion";

export function SourcingManagerTasks({ dashData }: { dashData: any }) {
  const [activeTab, setActiveTab] = useState<"MEETINGS" | "FOLLOW_UPS">(
    "MEETINGS"
  );

  const todayMeetings = dashData.todayMeetingList || [];
  const followUps = dashData.todayFollowUpList || [];

  const tabs = [
    { id: "MEETINGS", label: "Broker Meetings", count: todayMeetings.length },
    { id: "FOLLOW_UPS", label: "Check-ins", count: followUps.length },
  ];

  return (
    <div
      className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between h-full"
      style={{
        boxShadow:
          "0 1px 0 rgba(255, 255, 255, 0.95) inset, 0 16px 36px -24px rgba(15, 23, 42, 0.12)",
      }}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50/90 border border-purple-200/60 flex items-center justify-center text-[var(--brand-700)] shadow-2xs">
              <ClipboardList size={16} />
            </div>
            <div>
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider m-0">
                Daily Partner Tasks
              </h2>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5 m-0">
                Scheduled meetings and broker check-ins for today
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
            {todayMeetings.length + followUps.length} Actions
          </span>
        </div>

        {/* Fluid sliding tab switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/70 mb-4">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex-1 py-1.5 px-3 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                  isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sourcingTasksActiveTab"
                    className="absolute inset-0 bg-white rounded-xl shadow-xs border border-slate-200/80"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
                <span className="relative z-10 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-slate-100 text-slate-700 tabular-nums">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="max-h-[380px] overflow-y-auto pr-1">
          {activeTab === "MEETINGS" && (
            <ListMeetings
              items={todayMeetings}
              emptyMsg="No broker meetings scheduled for today."
            />
          )}
          {activeTab === "FOLLOW_UPS" && (
            <ListFollowUps
              items={followUps}
              emptyMsg="No broker follow-ups scheduled for today."
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ListMeetings({
  items,
  emptyMsg,
}: {
  items: any[];
  emptyMsg: string;
}) {
  if (items.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-xs font-semibold text-[var(--text-muted)] text-center gap-2">
        <Calendar size={24} className="text-slate-300" />
        <span>{emptyMsg}</span>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {items.map((meeting) => (
        <div
          key={meeting.id}
          className="flex items-center justify-between p-3 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-100/60 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0 text-[var(--brand-700)]">
              <Calendar size={16} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                Broker: {meeting.broker?.name || "Unknown"}
              </div>
              <div className="text-[10px] font-semibold text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-extrabold uppercase tracking-wider text-[8px] border border-emerald-200/60">
                  Scheduled
                </span>
                <span>•</span>
                <span className="tabular-nums">
                  {new Date(meeting.scheduledDate).toLocaleString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-400 shrink-0" />
        </div>
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
      <div className="py-12 flex flex-col items-center justify-center text-xs font-semibold text-[var(--text-muted)] text-center gap-2">
        <PhoneForwarded size={24} className="text-slate-300" />
        <span>{emptyMsg}</span>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {items.map((fup) => (
        <div
          key={fup.id}
          className="flex items-center justify-between p-3 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-100/60 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
              <PhoneForwarded size={16} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                Broker: {fup.broker?.name || "Unknown"}
              </div>
              <div className="text-[10px] font-semibold text-[var(--text-muted)] mt-0.5 tabular-nums">
                Scheduled:{" "}
                {new Date(fup.scheduledDate).toLocaleString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </div>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-400 shrink-0" />
        </div>
      ))}
    </div>
  );
}
