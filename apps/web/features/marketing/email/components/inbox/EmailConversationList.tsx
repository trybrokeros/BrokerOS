// ============================================================================
// BrokerOS — Email Conversation List Component
// ============================================================================

import React, { useState } from 'react';
import { Search, Mail, Plus, Filter, Clock } from 'lucide-react';
import type { EmailConversation } from '../../types/inbox';
import { StartNewEmailModal } from './StartNewEmailModal';

interface EmailConversationListProps {
  conversations: EmailConversation[];
  activeConversationId?: string | null;
  onSelectConversation: (conv: EmailConversation) => void;
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: 'all' | 'open' | 'pending' | 'closed';
  onStatusFilterChange: (val: 'all' | 'open' | 'pending' | 'closed') => void;
  loading?: boolean;
  showManagerFilter?: boolean;
  selectedAgentId?: string;
  onAgentChange?: (agentId: string) => void;
  agents?: Array<{ id: string; name: string }>;
}

export const EmailConversationList: React.FC<EmailConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  loading = false,
  showManagerFilter = false,
  selectedAgentId = '',
  onAgentChange,
  agents = [],
}) => {
  const [isNewEmailOpen, setIsNewEmailOpen] = useState(false);

  const formatLastMessageTime = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

      return isToday
        ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const formatMessagePreview = (text?: string | null, maxChars = 40) => {
    if (!text) return 'No messages yet';
    const clean = text.replace(/\s+/g, ' ').trim();
    if (!clean) return 'No messages yet';
    return clean.length > maxChars ? `${clean.slice(0, maxChars)}...` : clean;
  };

  const formatScheduleChipDate = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-surface border-r border-border-default w-full md:w-80 lg:w-96 shrink-0">
      {/* Search & New Email Header */}
      <div className="p-3.5 border-b border-border-default space-y-2.5">
        {/* Manager Team Oversight Filter Dropdown */}
        {showManagerFilter && agents.length > 0 && onAgentChange && (
          <div className="flex items-center gap-2 bg-bg-base border border-border-default rounded-xl px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
            <select
              value={selectedAgentId}
              onChange={(e) => onAgentChange(e.target.value)}
              className="bg-transparent text-xs text-text-primary font-semibold w-full focus:outline-hidden cursor-pointer"
            >
              <option value="">All Team Leads & Reps</option>
              {agents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  Filter: {ag.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search email threads..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-brand-500 transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsNewEmailOpen(true)}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors shrink-0"
            title="Start New Email Thread"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills: strictly all | open | pending | closed */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {(['all', 'open', 'pending', 'closed'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => onStatusFilterChange(filter)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors shrink-0 ${
                statusFilter === filter
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-bg-subtle text-text-secondary hover:bg-bg-muted hover:text-text-primary'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations Scroll Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-border-subtle">
        {loading ? (
          <div className="text-center py-12 text-xs text-text-tertiary">Loading email conversations...</div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-bg-subtle text-text-muted flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-text-primary font-semibold">No email threads found</p>
              <p className="text-[11px] text-text-secondary mt-0.5 max-w-xs mx-auto">
                Inbound replies from marketing campaigns or manual emails will appear here.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsNewEmailOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Start New Email</span>
            </button>
          </div>
        ) : (
          conversations.map((conv) => {
            const isSelected = conv.id === activeConversationId;
            const contactDisplayName =
              conv.contactName ||
              (conv.lead ? `${conv.lead.firstName || ''} ${conv.lead.lastName || ''}`.trim() : null) ||
              (conv.broker ? conv.broker.companyName || conv.broker.contactPerson : null) ||
              (conv.customer ? conv.customer.name : null) ||
              conv.contactEmail;

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                className={`flex items-start gap-3 p-3.5 cursor-pointer transition-colors relative ${
                  isSelected
                    ? 'bg-blue-50/60 dark:bg-blue-950/20 border-l-3 border-blue-600'
                    : 'hover:bg-bg-subtle'
                }`}
              >
                {/* Contact Avatar */}
                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-blue-500/20">
                  {contactDisplayName.slice(0, 2).toUpperCase()}
                </div>

                {/* Conversation Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="font-semibold text-xs text-text-primary truncate">
                      {contactDisplayName}
                    </span>
                    <span className="text-[10px] text-text-tertiary shrink-0">
                      {formatLastMessageTime(conv.lastMessageAt || conv.updatedAt)}
                    </span>
                  </div>

                  {/* CRM Context Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    {(!conv.lastMessageText || conv.lastMessageText === 'Conversation started' || conv.lastMessageText === 'No messages yet') && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[10px] font-medium tracking-tight">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                        New • Uncontacted
                      </span>
                    )}
                    {conv.lead && (
                      <>
                        {conv.lead.temperature && (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-medium tracking-tight ${
                              conv.lead.temperature === 'HOT'
                                ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20'
                                : conv.lead.temperature === 'WARM'
                                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                                  : 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20'
                            }`}
                          >
                            {conv.lead.temperature}
                          </span>
                        )}
                      </>
                    )}
                    {conv.broker && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20 text-[10px] font-medium tracking-tight">
                        Broker {conv.broker.companyName ? `• ${conv.broker.companyName}` : ''}
                      </span>
                    )}
                    {conv.customer && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 text-[10px] font-medium tracking-tight">
                        Customer
                      </span>
                    )}
                    {conv.nextScheduledAt && (
                      <span
                        title={`Scheduled email queued for ${formatScheduleChipDate(conv.nextScheduledAt)}`}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 text-[10px] font-medium tracking-tight"
                      >
                        <Clock className="w-2.5 h-2.5 animate-pulse" />
                        <span>Scheduled: {formatScheduleChipDate(conv.nextScheduledAt)}</span>
                      </span>
                    )}
                  </div>

                  {/* Subject Line snippet */}
                  <p className="text-[11px] font-medium text-text-primary truncate mb-0.5">
                    {conv.subject || 'No Subject'}
                  </p>

                  {/* Message body preview snippet */}
                  <p className="text-xs text-text-secondary truncate leading-normal">
                    {formatMessagePreview(conv.lastMessageText, 40)}
                  </p>

                  <div className="flex items-center justify-between mt-1.5">
                    {/* Status Dot */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          conv.status === 'open'
                            ? 'bg-emerald-500'
                            : conv.status === 'pending'
                              ? 'bg-amber-500'
                              : 'bg-zinc-400'
                        }`}
                      />
                      <span className="text-[10px] capitalize text-text-tertiary font-medium">
                        {conv.status}
                      </span>
                    </div>

                    {/* Unread Pill */}
                    {conv.unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Start New Email Modal */}
      <StartNewEmailModal
        isOpen={isNewEmailOpen}
        onClose={() => setIsNewEmailOpen(false)}
        onConversationStarted={(conv: EmailConversation) => onSelectConversation(conv)}
      />
    </div>
  );
};
