"use client";

import { useState } from "react";
import { Calendar, PhoneCall, AlertCircle, ArrowRight, Key, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(dateString));
}

export function CPActionTasks({ tasks }: { tasks: any[] }) {
  const [filter, setFilter] = useState<string>("ALL");

  if (!tasks || tasks.length === 0) {
    return (
      <div
        className="bg-white/95 backdrop-blur-md rounded-3xl p-8 border border-slate-200/90 flex flex-col items-center justify-center min-h-[240px] text-center"
        style={{
          boxShadow:
            "0 1px 0 rgba(255, 255, 255, 0.95) inset, 0 16px 36px -24px rgba(15, 23, 42, 0.12)",
        }}
      >
        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 border border-slate-100 shadow-2xs">
          <CheckCircle2 size={24} className="text-emerald-500" />
        </div>
        <h3 className="text-sm font-black text-slate-900 m-0">
          Broker Network Queue Clear!
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-1 max-w-sm m-0">
          No pending broker follow-ups, scheduled client visits, or pending handovers in your partner network.
        </p>
      </div>
    );
  }

  const filteredTasks =
    filter === "ALL" ? tasks : tasks.filter((t) => t.type === filter);

  const getIconData = (type: string) => {
    switch (type) {
      case "SITE_VISIT":
        return {
          icon: Calendar,
          color: "text-blue-600",
          bg: "bg-blue-50/90",
          border: "border-blue-200/60",
        };
      case "FOLLOW_UP":
        return {
          icon: PhoneCall,
          color: "text-amber-600",
          bg: "bg-amber-50/90",
          border: "border-amber-200/60",
        };
      case "HANDOVER":
        return {
          icon: Key,
          color: "text-emerald-600",
          bg: "bg-emerald-50/90",
          border: "border-emerald-200/60",
        };
      default:
        return {
          icon: AlertCircle,
          color: "text-slate-600",
          bg: "bg-slate-50/90",
          border: "border-slate-200/60",
        };
    }
  };

  const filterOptions = [
    { id: "ALL", label: `All (${tasks.length})` },
    {
      id: "SITE_VISIT",
      label: `Site Visits (${tasks.filter((t) => t.type === "SITE_VISIT").length})`,
    },
    {
      id: "FOLLOW_UP",
      label: `Follow-ups (${tasks.filter((t) => t.type === "FOLLOW_UP").length})`,
    },
    {
      id: "HANDOVER",
      label: `Handovers (${tasks.filter((t) => t.type === "HANDOVER").length})`,
    },
  ];

  return (
    <div
      className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-slate-200/90 transition-all duration-300 h-full"
      style={{
        boxShadow:
          "0 1px 0 rgba(255, 255, 255, 0.95) inset, 0 16px 36px -24px rgba(15, 23, 42, 0.12)",
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider m-0">
            Broker Network Action Feed
          </h2>
          <p className="text-[11px] font-medium text-slate-500 mt-0.5 m-0">
            Prioritized tasks requiring sourcing and closing manager intervention
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/70 overflow-x-auto">
          {filterOptions.map((opt) => {
            const isActive = filter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFilter(opt.id)}
                className={`relative px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="cpActionFilterTab"
                    className="absolute inset-0 bg-white rounded-xl shadow-xs border border-slate-200/80"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
        {filteredTasks.length === 0 ? (
          <div className="col-span-2 text-center py-10 text-xs font-semibold text-slate-400">
            No tasks found in this category.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const { icon: Icon, color, bg, border } = getIconData(task.type);
            const linkHref = task.leadId
              ? `/dashboard/channel-partner/customer-management/${task.leadId}`
              : task.brokerId
              ? `/dashboard/channel-partner/broker-management/${task.brokerId}`
              : "#";
            return (
              <div
                key={task.id}
                className="flex items-start justify-between p-3.5 rounded-2xl bg-slate-50/60 hover:bg-slate-50/90 border border-slate-200/70 hover:border-slate-300 transition-all duration-200 group shadow-2xs hover:shadow-xs"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl ${bg} ${border} border flex items-center justify-center shrink-0 ${color} shadow-2xs`}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-slate-900 truncate block group-hover:text-[var(--brand-700)] transition-colors">
                      {task.title}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block tabular-nums">
                      {formatDate(task.date)}
                    </span>
                    {task.metadata && task.metadata.project && (
                      <span className="text-[9px] text-[var(--brand-700)] font-black mt-1.5 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/60 inline-block uppercase tracking-wider">
                        {task.metadata.project}
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  href={linkHref}
                  className="p-2 rounded-xl bg-white border border-slate-200/80 text-slate-400 hover:text-[var(--brand-700)] hover:border-purple-200 hover:bg-purple-50 transition-all shrink-0 no-underline shadow-2xs"
                >
                  <ArrowRight size={13} />
                </Link>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
