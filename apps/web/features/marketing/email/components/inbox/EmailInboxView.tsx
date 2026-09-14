// ============================================================================
// BrokerOS — Email Unified Team Inbox View
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, AlertCircle } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { EmailConversationList } from './EmailConversationList';
import { EmailConversationHeader } from './EmailConversationHeader';
import { EmailConversationThread } from './EmailConversationThread';
import { EmailMessageComposer } from './EmailMessageComposer';
import { EmailContactDrawer } from './EmailContactDrawer';
import { useEmailConversations } from '../../hooks/use-email-conversations';
import { useEmailMessages } from '../../hooks/use-email-messages';
import type { EmailConversation } from '../../types/inbox';

export const EmailInboxView: React.FC = () => {
  const [activeConversation, setActiveConversation] = useState<EmailConversation | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data: session } = authClient.useSession();
  const searchParams = useSearchParams();
  const deepLinkConvId = searchParams.get('conversationId') || searchParams.get('c');
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  // Conversations query & state
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
  } = useEmailConversations();

  // Active message thread
  const {
    messages,
    loading: messagesLoading,
    sendMessage,
    draftReplyWithAi,
  } = useEmailMessages(activeConversation?.id || null);

  // Auto-select deep-linked conversation or first conversation if only 1 exists
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
      fetch(`${baseUrl}/api/marketing/email/inbox/conversations/${deepLinkConvId}`, {
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

  const handleSelectConversation = (conv: EmailConversation) => {
    setActiveConversation(conv);
    if (conv.unreadCount > 0) {
      markAsRead(conv.id);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8.5rem)] bg-bg-surface border border-border-default rounded-2xl overflow-hidden shadow-sm">
      {/* 1. Left Panel: Conversations List */}
      <EmailConversationList
        conversations={conversations}
        activeConversationId={activeConversation?.id}
        onSelectConversation={handleSelectConversation}
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        loading={conversationsLoading}
      />

      {/* 2. Middle Panel: Conversation Thread & Message Composer */}
      <div className="flex flex-col flex-1 h-full min-w-0 bg-bg-base/30">
        {activeConversation ? (
          <>
            <EmailConversationHeader
              conversation={activeConversation}
              onUpdateStatus={(status) => updateStatus(activeConversation.id, status)}
              onAssignAgent={(agentId) => assignAgent(activeConversation.id, agentId)}
              onToggleContactDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
            />

            <EmailConversationThread
              messages={messages}
              loading={messagesLoading}
            />

            <EmailMessageComposer
              onSendMessage={sendMessage}
              onDraftWithAi={() => draftReplyWithAi(session?.user?.name || undefined)}
              assignedProvider={activeConversation.assignedProvider}
              assignedSenderEmail={activeConversation.assignedSenderEmail}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 text-center p-6 space-y-3">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Mail className="w-8 h-8" />
            </div>
            <h3 className="font-semibold text-text-primary text-base">
              Select an email thread to view messages
            </h3>
            <p className="text-xs text-text-secondary max-w-sm">
              Connect with prospective buyers, review automated AI responses, and manage 2-way email inquiries across all broker projects.
            </p>
          </div>
        )}
      </div>

      {/* 3. Right Panel: Contact Profile & CRM Lead Drawer */}
      <EmailContactDrawer
        conversation={activeConversation}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};
