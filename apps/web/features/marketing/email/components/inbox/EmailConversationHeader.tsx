// ============================================================================
// BrokerOS — Email Conversation Header Component
// ============================================================================

import React from 'react';
import {
  UserCheck,
  ExternalLink,
  ShieldCheck,
  Mail,
  Server,
} from 'lucide-react';
import Link from 'next/link';
import type { EmailConversation } from '../../types/inbox';

interface EmailConversationHeaderProps {
  conversation: EmailConversation;
  onUpdateStatus: (status: 'open' | 'pending' | 'closed') => void;
  onAssignAgent: (agentUserId: string | null) => void;
  onToggleContactDrawer?: () => void;
}

export const EmailConversationHeader: React.FC<EmailConversationHeaderProps> = ({
  conversation,
  onUpdateStatus,
  onAssignAgent,
  onToggleContactDrawer,
}) => {
  const contactDisplayName =
    conversation.contactName ||
    (conversation.lead
      ? `${conversation.lead.firstName || ''} ${conversation.lead.lastName || ''}`.trim()
      : null) ||
    conversation.contactEmail;

  return (
    <div className="flex items-center justify-between px-6 py-3.5 bg-bg-surface border-b border-border-default shrink-0">
      {/* Contact Profile & Quick Info */}
      <div className="flex items-center gap-3.5">
        <div
          onClick={onToggleContactDrawer}
          className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm cursor-pointer hover:opacity-80 transition-opacity border border-blue-500/20"
        >
          {contactDisplayName.slice(0, 2).toUpperCase()}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h3
              onClick={onToggleContactDrawer}
              className="font-semibold text-text-primary text-sm hover:text-blue-600 cursor-pointer transition-colors"
            >
              {contactDisplayName}
            </h3>

            {/* Linked CRM Lead Badge */}
            {conversation.lead && (
              <Link
                href={`/dashboard/leads/${conversation.lead.id}`}
                className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-400 hover:bg-blue-100 transition-colors"
                title="View linked BrokerOS Lead"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Lead</span>
                <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <span>{conversation.contactEmail}</span>
            {conversation.lead?.phone && (
              <>
                <span>•</span>
                <span>{conversation.lead.phone}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2.5">
        {/* Dedicated Thread Provider Badge */}
        <div
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-bg-subtle rounded-xl border border-border-default text-[11px] text-text-secondary"
          title={`Outbound replies routed via ${conversation.assignedProvider}`}
        >
          <Server className="w-3 h-3 text-blue-500" />
          <span className="font-semibold font-mono text-[10px] text-blue-600 dark:text-blue-400 uppercase">
            {conversation.assignedProvider.replace('_', ' ')}
          </span>
        </div>

        {/* Status Dropdown */}
        <div className="relative inline-flex items-center gap-2 px-2.5 py-1.5 bg-bg-base border border-border-default rounded-xl focus-within:border-brand-500">
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
