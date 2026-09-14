// ============================================================================
// BrokerOS — SMS Unified Live Team Inbox Master View
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { useSmsConversations } from '../../hooks/use-sms-conversations';
import { useSmsMessages } from '../../hooks/use-sms-messages';
import { SmsConversationList } from './SmsConversationList';
import { SmsConversationHeader } from './SmsConversationHeader';
import { SmsConversationThread } from './SmsConversationThread';
import { SmsMessageComposer } from './SmsMessageComposer';
import type { SmsConversation } from '../../types/inbox';

export const SmsInboxView: React.FC = () => {
  const [activeConversation, setActiveConversation] = useState<SmsConversation | null>(null);

  const { data: session } = authClient.useSession();
  const searchParams = useSearchParams();
  const deepLinkConvId = searchParams.get('conversationId') || searchParams.get('c');
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  const {
    conversations,
    loading: conversationsLoading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    handleLiveConversationUpdate,
    updateStatus,
    assignAgent,
    markAsRead,
  } = useSmsConversations();

  // Load messages for active conversation
  const {
    messages,
    loading: messagesLoading,
    sending,
    draftingAi,
    sendMessage,
    draftReplyWithAi,
  } = useSmsMessages(activeConversation?.id || null);

  // Auto-select deep-linked conversation or first conversation if available
  useEffect(() => {
    if (conversations.length === 0) return;

    if (deepLinkConvId) {
      const target = conversations.find((c) => c.id === deepLinkConvId);
      if (target) {
        if (activeConversation?.id !== target.id) {
          setActiveConversation(target);
          if (target.unreadCount > 0) markAsRead(target.id);
        }
        return;
      }
    }

    // Auto-select first conversation if none selected yet
    if (!activeConversation && conversations.length > 0) {
      setActiveConversation(conversations[0]);
      if (conversations[0].unreadCount > 0) {
        markAsRead(conversations[0].id);
      }
    }
  }, [deepLinkConvId, conversations, activeConversation, markAsRead]);

  // If deepLinkConvId is not in list, fetch directly
  useEffect(() => {
    if (!deepLinkConvId || activeConversation?.id === deepLinkConvId) return;
    const exists = conversations.some((c) => c.id === deepLinkConvId);
    if (!exists) {
      fetch(`${baseUrl}/api/marketing/sms/inbox/conversations/${deepLinkConvId}`, {
        credentials: 'include',
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setActiveConversation(data);
            handleLiveConversationUpdate(data);
          }
        })
        .catch(() => null);
    }
  }, [deepLinkConvId, conversations, activeConversation?.id, baseUrl, handleLiveConversationUpdate]);

  const handleSelectConversation = (conv: SmsConversation) => {
    setActiveConversation(conv);
    if (conv.unreadCount > 0) {
      markAsRead(conv.id);
    }
  };

  const handleStatusChange = (newStatus: 'open' | 'pending' | 'closed') => {
    if (!activeConversation) return;
    updateStatus(activeConversation.id, newStatus);
    setActiveConversation({
      ...activeConversation,
      status: newStatus,
    });
  };

  const handleAgentAssignment = (agentId: string | null) => {
    if (!activeConversation) return;
    assignAgent(activeConversation.id, agentId);
  };

  return (
    <div className="flex h-[calc(100vh-8.5rem)] bg-bg-surface border border-border-default rounded-2xl overflow-hidden shadow-sm">
      {/* 1. Left Panel: Conversations List */}
      <SmsConversationList
        conversations={conversations}
        activeConversationId={activeConversation?.id}
        onSelectConversation={handleSelectConversation}
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        loading={conversationsLoading}
      />

      {/* 2. Right Panel: Conversation Thread & Message Composer */}
      <div className="flex flex-col flex-1 h-full min-w-0 bg-bg-base/30">
        {activeConversation ? (
          <>
            <SmsConversationHeader
              conversation={activeConversation}
              onUpdateStatus={handleStatusChange}
              onAssignAgent={handleAgentAssignment}
            />

            <SmsConversationThread
              messages={messages}
              loading={messagesLoading}
            />

            <SmsMessageComposer
              onSendMessage={sendMessage}
              onDraftAi={() => draftReplyWithAi(session?.user?.name || undefined)}
              assignedProvider={activeConversation.assignedProvider}
              assignedSenderPhone={activeConversation.assignedSenderPhone}
              sending={sending}
              draftingAi={draftingAi}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 text-center p-6 space-y-3">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="font-semibold text-text-primary text-base">
              Select an SMS thread to view messages
            </h3>
            <p className="text-xs text-text-secondary max-w-sm">
              Connect with mobile prospects, review automated Groq AI responses, and manage 2-way text inquiries with carrier route continuity.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
