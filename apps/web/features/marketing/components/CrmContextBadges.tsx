// ============================================================================
// BrokerOS — Unified High-Contrast CRM Context Badges
// Borderless, ultra-readable typography, plain text project attribution
// ============================================================================

import React from 'react';
import { Flame, Clock } from 'lucide-react';

export interface CrmContextData {
  lastMessageText?: string | null;
  lead?: {
    id?: string;
    temperature?: string | null;
    score?: number | null;
    interestedProject?: { name: string } | null;
    [key: string]: any;
  } | null | any;
  broker?: {
    companyName?: string | null;
    contactPerson?: string | null;
    [key: string]: any;
  } | null | any;
  customer?: {
    name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    [key: string]: any;
  } | null | any;
  nextScheduledAt?: string | null;
}

interface CrmContextBadgesProps {
  data: CrmContextData;
  className?: string;
  showScheduled?: boolean;
}

export const CrmContextBadges: React.FC<CrmContextBadgesProps> = ({
  data,
  className = '',
  showScheduled = true,
}) => {
  const isUncontacted =
    !data.lastMessageText ||
    data.lastMessageText === 'No messages yet' ||
    data.lastMessageText === 'Conversation started';

  const formatScheduleChipDate = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return '';
    }
  };

  const temp = (data.lead?.temperature || '').toUpperCase();

  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
      {/* 1. New & Uncontacted Pill — Borderless with high-contrast text */}
      {isUncontacted && (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 dark:bg-emerald-500/25 text-emerald-950 text-[10px] font-black tracking-tight"
          title="Lead has not received or replied to outbound outreach yet"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)] animate-pulse" />
          <span>New • Uncontacted</span>
        </span>
      )}

      {/* 2. Temperature Pill — Borderless with highest text visibility */}
      {temp && (
        <span
          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] tracking-tight font-black ${temp === 'HOT'
            ? 'bg-rose-500/15 dark:bg-rose-500/25 text-rose-950 '
            : temp === 'WARM'
              ? 'bg-amber-500/18 dark:bg-amber-500/25 text-amber-950 '
              : 'bg-slate-500/12 dark:bg-slate-500/25 text-slate-900'
            }`}
          title={`Lead temperature: ${temp}`}
        >
          {temp === 'HOT' && <Flame className="w-2.5 h-2.5 text-rose-600 shrink-0" />}
          <span>{temp}</span>
        </span>
      )}

      {/* 3. Broker Network Tag — Borderless */}
      {data.broker && (
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-500/15 text-purple-950  text-[10px] font-extrabold"
          title={data.broker.companyName ? `Brokerage: ${data.broker.companyName}` : 'Channel Partner Broker'}
        >
          <span>Broker{data.broker.companyName ? ` • ${data.broker.companyName}` : ''}</span>
        </span>
      )}

      {/* 4. Customer Identity Tag — Borderless */}
      {data.customer && (
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-950 text-[10px] font-extrabold"
          title="Confirmed post-sales customer"
        >
          <span>Customer</span>
        </span>
      )}

      {/* 5. Scheduled Next Message Chip — Borderless */}
      {showScheduled && data.nextScheduledAt && (
        <span
          title={`Scheduled outbound message queued for ${formatScheduleChipDate(data.nextScheduledAt)}`}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-950 text-[9px] font-extrabold"
        >
          <Clock className="w-2.5 h-2.5 text-amber-600 animate-pulse shrink-0" />
          <span>Scheduled: {formatScheduleChipDate(data.nextScheduledAt)}</span>
        </span>
      )}

      {/* 6. Interested Project Name — PURE TEXT, NOT A BADGE */}
      {data.lead?.interestedProject?.name && (
        <span
          className="text-[11px] font-semibold text-text-secondary dark:text-text-primary/75 truncate max-w-[140px]"
          title={`Interested Project: ${data.lead.interestedProject.name}`}
        >
          • {data.lead.interestedProject.name}
        </span>
      )}
    </div>
  );
};
