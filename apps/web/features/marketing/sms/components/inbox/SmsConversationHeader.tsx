// ============================================================================
// BrokerOS — SMS Conversation Header Component
// ============================================================================

import React from 'react';
import {
  Server,
  ShieldCheck,
  ExternalLink,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';
import type { SmsConversation } from '../../types/inbox';
import { SMS_PROVIDERS } from '@brokeros/constants';

interface SmsConversationHeaderProps {
  conversation: SmsConversation;
  onUpdateStatus: (status: 'open' | 'pending' | 'closed') => void;
  onAssignAgent?: (agentId: string | null) => void;
}

export const SmsConversationHeader: React.FC<SmsConversationHeaderProps> = ({
  conversation,
  onUpdateStatus,
  onAssignAgent,
}) => {
  const provMeta =
    (SMS_PROVIDERS as Record<string, any>)[conversation.assignedProvider] || SMS_PROVIDERS.TWILIO;

  const contactDisplayName =
    conversation.contactName ||
    (conversation.lead
      ? `${conversation.lead.firstName || ''} ${conversation.lead.lastName || ''}`.trim()
      : null) ||
    conversation.contactPhone;

  return (
    <div className="flex items-center justify-between px-6 py-3.5 bg-bg-surface border-b border-border-default shrink-0">
      {/* Contact Profile & Quick Info */}
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm border border-amber-500/20 shrink-0">
          {contactDisplayName.replace(/[^\w]/g, '').slice(0, 2).toUpperCase() || 'SM'}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-text-primary text-sm">
              {contactDisplayName}
            </h3>

            {/* Linked CRM Lead Badge */}
            {conversation.lead && (
              <Link
                href={`/dashboard/leads/${conversation.lead.id}`}
                className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                title="View linked CRM Lead"
              >
                <ShieldCheck className="w-3 h-3 text-amber-600" />
                <span>Lead</span>
                <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <span className="font-mono text-text-secondary">{conversation.contactPhone}</span>
            {conversation.lead?.email && (
              <>
                <span>•</span>
                <span>{conversation.lead.email}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2.5">
        {/* Dedicated Thread Route Badge */}

        {/* Status Dropdown */}
        <div className="relative inline-flex items-center gap-2 px-2.5 py-1.5 bg-bg-base border border-border-default rounded-xl focus-within:border-amber-500">
          <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${conversation.status === 'open' ? 'bg-emerald-500' : conversation.status === 'pending' ? 'bg-amber-500' : 'bg-slate-400'}`} />
          <select
            aria-label="Conversation status"
            value={conversation.status}
            onChange={(e) => onUpdateStatus(e.target.value as 'open' | 'pending' | 'closed')}
            className="appearance-none bg-transparent pr-4 text-xs font-medium capitalize text-text-secondary focus:outline-hidden cursor-pointer"
          >
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
          </select>
          <span aria-hidden="true" className="pointer-events-none absolute right-2 text-[10px] text-text-tertiary">⌄</span>
        </div>

        {/* Assigned Agent Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-bg-subtle rounded-xl border border-border-default text-xs text-text-secondary">
          <UserCheck className="w-3.5 h-3.5 text-text-tertiary" />
          <span>{conversation.agent?.name || 'Unassigned'}</span>
        </div>
      </div>
    </div>
  );
};
