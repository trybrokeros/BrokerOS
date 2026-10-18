// ============================================================================
// BrokerOS — Email Message Composer Bar
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Sparkles,
  Zap,
  FileText,
  Loader2,
  Server,
  X,
  CalendarClock,
  PenLine,
  ChevronDown,
} from 'lucide-react';
import { EmailQuickReplyModal } from './EmailQuickReplyModal';
import { EmailTemplatePickerModal } from './EmailTemplatePickerModal';
import { ScheduleMessageModal } from '../../../components/ScheduleMessageModal';
import { EmailQuickReplyItem, DEFAULT_EMAIL_QUICK_REPLIES } from '../../types/inbox';

interface EmailMessageComposerProps {
  onSendMessage: (payload: {
    text?: string;
    html?: string;
    subject?: string;
    attachments?: Array<{
      name: string;
      url: string;
      size?: number;
      contentType?: string;
    }>;
  }) => Promise<any>;
  onScheduleMessage?: (payload: {
    scheduledAt: string;
    text?: string;
    html?: string;
    subject?: string;
    attachments?: Array<{
      name: string;
      url: string;
      size?: number;
      contentType?: string;
    }>;
  }) => Promise<any>;
  onDraftWithAi: () => Promise<{ subject: string; textBody: string; htmlBody: string }>;
  assignedProvider?: string;
  assignedSenderEmail?: string | null;
  recipientName?: string;
  recipientEmail?: string;
  disabled?: boolean;
}

