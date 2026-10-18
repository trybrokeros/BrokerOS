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
import { ScheduledMessagesDock } from '../../../components/ScheduledMessagesDock';
import { ScheduleMessageModal } from '../../../components/ScheduleMessageModal';
import { useEmailConversations } from '../../hooks/use-email-conversations';
import { useEmailMessages } from '../../hooks/use-email-messages';
import type { EmailConversation, EmailMessage } from '../../types/inbox';

interface EmailInboxViewProps {
  initialAccountId?: string;
  department?: string;
  scope?: 'my' | 'team' | 'all';
  initialLeadId?: string;
  initialBrokerId?: string;
  initialCustomerId?: string;
  showManagerFilter?: boolean;
}

export const EmailInboxView: React.FC<EmailInboxViewProps> = ({
  initialAccountId,
  department,
  scope,
  initialLeadId,
  initialBrokerId,
  initialCustomerId,
  showManagerFilter = false,
}) => {
  const [activeConversation, setActiveConversation] = useState<EmailConversation | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [agents, setAgents] = useState<Array<{ id: string; name: string }>>([]);

  const { data: session } = authClient.useSession();
  const searchParams = useSearchParams();
  const deepLinkConvId = searchParams.get('conversationId') || searchParams.get('c');
  const queryLeadId = initialLeadId || searchParams.get('leadId') || undefined;
  const queryBrokerId = initialBrokerId || searchParams.get('brokerId') || undefined;
  const queryCustomerId = initialCustomerId || searchParams.get('customerId') || undefined;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  // Fetch team agents if manager filter is enabled
  useEffect(() => {
    if (showManagerFilter) {
      fetch(`${baseUrl}/api/dashboard/employees`, {
        credentials: 'include',
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) {
            setAgents(
              data.map((u: any) => ({
                id: u.id,
                name: u.name || u.displayUsername || u.username || 'Agent',
              })),
            );
          }
        })
        .catch(() => null);
    }
  }, [showManagerFilter, baseUrl]);

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
  } = useEmailConversations({
    department,
    scope,
    agentId: selectedAgentId || undefined,
    leadId: queryLeadId,
    brokerId: queryBrokerId,
    customerId: queryCustomerId,
  });

  // Active message thread
  const {
    messages,
    loading: messagesLoading,
    sendMessage,
    scheduleMessage,
    rescheduleMessage,
    editScheduledMessage,
    cancelScheduledMessage,
    sendScheduledMessageNow,
    draftReplyWithAi,
  } = useEmailMessages(activeConversation?.id || null);

  const [editingScheduledMessage, setEditingScheduledMessage] = useState<EmailMessage | null>(null);
  const scheduledMessages = messages.filter((m) => m.status === 'SCHEDULED');

  // Auto-select deep-linked conversation, lead, broker, customer, or first conversation if 1 exists
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

    if (queryLeadId) {
      const target = conversations.find((c) => c.leadId === queryLeadId);
      if (target) {
        if (activeConversation?.id !== target.id) {
          setActiveConversation(target);
          if (target.unreadCount > 0) markAsRead(target.id);
        }
        return;
      }
    }

    if (queryBrokerId) {
      const target = conversations.find((c) => c.brokerId === queryBrokerId);
      if (target) {
        if (activeConversation?.id !== target.id) {
          setActiveConversation(target);
          if (target.unreadCount > 0) markAsRead(target.id);
        }
        return;
      }
    }

    if (queryCustomerId) {
      const target = conversations.find((c) => c.customerId === queryCustomerId);
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
  }, [deepLinkConvId, queryLeadId, queryBrokerId, queryCustomerId, conversations, activeConversation, markAsRead]);

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
    <div className="relative flex h-[calc(100vh-8.5rem)] bg-bg-surface border border-border-default rounded-2xl overflow-hidden shadow-sm">
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
        showManagerFilter={showManagerFilter}
        selectedAgentId={selectedAgentId}
        onAgentChange={setSelectedAgentId}
        agents={agents}
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
              isDrawerOpen={isDrawerOpen}
            />

            <EmailConversationThread
              messages={messages}
              loading={messagesLoading}
              onSendNow={sendScheduledMessageNow}
              onEdit={(msg) => setEditingScheduledMessage(msg)}
              onCancel={cancelScheduledMessage}
            />

            <ScheduledMessagesDock
              messages={scheduledMessages}
              channel="email"
              onSendNow={sendScheduledMessageNow}
              onEdit={(msg) => setEditingScheduledMessage(msg)}
              onCancel={cancelScheduledMessage}
            />

            <EmailMessageComposer
              onSendMessage={sendMessage}
              onScheduleMessage={scheduleMessage}
              onDraftWithAi={() => draftReplyWithAi(session?.user?.name || undefined)}
              assignedProvider={activeConversation.assignedProvider}
              assignedSenderEmail={activeConversation.assignedSenderEmail}
              recipientName={
                activeConversation.contactName ||
                (activeConversation.lead ? `${activeConversation.lead.firstName || ''} ${activeConversation.lead.lastName || ''}`.trim() : undefined)
              }
              recipientEmail={activeConversation.contactEmail}
            />

            {editingScheduledMessage && (
              <ScheduleMessageModal
                isOpen={Boolean(editingScheduledMessage)}
                onClose={() => setEditingScheduledMessage(null)}
                isEditing={true}
                initialText={editingScheduledMessage.bodyText || ''}
                initialSubject={editingScheduledMessage.subject || ''}
                initialScheduledAt={editingScheduledMessage.scheduledAt || undefined}
                channel="email"
                recipientName={
                  activeConversation.contactName ||
                  (activeConversation.lead ? `${activeConversation.lead.firstName || ''} ${activeConversation.lead.lastName || ''}`.trim() : undefined)
                }
                recipientTarget={activeConversation.contactEmail}
                onSchedule={async (payload) => {
                  await editScheduledMessage(editingScheduledMessage.id, {
                    text: payload.text,
                    subject: payload.subject,
                    scheduledAt: payload.scheduledAt,
                  });
                  setEditingScheduledMessage(null);
                }}
              />
            )}
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
