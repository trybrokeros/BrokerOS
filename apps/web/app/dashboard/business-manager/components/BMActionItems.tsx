"use client";

import {
  AlertTriangle,
  CreditCard,
  Clock,
  ChevronRight,
  CheckCircle2,
  Info,
} from "lucide-react";

type ActionSeverity = "CRITICAL" | "WARNING" | "INFO";
type ActionType = "PENDING_APPROVAL" | "OVERDUE_PAYMENT" | "HIGH_BACKLOG";

interface ActionItem {
  id: string;
  type: ActionType;
  title: string;
  description: string;
  severity: ActionSeverity;
  date: string;
  meta: Record<string, any>;
}

const severityConfig: Record<
  ActionSeverity,
  { icon: any; bg: string; iconColor: string; border: string; badge: string; badgeBg: string; badgeText: string }
> = {
  CRITICAL: {
    icon: AlertTriangle,
    bg: "bg-rose-50/70",
    iconColor: "text-rose-600",
    border: "border-rose-200/80",
    badge: "CRITICAL",
    badgeBg: "bg-rose-100/80",
    badgeText: "text-rose-700",
  },
  WARNING: {
    icon: Clock,
    bg: "bg-amber-50/70",
    iconColor: "text-amber-600",
    border: "border-amber-200/80",
    badge: "ACTION NEEDED",
    badgeBg: "bg-amber-100/80",
    badgeText: "text-amber-800",
  },
  INFO: {
    icon: Info,
    bg: "bg-sky-50/70",
    iconColor: "text-sky-600",
    border: "border-sky-200/80",
    badge: "INFO",
    badgeBg: "bg-sky-100/80",
    badgeText: "text-sky-800",
  },
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  if (isNaN(then)) return "";
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function BMActionItems({ actionItems }: { actionItems: ActionItem[] }) {
  if (!actionItems || actionItems.length === 0) return null;

  return (
    <div
      className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 transition-all duration-300"
      style={{
        boxShadow:
          "0 1px 0 rgba(255, 255, 255, 0.95) inset, 0 16px 36px -24px rgba(15, 23, 42, 0.12)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-50/90 border border-rose-200/60 flex items-center justify-center text-rose-700 shadow-2xs">
            <AlertTriangle size={16} />
          </div>
          <div>
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider m-0">
              Cross-Department Operational Triage
            </h2>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5 m-0">
              Escalated bottlenecks across Sales, CP, and Post-Sales operations
            </p>
          </div>
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200/70 tabular-nums">
          {actionItems.length} Urgent Items
        </span>
      </div>

      {/* Items list */}
      <div className="flex flex-col gap-2.5 max-h-[360px] overflow-y-auto pr-1">
        {actionItems.map((item) => {
          const cfg = severityConfig[item.severity] || severityConfig.INFO;
          const SevIcon = cfg.icon;

          return (
            <div
              key={item.id}
              className={`flex items-start justify-between p-3.5 rounded-2xl border ${cfg.bg} ${cfg.border} transition-all duration-200 hover:shadow-2xs`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-xl bg-white/90 border border-slate-200/70 flex items-center justify-center shrink-0 shadow-2xs ${cfg.iconColor}`}
                >
                  <SevIcon size={15} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {item.title}
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${cfg.badgeBg} ${cfg.badgeText}`}
                    >
                      {cfg.badge}
                    </span>
                  </div>
                  <p className="m-0 text-xs text-slate-600 font-medium truncate max-w-xl">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="text-[11px] font-semibold text-slate-400 tabular-nums shrink-0 ml-3 mt-0.5">
                {timeAgo(item.date)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
