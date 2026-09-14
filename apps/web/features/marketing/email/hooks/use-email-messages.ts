// ============================================================================
// BrokerOS — Email Messages Thread Hook
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import type { EmailMessage } from '../types/inbox';

export function useEmailMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<EmailMessage[]>([]);
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
        `${baseUrl}/api/marketing/email/inbox/conversations/${conversationId}/messages`,
        { credentials: 'include' },
      );
      if (!res.ok) throw new Error('Failed to load message thread');
      const data = await res.json();
      setMessages(data.items || []);
    } catch (err) {
      console.error('loadEmailMessages error:', err);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, conversationId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const sendMessage = async (payload: {
    text?: string;
    html?: string;
    subject?: string;
    attachments?: Array<{
      name: string;
      url: string;
      size?: number;
      contentType?: string;
    }>;
    templateId?: string;
  }) => {
    if (!conversationId) return null;

    try {
      setSending(true);
      const res = await fetch(
        `${baseUrl}/api/marketing/email/inbox/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to send email reply');
      }

      const created = await res.json();
      setMessages((prev) => [...prev, created]);
      return created;
    } catch (err) {
      console.error('sendEmailMessage error:', err);
      throw err;
    } finally {
      setSending(false);
    }
  };

  const draftReplyWithAi = async (
    agentName?: string,
    instruction?: string,
  ): Promise<{ subject: string; textBody: string; htmlBody: string }> => {
    if (!conversationId) return { subject: '', textBody: '', htmlBody: '' };

    try {
      setDraftingAi(true);
      const res = await fetch(
        `${baseUrl}/api/marketing/email/inbox/conversations/${conversationId}/ai-draft`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ agentName, instruction }),
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'AI drafting failed');
      }

      const data = await res.json();
      return data;
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
    reloadMessages: loadMessages,
  };
}
