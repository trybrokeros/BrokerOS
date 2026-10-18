// ============================================================================
// BrokerOS — SMS Conversation Header Component (Executive CRM Edition)
// ============================================================================

import React, { useState } from 'react';
import {
  Server,
  UserCheck,
  Building2,
  Phone,
  Mail,
  PanelRightOpen,
  ExternalLink,
  Copy,
  Check,
  Flame,
} from 'lucide-react';
import Link from 'next/link';
import { useLeadHref } from '@/lib/lead-navigation';
import type { SmsConversation } from '../../types/inbox';
import { SMS_PROVIDERS } from '@brokeros/constants';
import { ConversationStatusDropdown, ConversationStatus } from '../../../components/ConversationStatusDropdown';

interface SmsConversationHeaderProps {
  conversation: SmsConversation;
  onUpdateStatus: (status: ConversationStatus) => void;
  onAssignAgent?: (agentId: string | null) => void;
  onToggleContactDrawer?: () => void;
  isDrawerOpen?: boolean;
}

export const SmsConversationHeader: React.FC<SmsConversationHeaderProps> = ({
  conversation,
  onUpdateStatus,
  onAssignAgent,
  onToggleContactDrawer,
  isDrawerOpen = false,
}) => {
  const getLeadHref = useLeadHref();
  const [copiedPhone, setCopiedPhone] = useState(false);

  const provMeta =
    (SMS_PROVIDERS as Record<string, any>)[conversation.assignedProvider] || SMS_PROVIDERS.TWILIO;

  const contactDisplayName =
    conversation.contactName ||
    (conversation.lead
      ? `${conversation.lead.firstName || ''} ${conversation.lead.lastName || ''}`.trim()
      : null) ||
    (conversation.broker ? conversation.broker.companyName || conversation.broker.contactPerson : null) ||
    (conversation.customer ? conversation.customer.name : null) ||
    conversation.contactPhone;

  const handleCopyPhone = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (conversation.contactPhone) {
      navigator.clipboard.writeText(conversation.contactPhone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
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
          className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30 shrink-0 cursor-pointer hover:ring-2 hover:ring-amber-500/40 transition-all shadow-2xs"
          title="Click to view contact profile"
        >
          {contactDisplayName.replace(/[^\w]/g, '').slice(0, 2).toUpperCase() || 'SM'}
          <span
            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-bg-surface border border-border-default flex items-center justify-center text-[8px]"
            title="SMS Channel"
          >
            💬
          </span>
        </div>

        <div className="min-w-0 flex-1">
          {/* Primary Name & Lead Context Pill */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <h3
              onClick={onToggleContactDrawer}
              className="font-bold text-text-primary text-sm sm:text-base tracking-tight cursor-pointer hover:text-amber-600 transition-colors truncate"
              title={contactDisplayName}
            >
              {contactDisplayName}
            </h3>

            {/* Refined CRM Lead Intelligence Chip */}
            {conversation.lead && (
              <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30 shadow-2xs shrink-0">
                <span>Lead</span>
                <Link
                  href={getLeadHref(conversation.lead.id)}
                  className="text-amber-700 dark:text-amber-400 hover:text-amber-900 ml-0.5 transition-colors"
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

          {/* Secondary Telephony & CRM Attribution Row */}
          <div className="flex items-center gap-2 text-xs text-text-tertiary mt-0.5 min-w-0">
            <button
              type="button"
              onClick={handleCopyPhone}
              className="inline-flex items-center gap-1 font-mono text-[11px] text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0"
              title="Click to copy phone number"
            >
              <Phone className="w-3 h-3 text-amber-500 shrink-0" />
              <span>{conversation.contactPhone}</span>
              {copiedPhone ? (
                <Check className="w-2.5 h-2.5 text-emerald-500" />
              ) : (
                <Copy className="w-2.5 h-2.5 opacity-40 hover:opacity-100" />
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
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-400'
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
