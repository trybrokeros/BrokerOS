import React, { useState } from 'react';
import { Search, MessageSquare, Filter, Plus, Clock } from 'lucide-react';
import type { WhatsAppConversation } from '../../types';
import { StartNewChatModal } from './StartNewChatModal';
import { CrmContextBadges } from '../../../components/CrmContextBadges';

interface ConversationListProps {
  conversations: WhatsAppConversation[];
  activeConversationId?: string | null;
  onSelectConversation: (conv: WhatsAppConversation) => void;
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: 'all' | 'open' | 'pending' | 'closed';
  onStatusFilterChange: (val: 'all' | 'open' | 'pending' | 'closed') => void;
  loading?: boolean;
  accountId?: string;
  showManagerFilter?: boolean;
  selectedAgentId?: string;
  onAgentChange?: (agentId: string) => void;
  agents?: Array<{ id: string; name: string }>;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  loading = false,
  accountId,
  showManagerFilter = false,
  selectedAgentId = '',
  onAgentChange,
  agents = [],
}) => {
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

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

  const formatMessagePreview = (text?: string | null, maxChars = 38) => {
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
    <div className="flex flex-col h-full bg-bg-surface border-r border-border-default w-full md:w-72 lg:w-80 xl:w-72 2xl:w-80 shrink-0">
      {/* Search & Header */}
      <div className="p-3.5 border-b border-border-default space-y-2.5">
        {/* Manager Team Oversight Filter Dropdown */}
        {showManagerFilter && agents.length > 0 && onAgentChange && (
          <div className="flex items-center gap-2 bg-bg-base border border-border-default rounded-xl px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
            <select
              value={selectedAgentId}
              onChange={(e) => onAgentChange(e.target.value)}
              className="bg-transparent text-xs text-text-primary font-semibold w-full focus:outline-none cursor-pointer"
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
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-brand-500 transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsNewChatOpen(true)}
            className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors shrink-0"
            title="Start New Chat"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {(['all', 'open', 'pending', 'closed'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => onStatusFilterChange(filter)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors shrink-0 ${
                statusFilter === filter
                  ? 'bg-brand-600 text-white shadow-2xs'
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
          <div className="text-center py-12 text-xs text-text-tertiary">
            Loading conversations...
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-bg-subtle text-text-muted flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-text-primary font-semibold">No conversations found</p>
              <p className="text-[11px] text-text-secondary mt-0.5 max-w-xs mx-auto">
                Start a conversation with a CRM lead or contact to begin chatting.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsNewChatOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Start New Chat</span>
            </button>
          </div>
        ) : (
          conversations.map((conv) => {
            const isSelected = conv.id === activeConversationId;
            const contactDisplayName =
              conv.contact?.name || conv.contactName || conv.contactPhone;

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                className={`flex items-start gap-3 p-3.5 cursor-pointer transition-colors relative ${isSelected
                  ? 'bg-brand-50/50 dark:bg-brand-950/20 border-l-3 border-brand-600'
                  : 'hover:bg-bg-subtle'
                  }`}
              >
                {/* Contact Avatar */}
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {contactDisplayName.slice(0, 2).toUpperCase()}
                </div>

                {/* Conversation Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-semibold text-xs text-text-primary truncate">
                      {contactDisplayName}
                    </span>
                    <span className="text-[10px] text-text-tertiary shrink-0">
                      {formatLastMessageTime(conv.lastMessageAt || conv.updatedAt)}
                    </span>
                  </div>

                  {/* CRM Context Badges */}
                  <div className="mb-1">
                    <CrmContextBadges
                      data={{
                        lastMessageText: conv.lastMessageText,
                        lead: conv.lead || (conv.contact?.lead ? {
                          id: conv.contact.lead.id,
                          temperature: conv.contact.lead.temperature,
                          interestedProject: (conv.contact.lead as any).interestedProject,
                        } : undefined),
                        broker: conv.broker,
                        customer: conv.customer,
                        nextScheduledAt: conv.nextScheduledAt,
                      }}
                    />
                  </div>

                  <p className="text-xs text-text-secondary truncate leading-normal">
                    {formatMessagePreview(conv.lastMessageText, 42)}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-border-subtle/40">
                    {/* Status Beacon Indicator */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          conv.status === 'open'
                            ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]'
                            : conv.status === 'pending'
                              ? 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.7)]'
                              : 'bg-slate-400'
                        }`}
                      />
                      <span className="text-[10px] capitalize text-text-tertiary font-semibold tracking-tight">
                        {conv.status}
                      </span>
                    </div>

                    {/* Unread Pill */}
                    {conv.unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black shadow-xs">
                        {conv.unreadCount} new
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Start New Chat Modal */}
      <StartNewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onConversationStarted={(conv) => onSelectConversation(conv)}
        accountId={accountId}
      />
    </div>
  );
};
