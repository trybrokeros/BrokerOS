'use client';

import React from 'react';
import Link from 'next/link';
import { MessageSquare, ArrowRight } from 'lucide-react';

interface RecentChat {
  id: string;
  contactName: string;
  contactPhone: string;
  status: string;
  lastMessageText: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

interface WhatsAppRecentChatsTableProps {
  recentConversations: RecentChat[];
}

const formatMessagePreview = (text?: string | null, maxChars = 40): string => {
  if (!text) return 'No messages yet';
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return 'No messages yet';
  return clean.length > maxChars ? `${clean.slice(0, maxChars)}...` : clean;
};

export const WhatsAppRecentChatsTable: React.FC<WhatsAppRecentChatsTableProps> = ({
  recentConversations = [],
}) => {
  return (
    <div className="p-6 bg-bg-surface border border-border-default rounded-2xl shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-500" />
          <h3 className="font-semibold text-text-primary text-sm">Recent Active Chats</h3>
        </div>
        <Link
          href="/dashboard/marketing/whatsapp/inbox"
          className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium group"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {recentConversations.length === 0 ? (
        <div className="text-center py-8 text-xs text-text-tertiary border border-dashed border-border-default rounded-xl">
          No active conversations yet. Messages sent or received will appear here.
        </div>
      ) : (
        <div className="divide-y divide-border-default/60">
          {recentConversations.map((c) => (
            <Link
              key={c.id}
              href="/dashboard/marketing/whatsapp/inbox"
              className="py-3 flex items-center justify-between hover:bg-bg-subtle/50 px-2 rounded-xl transition-colors group"
            >
              <div className="min-w-0 flex-1 pr-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-text-primary truncate">
                    {c.contactName}
                  </span>
                  <span className="text-[10px] text-text-muted font-mono">{c.contactPhone}</span>
                </div>
                <p className="text-xs text-text-secondary truncate mt-0.5" title={c.lastMessageText || ''}>
                  {formatMessagePreview(c.lastMessageText, 40)}
                </p>
              </div>
              <div className="text-right shrink-0">
                {c.unreadCount > 0 ? (
                  <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[10px] font-bold">
                    {c.unreadCount}
                  </span>
                ) : (
                  <span className="text-[10px] text-text-muted">
                    {c.lastMessageAt
                      ? new Date(c.lastMessageAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : ''}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
