// ============================================================================
// BrokerOS — WhatsApp Unified Inbox View
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { MessageSquare, AlertCircle } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { ConversationList } from './ConversationList';
import { ConversationHeader } from './ConversationHeader';
import { ConversationThread } from './ConversationThread';
import { MessageComposer } from './MessageComposer';
import { ContactDrawer } from './ContactDrawer';
import { TemplatePickerModal } from './TemplatePickerModal';
import { useWhatsAppConversations } from '../../hooks/use-whatsapp-conversations';
import { useWhatsAppMessages } from '../../hooks/use-whatsapp-messages';
import { useWhatsAppRealtime } from '../../hooks/use-whatsapp-realtime';
import type { WhatsAppConversation, WhatsAppTemplate } from '../../types';

interface WhatsAppInboxViewProps {
  initialAccountId?: string;
}

export const WhatsAppInboxView: React.FC<WhatsAppInboxViewProps> = ({
  initialAccountId,
}) => {
  const [activeConversation, setActiveConversation] = useState<WhatsAppConversation | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

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
    accountId,
    setAccountId,
    handleLiveConversationUpdate,
    updateStatus,
    assignAgent,
    markAsRead,
  } = useWhatsAppConversations(initialAccountId);

  // Active message thread
  const {
    messages,
    loading: messagesLoading,
    sendMessage,
    draftReplyWithAi,
    handleIncomingMessage,
    handleStatusUpdate,
  } = useWhatsAppMessages(activeConversation?.id || null);

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

    // If only 1 conversation exists (e.g. sumama khan) and none selected yet, auto-select it
    if (!activeConversation && conversations.length === 1) {
      setActiveConversation(conversations[0]);
      if (conversations[0].unreadCount > 0) {
        markAsRead(conversations[0].id);
      }
    }
  }, [deepLinkConvId, conversations, activeConversation, markAsRead]);

  // If deepLinkConvId is not in the loaded list, fetch it directly
  useEffect(() => {
    if (!deepLinkConvId || activeConversation?.id === deepLinkConvId) return;
    const exists = conversations.some((c) => c.id === deepLinkConvId);
    if (!exists) {
      fetch(`${baseUrl}/api/marketing/whatsapp/conversations/${deepLinkConvId}`)
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

  // Socket.IO Real-Time Gateway Connection
  useWhatsAppRealtime({
    accountId,
    activeConversationId: activeConversation?.id || null,
    onMessageReceived: (msg) => {
      handleIncomingMessage(msg);
    },
    onMessageSent: (msg) => {
      handleIncomingMessage(msg);
    },
    onMessageStatus: (statusData) => {
      handleStatusUpdate(statusData);
    },
    onConversationUpdated: (conv) => {
      handleLiveConversationUpdate(conv);
      if (activeConversation && activeConversation.id === conv.id) {
        setActiveConversation(conv);
      }
    },
  });

  const handleSelectConversation = (conv: WhatsAppConversation) => {
    setActiveConversation(conv);
    if (conv.unreadCount > 0) {
      markAsRead(conv.id);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-bg-surface border border-border-default rounded-2xl overflow-hidden shadow-sm">
      {/* 1. Left Panel: Conversations List */}
      <ConversationList
        conversations={conversations}
        activeConversationId={activeConversation?.id}
        onSelectConversation={handleSelectConversation}
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        loading={conversationsLoading}
        accountId={accountId}
      />

      {/* 2. Middle Panel: Conversation Thread & Message Composer */}
      <div className="flex flex-col flex-1 h-full min-w-0 bg-bg-base/30">
        {activeConversation ? (
          <>
            <ConversationHeader
              conversation={activeConversation}
              onUpdateStatus={(status) => updateStatus(activeConversation.id, status)}
              onAssignAgent={(agentId) => assignAgent(activeConversation.id, agentId)}
              onToggleContactDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
            />

            {(() => {
              // 1. Find the last inbound message from customer if available
              const lastInboundMsg = [...messages].reverse().find((m) => {
                const dir = (m.direction || '').toUpperCase();
                const sender = (m.senderType || '').toLowerCase();
                return dir === 'INBOUND' || sender === 'contact' || sender === 'customer';
              });

              // 2. Determine last activity timestamp from inbound message, latest message, or conversation lastMessageAt
              const latestMsg = messages[messages.length - 1];
              const lastActivityTimestamp =
                lastInboundMsg?.sentAt ||
                lastInboundMsg?.createdAt ||
                latestMsg?.sentAt ||
                latestMsg?.createdAt ||
                activeConversation.lastMessageAt;

              // Window is active if there is activity within 24 hours
              const is24HourWindowActive = lastActivityTimestamp
                ? Date.now() - new Date(lastActivityTimestamp).getTime() < 24 * 60 * 60 * 1000
                : false;

              return (
                <>
                  <ConversationThread
                    messages={messages}
                    loading={messagesLoading}
                  />

                  <MessageComposer
                    onSendMessage={sendMessage}
                    onDraftWithAi={() =>
                      draftReplyWithAi(
                        activeConversation.accountId,
                        session?.user?.name || undefined,
                      )
                    }
                    accountId={activeConversation.accountId}
                    is24HourWindowActive={is24HourWindowActive}
                  />
                </>
              );
            })()}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 text-center p-6 space-y-3">
            <div className="w-16 h-16 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="font-semibold text-text-primary text-base">
              Select a conversation to start chatting
            </h3>
            <p className="text-xs text-text-secondary max-w-sm">
              Connect with prospective buyers, review automated AI responses, and manage inquiries across all broker projects.
            </p>
          </div>
        )}
      </div>

      {/* 3. Right Panel: Contact Profile & CRM Lead Drawer */}
      <ContactDrawer
        conversation={activeConversation}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      {/* Template Picker Modal triggered from ConversationThread */}
      {activeConversation && (
        <TemplatePickerModal
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          onSelectTemplate={async (tmpl: WhatsAppTemplate, params: string[]) => {
            try {
              await sendMessage({
                type: 'template',
                templateName: tmpl.name,
                templateLanguage: tmpl.language,
                templateParams: params,
              });
            } catch (err) {
              console.error('Failed to send template message:', err);
            }
          }}
          accountId={activeConversation.accountId}
        />
      )}
    </div>
  );
};
