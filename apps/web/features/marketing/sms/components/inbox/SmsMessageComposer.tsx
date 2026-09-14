// ============================================================================
// BrokerOS — SMS Message Composer Bar (with Telemetry, AI, & Modals)
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Zap,
  FileText,
  Loader2,
  Server,
  Lock,
  Paperclip,
  X,
} from 'lucide-react';
import { calculateSmsSegments, DEFAULT_SMS_QUICK_REPLIES } from '@brokeros/constants';
import { SmsQuickReplyModal } from './SmsQuickReplyModal';
import { SmsTemplatePickerModal } from './SmsTemplatePickerModal';
import type { SmsQuickReplyItem } from '../../types/inbox';
import { toast } from 'sonner';

interface SmsMessageComposerProps {
  onSendMessage: (payload: { text: string; mediaUrl?: string }) => Promise<any>;
  onDraftAi: () => Promise<{ text: string }>;
  assignedProvider?: string;
  assignedSenderPhone?: string | null;
  sending?: boolean;
  draftingAi?: boolean;
  disabled?: boolean;
}

export const SmsMessageComposer: React.FC<SmsMessageComposerProps> = ({
  onSendMessage,
  onDraftAi,
  assignedProvider = 'TWILIO',
  assignedSenderPhone,
  sending = false,
  draftingAi = false,
  disabled = false,
}) => {
  const [text, setText] = useState('');
  const [isQuickReplyModalOpen, setIsQuickReplyModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [attachedMedia, setAttachedMedia] = useState<{
    name: string;
    url: string;
    size?: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Slash command autocomplete state
  const [allQuickReplies, setAllQuickReplies] = useState<SmsQuickReplyItem[]>(
    DEFAULT_SMS_QUICK_REPLIES.map((r, i) => ({
      id: `default-${i + 1}`,
      shortcut: r.shortcut,
      title: r.title,
      text: r.text,
    })),
  );
  const [slashQuery, setSlashQuery] = useState<string | null>(null);
  const [slashSelectedIndex, setSlashSelectedIndex] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Load quick replies from localStorage or defaults
  useEffect(() => {
    function loadQuickReplies() {
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('brokeros_sms_quick_replies');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setAllQuickReplies(parsed);
              return;
            }
          }
        } catch {
          // fallback
        }
      }
      setAllQuickReplies(
        DEFAULT_SMS_QUICK_REPLIES.map((r, i) => ({
          id: `default-${i + 1}`,
          shortcut: r.shortcut,
          title: r.title,
          text: r.text,
        })),
      );
    }

    loadQuickReplies();
    if (typeof window !== 'undefined') {
      window.addEventListener('brokeros_sms_quick_replies_changed', loadQuickReplies);
      return () => {
        window.removeEventListener('brokeros_sms_quick_replies_changed', loadQuickReplies);
      };
    }
  }, []);

  // Check if text triggers slash autocomplete
  useEffect(() => {
    const match = text.match(/(^|\s)\/([a-zA-Z0-9_-]*)$/);
    if (match) {
      setSlashQuery(match[2].toLowerCase());
      setSlashSelectedIndex(0);
    } else {
      setSlashQuery(null);
    }
  }, [text]);

  const matchingQuickReplies =
    slashQuery !== null
      ? allQuickReplies.filter(
          (r) =>
            r.shortcut.toLowerCase().includes(`/${slashQuery}`) ||
            r.shortcut.toLowerCase().replace('/', '').includes(slashQuery) ||
            r.text.toLowerCase().includes(slashQuery),
        )
      : [];

  const insertQuickReply = (content: string) => {
    const updated = text.replace(/(^|\s)\/([a-zA-Z0-9_-]*)$/, `$1${content} `);
    setText(updated);
    setSlashQuery(null);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    setAttachedMedia({
      name: file.name,
      url: fileUrl,
      size: file.size,
    });
    toast.success(`Attached ${file.name}`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const { segments, isUnicode, charCount, remainingInSegment } = calculateSmsSegments(text);

  const handleSend = async () => {
    const trimmed = text.trim();
    if ((!trimmed && !attachedMedia) || sending || disabled) return;

    try {
      await onSendMessage({
        text: trimmed || (attachedMedia ? `[Media: ${attachedMedia.name}]` : ''),
        mediaUrl: attachedMedia?.url,
      });
      setText('');
      setAttachedMedia(null);
      setSlashQuery(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send SMS reply');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (slashQuery !== null && matchingQuickReplies.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSlashSelectedIndex((prev) => (prev + 1) % matchingQuickReplies.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSlashSelectedIndex((prev) => (prev - 1 + matchingQuickReplies.length) % matchingQuickReplies.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        const selected = matchingQuickReplies[slashSelectedIndex];
        if (selected) {
          insertQuickReply(selected.text);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setSlashQuery(null);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAiDraft = async () => {
    if (draftingAi || disabled) return;
    try {
      const draft = await onDraftAi();
      if (draft?.text) {
        setText(draft.text);
        toast.success('Groq AI generated draft response');
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate AI draft');
    }
  };

  return (
    <div className="p-3 bg-bg-surface border-t border-border-default space-y-2">
      {/* Thread Continuity Identity Banner */}
      <div className="flex items-center justify-between gap-2 px-1 text-[11px] text-text-tertiary">
        <div className="flex items-center gap-1.5 min-w-0">
          <Server className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="truncate">
            Sending from:{' '}
            <strong className="text-text-primary font-mono font-medium">
              {assignedSenderPhone || 'Provider Gateway'}
            </strong>{' '}
            via{' '}
            <span className="font-mono text-amber-600 dark:text-amber-400 font-bold uppercase">
              {assignedProvider.replace('_', ' ')}
            </span>
          </span>
        </div>

        {/* Real-time Character & Segment Counter Pill */}
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-text-tertiary bg-bg-base px-2 py-0.5 rounded-md border border-border-subtle shrink-0">
          <span className="font-bold text-text-primary">{charCount}</span>
          <span>chars</span>
          <span>•</span>
          <span className="font-bold text-amber-600 dark:text-amber-400">
            {segments} seg{segments > 1 ? 's' : ''}
          </span>
          <span className="text-[9px] opacity-75">
            ({remainingInSegment} left{isUnicode ? ' • UCS-2' : ' • GSM-7'})
          </span>
        </div>
      </div>

      {/* Action Bar Above Input */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Quick Replies Button */}
          <button
            type="button"
            onClick={() => setIsQuickReplyModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors"
            title="Open Canned Quick Replies (or type / in message)"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Replies</span>
          </button>

          {/* Template Picker Button */}
          <button
            type="button"
            onClick={() => setIsTemplateModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors"
            title="Insert Curated DLT Real-Estate SMS Template"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-500" />
            <span>Templates</span>
          </button>

          {/* Media Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors"
            title="Attach image, brochure, or document (MMS)"
          >
            <Paperclip className="w-3.5 h-3.5 text-blue-500" />
            <span>Attach</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,video/*,.pdf"
          />
        </div>

        {/* AI Draft Assistant Button */}
        <button
          type="button"
          onClick={handleAiDraft}
          disabled={draftingAi || disabled}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 transition-all shadow-2xs disabled:opacity-50"
        >
          {draftingAi ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          )}
          <span>{draftingAi ? 'Drafting...' : 'Draft with AI'}</span>
        </button>
      </div>

      {/* Slash Command Autocomplete Popover */}
      {slashQuery !== null && matchingQuickReplies.length > 0 && (
        <div className="p-1.5 bg-bg-surface border border-border-default rounded-xl shadow-xl max-h-48 overflow-y-auto space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-100">
          <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-text-tertiary uppercase flex items-center justify-between">
            <span>Quick Replies (/{slashQuery})</span>
            <span>↑↓ to navigate · ↵ to insert · Esc to dismiss</span>
          </div>
          {matchingQuickReplies.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => insertQuickReply(item.text)}
              onMouseEnter={() => setSlashSelectedIndex(idx)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                idx === slashSelectedIndex
                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium'
                  : 'text-text-primary hover:bg-bg-subtle'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-amber-600 dark:text-amber-400 font-bold shrink-0">
                  {item.shortcut}
                </span>
                <span className="truncate text-text-secondary">{item.text}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Attached Media Chip */}
      {attachedMedia && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-bg-base border border-border-default rounded-xl w-fit text-xs text-text-primary shadow-2xs animate-in fade-in">
          <Paperclip className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="font-medium truncate max-w-[220px]">{attachedMedia.name}</span>
          {attachedMedia.size && (
            <span className="text-[10px] text-text-tertiary">
              ({(attachedMedia.size / 1024).toFixed(0)} KB)
            </span>
          )}
          <button
            type="button"
            onClick={() => setAttachedMedia(null)}
            className="p-0.5 ml-1 rounded hover:bg-bg-subtle text-text-tertiary hover:text-text-primary transition-colors"
            title="Remove attachment"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Textarea Input + Send Button */}
      <div className="flex items-end gap-2 bg-bg-base border border-border-default rounded-2xl p-1.5 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500/20 transition-all">
        <textarea
          ref={textareaRef}
          rows={2}
          value={text}
          disabled={disabled || sending}
          onChange={(e) => {
            setText(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            disabled
              ? 'Select an SMS thread to reply...'
              : 'Write SMS reply... (Type / for quick replies, Enter to send)'
          }
          className="flex-1 bg-transparent resize-none border-none outline-hidden px-3 py-2 text-sm text-text-primary placeholder:text-text-muted max-h-40 leading-relaxed font-medium"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim() || sending || disabled}
          className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold disabled:opacity-40 transition-colors shrink-0 shadow-sm"
          title="Send SMS Reply (Enter)"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>

      {/* Modals */}
      <SmsQuickReplyModal
        isOpen={isQuickReplyModalOpen}
        onClose={() => setIsQuickReplyModalOpen(false)}
        onSelect={(content) => {
          setText((prev) => (prev ? `${prev} ${content}` : content));
          if (textareaRef.current) textareaRef.current.focus();
        }}
      />

      <SmsTemplatePickerModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={(content) => {
          setText((prev) => (prev ? `${prev}\n\n${content}` : content));
          if (textareaRef.current) textareaRef.current.focus();
        }}
      />
    </div>
  );
};