export const EmailMessageComposer: React.FC<EmailMessageComposerProps> = ({
  onSendMessage,
  onScheduleMessage,
  onDraftWithAi,
  assignedProvider = 'SYSTEM_DEFAULT',
  assignedSenderEmail,
  recipientName,
  recipientEmail,
  disabled = false,
}) => {
  const [text, setText] = useState('');
  const [subject, setSubject] = useState('');
  const [showSubjectInput, setShowSubjectInput] = useState(false);
  const [sending, setSending] = useState(false);
  const [aiDrafting, setAiDrafting] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isQuickReplyModalOpen, setIsQuickReplyModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [attachments, setAttachments] = useState<Array<{ name: string; url: string; size?: number }>>([]);

  // Slash command autocomplete state
  const [allQuickReplies, setAllQuickReplies] = useState<EmailQuickReplyItem[]>(DEFAULT_EMAIL_QUICK_REPLIES);
  const [slashQuery, setSlashQuery] = useState<string | null>(null);
  const [slashSelectedIndex, setSlashSelectedIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Quick replies for slash completion (synced with localStorage & default library)
  useEffect(() => {
    function loadQuickReplies() {
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('brokeros_email_quick_replies');
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
      setAllQuickReplies(DEFAULT_EMAIL_QUICK_REPLIES);
    }

    loadQuickReplies();
    if (typeof window !== 'undefined') {
      window.addEventListener('brokeros_email_quick_replies_changed', loadQuickReplies);
      return () => {
        window.removeEventListener('brokeros_email_quick_replies_changed', loadQuickReplies);
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

  const matchingQuickReplies = slashQuery !== null
    ? allQuickReplies.filter(
        (r) =>
          r.shortcut.toLowerCase().includes(`/${slashQuery}`) ||
          r.shortcut.toLowerCase().replace('/', '').includes(slashQuery) ||
          r.contentHtml.toLowerCase().includes(slashQuery),
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

  const handleSend = async () => {
    if (!text.trim() || sending || disabled) return;

    try {
      setSending(true);
      await onSendMessage({
        text: text.trim(),
        subject: subject.trim() || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      });
      setText('');
      setSubject('');
      setShowSubjectInput(false);
      setAttachments([]);
      setSlashQuery(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      console.error('Failed to send email reply:', err);
    } finally {
      setSending(false);
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
          insertQuickReply(selected.contentHtml);
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
    if (aiDrafting || disabled) return;
    try {
      setAiDrafting(true);
      const draft = await onDraftWithAi();
      if (draft?.textBody) {
        setText(draft.textBody);
        if (draft.subject) {
          setSubject(draft.subject);
          setShowSubjectInput(true);
        }
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }
    } catch (err) {
      console.error('AI draft generation failed:', err);
    } finally {
      setAiDrafting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    setAttachments((prev) => [
      ...prev,
      {
        name: file.name,
        url: fileUrl,
        size: file.size,
      },
    ]);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="p-3.5 bg-bg-surface border-t border-border-default space-y-2.5 shadow-2xs">
      {/* Thread Continuity Identity Banner & Subject Controller */}
      <div className="flex items-center justify-between gap-3 px-1 text-xs text-text-tertiary flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)] shrink-0" />
          <span className="truncate text-text-secondary text-[11px]">
            From: <strong className="text-text-primary font-medium">{assignedSenderEmail || 'sales@brokeros.com'}</strong>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/25 font-mono text-[9px] font-bold uppercase tracking-wider shrink-0">
            {assignedProvider.replace('_', ' ')}
          </span>
        </div>

        {/* Integrated Subject Toggle Pill */}
        <button
          type="button"
          onClick={() => setShowSubjectInput(!showSubjectInput)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all shadow-2xs cursor-pointer select-none active:scale-95 ${
            showSubjectInput || subject.trim()
              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
              : 'bg-bg-base hover:bg-bg-subtle text-text-secondary hover:text-text-primary border border-border-default'
          }`}
          title="Toggle custom email subject line"
        >
          <PenLine className="w-3.5 h-3.5 text-blue-500" />
          <span className="truncate max-w-[200px]">
            {subject.trim() ? `Subject: ${subject}` : 'Subject Line'}
          </span>
          <ChevronDown
            className={`w-3 h-3 opacity-60 transition-transform ${showSubjectInput ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Refined Collapsible Subject Input Bar */}
      {showSubjectInput && (
        <div className="flex items-center gap-2 p-1.5 bg-bg-base/70 border border-border-default rounded-xl shadow-2xs animate-in fade-in slide-in-from-top-1">
          <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase tracking-wider shrink-0">
            Subject
          </span>
          <input
            type="text"
            placeholder="e.g., Follow-up: Exclusive Property Details for Sneha..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="flex-1 bg-transparent px-2 py-1 text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden"
          />
          {subject && (
            <button
              type="button"
              onClick={() => setSubject('')}
              className="p-1 text-text-tertiary hover:text-text-primary rounded-lg text-xs cursor-pointer"
              title="Clear subject line"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowSubjectInput(false)}
            className="text-[10px] font-semibold text-text-tertiary hover:text-text-secondary px-2 py-0.5 rounded hover:bg-bg-subtle cursor-pointer transition-colors"
            title="Done editing subject line"
          >
            Done
          </button>
        </div>
      )}

      {/* Action Bar Above Input */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Quick Replies Button */}
          <button
            type="button"
            onClick={() => setIsQuickReplyModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary bg-bg-base hover:bg-bg-subtle border border-border-default transition-all shadow-2xs cursor-pointer active:scale-95"
            title="Insert canned response"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Replies</span>
          </button>

          {/* Template Picker Button */}
          <button
            type="button"
            onClick={() => setIsTemplateModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary bg-bg-base hover:bg-bg-subtle border border-border-default transition-all shadow-2xs cursor-pointer active:scale-95"
            title="Insert real-estate email template"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-500" />
            <span>Templates</span>
          </button>

          {/* Media Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary bg-bg-base hover:bg-bg-subtle border border-border-default transition-all shadow-2xs cursor-pointer active:scale-95"
            title="Attach brochure or document"
          >
            <Paperclip className="w-3.5 h-3.5 text-blue-500" />
            <span>Attach</span>
          </button>

          {/* Schedule Button */}
          <button
            type="button"
            onClick={() => setIsScheduleModalOpen(true)}
            disabled={!text.trim() || disabled}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary bg-bg-base hover:bg-bg-subtle border border-border-default transition-all shadow-2xs cursor-pointer disabled:opacity-40 active:scale-95"
            title="Schedule email for later..."
          >
            <CalendarClock className="w-3.5 h-3.5 text-blue-500" />
            <span>Schedule</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          />
        </div>

        {/* AI Draft Assistant Button */}
        <button
          type="button"
          onClick={handleAiDraft}
          disabled={aiDrafting || disabled}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-500/15 via-purple-500/10 to-purple-600/15 hover:from-purple-500/25 hover:to-purple-600/25 text-purple-700 dark:text-purple-300 border border-purple-500/30 transition-all shadow-2xs disabled:opacity-50 cursor-pointer active:scale-95"
        >
          {aiDrafting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          )}
          <span>{aiDrafting ? 'Drafting...' : 'Draft with AI'}</span>
        </button>
      </div>

      {/* Attachments Preview Pill List */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 px-1">
          {attachments.map((att, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-bg-base border border-border-default rounded-lg text-xs text-text-secondary"
            >
              <Paperclip className="w-3 h-3 text-text-tertiary" />
              <span className="truncate max-w-xs">{att.name}</span>
              <button
                type="button"
                onClick={() => removeAttachment(i)}
                className="text-text-tertiary hover:text-rose-500 ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Slash Command Autocomplete Popover */}
      {slashQuery !== null && matchingQuickReplies.length > 0 && (
        <div className="mb-2 p-1.5 bg-bg-surface border border-border-default rounded-xl shadow-xl max-h-48 overflow-y-auto space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-100">
          <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-text-tertiary uppercase flex items-center justify-between">
            <span>Quick Replies (/{slashQuery})</span>
            <span>↑↓ to navigate · ↵ to insert · Esc to dismiss</span>
          </div>
          {matchingQuickReplies.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => insertQuickReply(item.contentHtml)}
              onMouseEnter={() => setSlashSelectedIndex(idx)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                idx === slashSelectedIndex
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-text-primary hover:bg-bg-subtle'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-amber-500 font-bold shrink-0">{item.shortcut}</span>
                <span className="truncate text-text-secondary">{item.contentHtml}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Textarea Input + Send Button */}
      <div className="flex items-end gap-2 bg-bg-base border border-border-default rounded-2xl p-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-2xs">
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
              ? 'Select an email thread to reply...'
              : 'Write email reply... (Type / for quick replies, Enter to send)'
          }
          className="flex-1 bg-transparent resize-none border-none outline-hidden px-3 py-2 text-sm text-text-primary placeholder:text-text-muted max-h-40 leading-relaxed font-medium"
        />

        {/* Split Send / Schedule Button */}
        <div className="flex items-center shrink-0 shadow-xs rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim() || sending || disabled}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold disabled:opacity-40 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] cursor-pointer"
            title="Send Email Reply (Enter)"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setIsScheduleModalOpen(true)}
            disabled={!text.trim() || sending || disabled}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold border-l border-blue-500/40 disabled:opacity-40 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] cursor-pointer"
            title="Schedule email for later..."
          >
            <CalendarClock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modals */}
      <EmailQuickReplyModal
        isOpen={isQuickReplyModalOpen}
        onClose={() => setIsQuickReplyModalOpen(false)}
        onSelect={(content) => {
          setText((prev) => (prev ? `${prev} ${content}` : content));
          if (textareaRef.current) textareaRef.current.focus();
        }}
      />

      <EmailTemplatePickerModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={(content, tmplSubject) => {
          setText((prev) => (prev ? `${prev}\n\n${content}` : content));
          if (tmplSubject) {
            setSubject(tmplSubject);
            setShowSubjectInput(true);
          }
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
              html: payload.html,
              subject: payload.subject || subject || 'Real Estate Follow-up',
              attachments,
            });
            setText('');
            setSubject('');
            setAttachments([]);
          }
        }}
        initialText={text}
        initialSubject={subject}
        initialAttachments={attachments}
        channel="email"
        recipientName={recipientName}
        recipientTarget={recipientEmail || assignedSenderEmail || undefined}
      />
    </div>
  );
};
