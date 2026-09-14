// ============================================================================
// BrokerOS — WhatsApp Messages Thread Hook
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import type { WhatsAppMessage } from '../types';

export function useWhatsAppMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [draftingAi, setDraftingAi] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  const loadMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `${baseUrl}/api/marketing/whatsapp/messages/${conversationId}?limit=100`,
      );
      if (!res.ok) throw new Error('Failed to load message thread');
      const data = await res.json();
      setMessages(data.items || []);
    } catch (err) {
      console.error('loadMessages error:', err);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, conversationId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleIncomingMessage = useCallback((msg: WhatsAppMessage) => {
    if (msg.conversationId !== conversationId) return;

    setMessages((prev) => {
      // Avoid duplicate by ID or waMessageId
      if (prev.some((m) => m.id === msg.id || (m.waMessageId && m.waMessageId === msg.waMessageId))) {
        return prev;
      }
      return [...prev, msg];
    });
  }, [conversationId]);

  const handleStatusUpdate = useCallback(
    (data: { conversationId: string; messageId: string; status: string }) => {
      if (data.conversationId !== conversationId) return;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.messageId || m.waMessageId === data.messageId
            ? { ...m, status: data.status.toUpperCase() as any }
            : m,
        ),
      );
    },
    [conversationId],
  );

  const sendMessage = async (payload: {
    type?: 'text' | 'media' | 'template' | 'interactive';
    text?: string;
    mediaUrl?: string;
    mediaKind?: 'image' | 'video' | 'document' | 'audio';
    caption?: string;
    templateName?: string;
    templateLanguage?: string;
    templateParams?: string[];
    buttons?: any[];
  }) => {
    if (!conversationId) return null;

    try {
      setSending(true);
      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          type: payload.type || 'text',
          text: payload.text,
          mediaUrl: payload.mediaUrl,
          mediaKind: payload.mediaKind,
          caption: payload.caption,
          templateName: payload.templateName,
          templateLanguage: payload.templateLanguage,
          templateParams: payload.templateParams,
          buttons: payload.buttons,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to send message');
      }

      const created = await res.json();
      setMessages((prev) => [...prev, created]);
      return created;
    } catch (err) {
      console.error('sendMessage error:', err);
      throw err;
    } finally {
      setSending(false);
    }
  };

  const draftReplyWithAi = async (
    accountId: string,
    agentName?: string,
    instruction?: string,
  ): Promise<string> => {
    if (!conversationId) return '';

    try {
      setDraftingAi(true);
      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/ai/draft?accountId=${accountId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          agentName,
          instruction,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'AI drafting failed');
      }

      const data = await res.json();
      return data.draft || '';
    } catch (err) {
      console.error('draftReplyWithAi error:', err);
      throw err;
    } finally {
      setDraftingAi(false);
    }
  };

  return {
    messages,
    loading,
    sending,
    draftingAi,
    sendMessage,
    draftReplyWithAi,
    handleIncomingMessage,
    handleStatusUpdate,
    reload: loadMessages,
  };
}
