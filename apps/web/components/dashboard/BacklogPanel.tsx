"use client";

import React from "react";
import { CheckCircle2, PhoneMissed, CalendarClock, AlertCircle, PhoneCall, ChevronRight, Sparkles } from "lucide-react";

export interface MissedFollowUp {
  id: string;
  scheduledDate: string;
  lead?: { firstName?: string; lastName?: string; phone?: string };
  customer?: { firstName?: string; lastName?: string; phone?: string };
}

export function BacklogPanel({
  coldCallBacklogCount = 0,
  missedFollowUps = [],
}: {
  coldCallBacklogCount?: number;
  missedFollowUps?: MissedFollowUp[];
}) {
  const hasBacklog = coldCallBacklogCount > 0 || missedFollowUps.length > 0;
  const totalBacklog = coldCallBacklogCount + missedFollowUps.length;

  return (
    <div
      className={`bg-white rounded-2xl p-6 border transition-all duration-200 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_12px_28px_-16px_rgba(20,24,36,0.08)] flex flex-col justify-between h-full ${hasBacklog ? "border-rose-200/90" : "border-slate-200/90"
        }`}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${hasBacklog
                ? "bg-rose-50 text-rose-600 border border-rose-200/80"
                : "bg-emerald-50 text-emerald-600 border border-emerald-200/80"
                }`}
            >
              {hasBacklog ? (
                <AlertCircle size={16} strokeWidth={2.2} />
              ) : (
                <CheckCircle2 size={16} strokeWidth={2.2} />
              )}
            </div>
            <div>
              <div
                className={`text-xs font-bold tracking-tight ${hasBacklog ? "text-rose-900" : "text-[var(--text-primary)]"
                  }`}
              >
                Urgent Backlog Queue
              </div>
              <span className="text-[10px] font-medium text-slate-400">
                Action-Required SLAs
              </span>
            </div>
          </div>

          {hasBacklog && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-extrabold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
              {totalBacklog} Pending
            </span>
          )}
        </div>

        {/* Content Body */}
        {!hasBacklog ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-2xs">
              <CheckCircle2 size={24} strokeWidth={2.2} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                All Caught Up!
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                Zero cold call backlogs or missed follow-ups in your queue.
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Cold call backlog tile (Wharf Style) */}
            {coldCallBacklogCount > 0 && (
              <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3.5 hover:bg-rose-50 transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <PhoneMissed size={14} className="text-rose-600 flex-shrink-0" />
                    <span className="text-xs font-bold text-rose-900">
                      Cold Call Backlog
                    </span>
                  </div>
                  <span className="bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full text-[11px] font-extrabold tabular-nums">
                    {coldCallBacklogCount}
                  </span>
                </div>
                <p className="text-[11px] font-medium text-rose-700 leading-relaxed mb-0">
                  Call {coldCallBacklogCount} unassigned lead{coldCallBacklogCount > 1 ? "s" : ""} to keep SLA pace under 15 minutes.
                </p>
              </div>
            )}

            {/* Missed follow-ups tile */}
            {missedFollowUps.length > 0 && (
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <CalendarClock size={14} className="text-amber-800 flex-shrink-0" />
                    <span className="text-xs font-bold text-amber-950">
                      Overdue Follow-ups
                    </span>
                  </div>
                  <span className="bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full text-[11px] font-extrabold tabular-nums">
                    {missedFollowUps.length}
                  </span>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {missedFollowUps.slice(0, 5).map((fu) => {
                    const firstName = fu.lead?.firstName ?? fu.customer?.firstName ?? "";
                    const lastName = fu.lead?.lastName ?? fu.customer?.lastName ?? "";
                    const name = `${firstName} ${lastName}`.trim() || "Prospective Buyer";
                    return (
                      <div
                        key={fu.id}
                        className="flex justify-between items-center text-xs py-1.5 px-2 rounded-lg bg-white/80 border border-amber-200/60"
                      >
                        <span className="font-bold text-slate-800 truncate">
                          {name}
                        </span>
                        <span className="text-[10px] font-bold text-amber-800 tabular-nums flex-shrink-0 ml-2 bg-amber-100/80 px-1.5 py-0.5 rounded">
                          {new Date(fu.scheduledDate).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {hasBacklog && (
        <div className="pt-3 border-t border-slate-100 mt-3">
          <button
            onClick={() => window.location.href = "/dashboard/inbox"}
            className="w-full py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-[0.98]"
          >
            <span>Launch Triage Queue</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
