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
  CalendarClock,
} from 'lucide-react';
import { calculateSmsSegments, DEFAULT_SMS_QUICK_REPLIES } from '@brokeros/constants';
import { SmsQuickReplyModal } from './SmsQuickReplyModal';
import { SmsTemplatePickerModal } from './SmsTemplatePickerModal';
import { ScheduleMessageModal } from '../../../components/ScheduleMessageModal';
import type { SmsQuickReplyItem } from '../../types/inbox';
import { toast } from 'sonner';

interface SmsMessageComposerProps {
  onSendMessage: (payload: { text: string; mediaUrl?: string }) => Promise<any>;
  onScheduleMessage?: (payload: { scheduledAt: string; text?: string; mediaUrl?: string }) => Promise<any>;
  onDraftAi: () => Promise<{ text: string }>;
  assignedProvider?: string;
  assignedSenderPhone?: string | null;
  recipientName?: string;
  recipientPhone?: string;
  sending?: boolean;
  draftingAi?: boolean;
  disabled?: boolean;
}

export const SmsMessageComposer: React.FC<SmsMessageComposerProps> = ({
  onSendMessage,
  onScheduleMessage,
  onDraftAi,
  assignedProvider = 'TWILIO',
  assignedSenderPhone,
  recipientName,
  recipientPhone,
  sending = false,
  draftingAi = false,
  disabled = false,
}) => {
  const [text, setText] = useState('');
  const [isQuickReplyModalOpen, setIsQuickReplyModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
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
    <div className="p-3.5 bg-bg-surface border-t border-border-default space-y-2.5 shadow-2xs">
      {/* Thread Continuity Identity & Telemetry Banner */}
      <div className="flex items-center justify-between gap-3 px-1 text-xs text-text-tertiary flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)] shrink-0" />
          <span className="truncate text-text-secondary text-[11px]">
            From: <strong className="text-text-primary font-mono font-bold">{assignedSenderPhone || 'Provider Gateway'}</strong>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/25 font-mono text-[9px] font-bold uppercase tracking-wider shrink-0">
            {assignedProvider.replace('_', ' ')}
          </span>
        </div>

        {/* Real-time Character & Segment Counter Pill */}
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-text-tertiary bg-bg-base px-2.5 py-1 rounded-lg border border-border-default shadow-2xs shrink-0">
          <span className="font-extrabold text-text-primary">{charCount}</span>
          <span className="text-text-muted">chars</span>
          <span className="text-border-default">•</span>
          <span
            className={`font-black ${
              segments > 1
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {segments} {segments > 1 ? 'segments' : 'segment'}
          </span>
          <span className="text-border-default">•</span>
          <span
            className={`px-1 rounded text-[9px] font-bold ${
              isUnicode
                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                : 'bg-bg-subtle text-text-tertiary'
            }`}
            title={
              isUnicode
                ? 'Unicode character detected: 70 chars/segment limit applies'
                : 'Standard GSM 7-bit alphabet: 160 chars/segment limit'
            }
          >
            {isUnicode ? 'UCS-2 (Emoji/Accents)' : 'GSM-7'}
          </span>
          <span className="text-[9px] text-text-muted">({remainingInSegment} left)</span>
        </div>
      </div>

      {/* Action Bar Above Input */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Quick Replies Button */}
          <button
            type="button"
            onClick={() => setIsQuickReplyModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary bg-bg-base hover:bg-bg-subtle border border-border-default transition-all shadow-2xs cursor-pointer active:scale-95"
            title="Open Canned Quick Replies (or type / in message)"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Replies</span>
          </button>

          {/* Template Picker Button */}
          <button
            type="button"
            onClick={() => setIsTemplateModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary bg-bg-base hover:bg-bg-subtle border border-border-default transition-all shadow-2xs cursor-pointer active:scale-95"
            title="Insert Curated DLT Real-Estate SMS Template"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-500" />
            <span>Templates</span>
          </button>

          {/* Schedule Message Button */}
          <button
            type="button"
            onClick={() => setIsScheduleModalOpen(true)}
            disabled={disabled}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary bg-bg-base hover:bg-bg-subtle border border-border-default transition-all shadow-2xs cursor-pointer disabled:opacity-40 active:scale-95"
            title="Schedule SMS for future delivery"
          >
            <CalendarClock className="w-3.5 h-3.5 text-amber-500" />
            <span>Schedule</span>
          </button>

          {/* Media Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary bg-bg-base hover:bg-bg-subtle border border-border-default transition-all shadow-2xs cursor-pointer active:scale-95"
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
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-500/15 via-purple-500/10 to-purple-600/15 hover:from-purple-500/25 hover:to-purple-600/25 text-purple-700 dark:text-purple-300 border border-purple-500/30 transition-all shadow-2xs disabled:opacity-50 cursor-pointer active:scale-95"
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
      <div className="flex items-end gap-2 bg-bg-base border border-border-default rounded-2xl p-2 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all shadow-2xs">
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

        {/* Split Send / Schedule Button */}
        <div className="flex items-center shrink-0 shadow-xs rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim() || sending || disabled}
            className="p-2.5 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-black disabled:opacity-40 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] cursor-pointer"
            title="Send SMS Reply (Enter)"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => setIsScheduleModalOpen(true)}
            disabled={!text.trim() || sending || disabled}
            className="p-2.5 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-bold border-l border-amber-600/30 disabled:opacity-40 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] cursor-pointer"
            title="Schedule for later..."
          >
            <CalendarClock className="w-4 h-4" />
          </button>
        </div>
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

      <ScheduleMessageModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSchedule={async (payload) => {
          if (onScheduleMessage) {
            await onScheduleMessage({
              scheduledAt: payload.scheduledAt,
              text: payload.text || text,
              mediaUrl: attachedMedia?.url,
            });
            setText('');
            setAttachedMedia(null);
          }
        }}
        initialText={text}
        channel="sms"
        recipientName={recipientName}
        recipientTarget={recipientPhone || assignedSenderPhone || undefined}
      />
    </div>
  );
};
