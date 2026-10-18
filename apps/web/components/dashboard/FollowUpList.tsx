"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, PhoneCall, Calendar, Clock, Check, ChevronRight } from "lucide-react";
import { Avatar } from "./Avatar";

export interface FollowUpItem {
  id: string;
  status: string;
  scheduledDate?: string;
  lead?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    status?: string;
    temperature?: string;
    phone?: string;
  };
  customer?: {
    id?: string;
    firstName?: string;
    lastName?: string;
  };
}

const TEMP_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  HOT: { bg: "bg-rose-50 border-rose-200", text: "text-rose-800", dot: "bg-rose-600", label: "Hot Lead" },
  WARM: { bg: "bg-amber-50 border-amber-200", text: "text-amber-800", dot: "bg-amber-500", label: "Warm" },
  COLD: { bg: "bg-sky-50 border-sky-200", text: "text-sky-800", dot: "bg-sky-500", label: "Cold" },
};

export function FollowUpList({
  items,
  onConfirm,
  viewAllHref,
  title = "Today's Follow-ups",
}: {
  items: FollowUpItem[];
  onConfirm?: (id: string) => void;
  viewAllHref?: string;
  title?: string;
}) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const handleComplete = (id: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    if (onConfirm) onConfirm(id);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_12px_28px_-16px_rgba(20,24,36,0.08)] flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[var(--brand-600)]">
              <Clock size={16} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-xs font-bold text-[var(--text-primary)] tracking-tight">
                {title}
              </div>
              <span className="text-[10px] font-medium text-slate-400">
                Scheduled Call Commitments
              </span>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            {items?.length || 0} Scheduled
          </span>
        </div>

        {/* Body (Rapport ov-tasks Style) */}
        {!items || items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-400">
              <Calendar size={18} />
            </div>
            <span className="text-xs font-bold text-slate-700">No Calls Scheduled For Today</span>
            <span className="text-[11px] text-slate-400 max-w-xs">
              Check your lead backlog or assign new inquiries from the departmental inbox.
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((fu) => {
              const name = fu.lead
                ? `${fu.lead.firstName ?? ""} ${fu.lead.lastName ?? ""}`.trim()
                : fu.customer
                ? `${fu.customer.firstName ?? ""} ${fu.customer.lastName ?? ""}`.trim()
                : "Prospective Buyer";
              const temp = fu.lead?.temperature;
              const tempStyle = temp ? TEMP_STYLES[temp] : null;
              const isDone = completedIds.has(fu.id);

              return (
                <div
                  key={fu.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isDone
                      ? "bg-slate-50 border-slate-200 opacity-60"
                      : "bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  {/* Left: Avatar + Details */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar name={name.split(" ")[0]} size={34} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold truncate ${
                            isDone ? "line-through text-slate-400" : "text-slate-900"
                          }`}
                        >
                          {name}
                        </span>
                        {tempStyle && (
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold border ${tempStyle.bg} ${tempStyle.text}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${tempStyle.dot}`} />
                            {tempStyle.label}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-medium text-slate-500 mt-0.5 truncate flex items-center gap-2">
                        <span>{fu.lead?.phone || fu.lead?.status || "Phone Call"}</span>
                        {fu.scheduledDate && (
                          <span className="text-slate-400 tabular-nums">
                            · {new Date(fu.scheduledDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Complete Check Action */}
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <button
                      onClick={() => handleComplete(fu.id)}
                      disabled={isDone}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                        isDone
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-500 hover:bg-emerald-600 hover:text-white"
                      }`}
                      title={isDone ? "Completed" : "Mark as Completed"}
                    >
                      <Check size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {viewAllHref && items && items.length > 0 && (
        <div className="pt-3 border-t border-slate-100 mt-3 text-right">
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1 text-xs font-bold text-[var(--brand-600)] hover:text-[var(--brand-700)] transition-colors"
          >
            <span>View All Follow-ups</span>
            <ChevronRight size={13} />
          </Link>
        </div>
      )}
    </div>
  );
}
