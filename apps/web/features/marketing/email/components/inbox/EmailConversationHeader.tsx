// ============================================================================
// BrokerOS — Email Conversation Header Component (Executive CRM Edition)
// ============================================================================

import React, { useState } from 'react';
import {
  UserCheck,
  ExternalLink,
  Mail,
  Phone,
  Server,
  Building2,
  PanelRightOpen,
  Copy,
  Check,
  Flame,
} from 'lucide-react';
import Link from 'next/link';
import { useLeadHref } from '@/lib/lead-navigation';
import type { EmailConversation } from '../../types/inbox';
import { ConversationStatusDropdown, ConversationStatus } from '../../../components/ConversationStatusDropdown';

interface EmailConversationHeaderProps {
  conversation: EmailConversation;
  onUpdateStatus: (status: ConversationStatus) => void;
  onAssignAgent: (agentUserId: string | null) => void;
  onToggleContactDrawer?: () => void;
  isDrawerOpen?: boolean;
}

export const EmailConversationHeader: React.FC<EmailConversationHeaderProps> = ({
  conversation,
  onUpdateStatus,
  onAssignAgent,
  onToggleContactDrawer,
  isDrawerOpen = false,
}) => {
  const getLeadHref = useLeadHref();
  const [copiedEmail, setCopiedEmail] = useState(false);

  const contactDisplayName =
    conversation.contactName ||
    (conversation.lead
      ? `${conversation.lead.firstName || ''} ${conversation.lead.lastName || ''}`.trim()
      : null) ||
    (conversation.broker ? conversation.broker.companyName || conversation.broker.contactPerson : null) ||
    (conversation.customer ? conversation.customer.name : null) ||
    conversation.contactEmail;

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (conversation.contactEmail) {
      navigator.clipboard.writeText(conversation.contactEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const leadTemp = (conversation.lead?.temperature || '').toUpperCase();

  return (
    <div className="flex items-center justify-between px-3.5 sm:px-5 py-3 bg-bg-surface border-b border-border-default shrink-0 shadow-2xs min-w-0">
      {/* Contact Profile & CRM Identity */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1 mr-2">
        {/* Monogram Avatar with Channel Accent */}
        <div
          onClick={onToggleContactDrawer}
          className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/10 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/30 shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-500/40 transition-all shadow-2xs"
          title="Click to view contact profile"
        >
          {contactDisplayName.replace(/[^\w]/g, '').slice(0, 2).toUpperCase() || 'EM'}
          <span
            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-bg-surface border border-border-default flex items-center justify-center text-[8px]"
            title="Email Channel"
          >
            ✉️
          </span>
        </div>

        <div className="min-w-0 flex-1">
          {/* Primary Name & Lead Context Pill */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <h3
              onClick={onToggleContactDrawer}
              className="font-bold text-text-primary text-sm sm:text-base tracking-tight cursor-pointer hover:text-blue-600 transition-colors truncate"
              title={contactDisplayName}
            >
              {contactDisplayName}
            </h3>

            {/* Refined CRM Lead Intelligence Chip */}
            {conversation.lead && (
              <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-800 dark:text-blue-300 border border-blue-500/30 shadow-2xs shrink-0">
                <span>Lead</span>
                <Link
                  href={getLeadHref(conversation.lead.id)}
                  className="text-blue-700 dark:text-blue-400 hover:text-blue-900 ml-0.5 transition-colors"
                  title="Open full CRM Lead page"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-2.5 h-2.5 opacity-70 hover:opacity-100" />
                </Link>
              </div>
            )}

            {conversation.broker && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/25 shadow-2xs shrink-0 truncate max-w-[120px]">
                Broker{conversation.broker.companyName ? ` • ${conversation.broker.companyName}` : ''}
              </span>
            )}
          </div>

          {/* Secondary Email & CRM Attribution Row */}
          <div className="flex items-center gap-2 text-xs text-text-tertiary mt-0.5 min-w-0">
            <button
              type="button"
              onClick={handleCopyEmail}
              className="inline-flex items-center gap-1 font-mono text-[11px] text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0 min-w-0"
              title="Click to copy email address"
            >
              <Mail className="w-3 h-3 text-blue-500 shrink-0" />
              <span className="truncate max-w-[160px] sm:max-w-[220px]">{conversation.contactEmail}</span>
              {copiedEmail ? (
                <Check className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
              ) : (
                <Copy className="w-2.5 h-2.5 opacity-40 hover:opacity-100 shrink-0" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Header Controls: Provider, Status Dropdown, Agent & Drawer Toggle */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Assigned Rep Indicator */}
        <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-bg-subtle rounded-xl border border-border-default text-xs text-text-secondary shadow-2xs">
          <UserCheck className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
          <span className="truncate max-w-[100px] font-medium">{conversation.agent?.name || 'Unassigned'}</span>
        </div>

        {/* Luxury Tactile Status Dropdown */}
        <div className="shrink-0">
          <ConversationStatusDropdown
            status={conversation.status}
            onChange={onUpdateStatus}
          />
        </div>

        {/* CRM Info Drawer Toggle Button */}
        {onToggleContactDrawer && (
          <button
            type="button"
            onClick={onToggleContactDrawer}
            className={`p-1.5 sm:p-2 rounded-xl border transition-colors shadow-2xs cursor-pointer shrink-0 ${
              isDrawerOpen
                ? 'bg-blue-500/15 border-blue-500/40 text-blue-700 dark:text-blue-400'
                : 'bg-bg-base border-border-default hover:bg-bg-subtle text-text-secondary hover:text-text-primary'
            }`}
            title={isDrawerOpen ? 'Close contact profile' : 'Open contact profile'}
            aria-label="Toggle contact details"
          >
            <PanelRightOpen className="w-4 h-4 text-current" />
          </button>
        )}
      </div>
    </div>
  );
};
