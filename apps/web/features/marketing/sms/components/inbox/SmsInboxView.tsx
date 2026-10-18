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
import { SmsContactDrawer } from './SmsContactDrawer';
import { ScheduledMessagesDock } from '../../../components/ScheduledMessagesDock';
import { ScheduleMessageModal } from '../../../components/ScheduleMessageModal';
import type { SmsConversation, SmsMessage } from '../../types/inbox';

interface SmsInboxViewProps {
  initialAccountId?: string;
  department?: string;
  scope?: 'my' | 'team' | 'all';
  initialLeadId?: string;
  initialBrokerId?: string;
  initialCustomerId?: string;
  showManagerFilter?: boolean;
}

export const SmsInboxView: React.FC<SmsInboxViewProps> = ({
  initialAccountId,
  department,
  scope,
  initialLeadId,
  initialBrokerId,
  initialCustomerId,
  showManagerFilter = false,
}) => {
  const [activeConversation, setActiveConversation] = useState<SmsConversation | null>(null);
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
  } = useSmsConversations({
    department,
    scope,
    agentId: selectedAgentId || undefined,
    leadId: queryLeadId,
    brokerId: queryBrokerId,
    customerId: queryCustomerId,
  });

  // Load messages for active conversation
  const {
    messages,
    loading: messagesLoading,
    sending,
    draftingAi,
    sendMessage,
    scheduleMessage,
    rescheduleMessage,
    editScheduledMessage,
    cancelScheduledMessage,
    sendScheduledMessageNow,
    draftReplyWithAi,
  } = useSmsMessages(activeConversation?.id || null);

  const [editingScheduledMessage, setEditingScheduledMessage] = useState<SmsMessage | null>(null);
  const scheduledMessages = messages.filter((m) => m.status === 'SCHEDULED');

  // Auto-select deep-linked conversation, lead, broker, customer, or first conversation if available
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
    <div className="relative flex h-[calc(100vh-8.5rem)] bg-bg-surface border border-border-default rounded-2xl overflow-hidden shadow-sm">
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
        showManagerFilter={showManagerFilter}
        selectedAgentId={selectedAgentId}
        onAgentChange={setSelectedAgentId}
        agents={agents}
      />

      {/* 2. Right Panel: Conversation Thread & Message Composer */}
      <div className="flex flex-col flex-1 h-full min-w-0 bg-bg-base/30">
        {activeConversation ? (
          <>
            <SmsConversationHeader
              conversation={activeConversation}
              onUpdateStatus={handleStatusChange}
              onAssignAgent={handleAgentAssignment}
              onToggleContactDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
              isDrawerOpen={isDrawerOpen}
            />

            <SmsConversationThread
              messages={messages}
              loading={messagesLoading}
              onSendNow={sendScheduledMessageNow}
              onEdit={(msg) => setEditingScheduledMessage(msg)}
              onCancel={cancelScheduledMessage}
            />

            <ScheduledMessagesDock
              messages={scheduledMessages}
              channel="sms"
              onSendNow={sendScheduledMessageNow}
              onEdit={(msg) => setEditingScheduledMessage(msg)}
              onCancel={cancelScheduledMessage}
            />

            <SmsMessageComposer
              onSendMessage={sendMessage}
              onScheduleMessage={scheduleMessage}
              onDraftAi={() => draftReplyWithAi(session?.user?.name || undefined)}
              assignedProvider={activeConversation.assignedProvider}
              assignedSenderPhone={activeConversation.assignedSenderPhone}
              recipientName={
                activeConversation.contactName ||
                (activeConversation.lead ? `${activeConversation.lead.firstName || ''} ${activeConversation.lead.lastName || ''}`.trim() : undefined)
              }
              recipientPhone={activeConversation.contactPhone}
              sending={sending}
              draftingAi={draftingAi}
            />

            {editingScheduledMessage && (
              <ScheduleMessageModal
                isOpen={Boolean(editingScheduledMessage)}
                onClose={() => setEditingScheduledMessage(null)}
                isEditing={true}
                initialText={editingScheduledMessage.bodyText}
                initialScheduledAt={editingScheduledMessage.scheduledAt || undefined}
                channel="sms"
                recipientName={
                  activeConversation.contactName ||
                  (activeConversation.lead ? `${activeConversation.lead.firstName || ''} ${activeConversation.lead.lastName || ''}`.trim() : undefined)
                }
                recipientTarget={activeConversation.contactPhone}
                onSchedule={async (payload) => {
                  await editScheduledMessage(editingScheduledMessage.id, {
                    text: payload.text,
                    scheduledAt: payload.scheduledAt,
                  });
                  setEditingScheduledMessage(null);
                }}
              />
            )}
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

      {/* 3. Contact Details Drawer */}
      <SmsContactDrawer
        conversation={activeConversation}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onLeadUpdated={(updatedLead) => {
          if (activeConversation) {
            setActiveConversation({
              ...activeConversation,
              lead: updatedLead,
            });
          }
        }}
      />
    </div>
  );
};
