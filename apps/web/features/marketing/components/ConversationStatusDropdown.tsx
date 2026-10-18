// ============================================================================
// BrokerOS — Luxury Tactile Conversation Status Dropdown
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export type ConversationStatus = 'open' | 'pending' | 'closed';

interface ConversationStatusDropdownProps {
  status: ConversationStatus;
  onChange: (status: ConversationStatus) => void;
  disabled?: boolean;
  className?: string;
}

const STATUS_CONFIG: Record<
  ConversationStatus,
  {
    label: string;
    description: string;
    dotClass: string;
    glowClass: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
  }
> = {
  open: {
    label: 'Open',
    description: 'Active thread requiring attention',
    dotClass: 'bg-emerald-500',
    glowClass: 'shadow-[0_0_8px_rgba(16,185,129,0.6)] ring-2 ring-emerald-500/20',
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    badgeBorder: 'border-emerald-500/30',
  },
  pending: {
    label: 'Pending',
    description: 'Waiting for client or external action',
    dotClass: 'bg-amber-500',
    glowClass: 'shadow-[0_0_8px_rgba(245,158,11,0.6)] ring-2 ring-amber-500/20',
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/15',
    badgeText: 'text-amber-700 dark:text-amber-300',
    badgeBorder: 'border-amber-500/30',
  },
  closed: {
    label: 'Closed',
    description: 'Resolved or archived conversation',
    dotClass: 'bg-slate-400 dark:bg-slate-500',
    glowClass: 'shadow-none ring-1 ring-slate-400/20',
    badgeBg: 'bg-slate-500/10 dark:bg-slate-500/15',
    badgeText: 'text-slate-600 dark:text-slate-400',
    badgeBorder: 'border-slate-500/20',
  },
};

export const ConversationStatusDropdown: React.FC<ConversationStatusDropdownProps> = ({
  status,
  onChange,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeConfig = STATUS_CONFIG[status] || STATUS_CONFIG.open;

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleSelect = (newStatus: ConversationStatus) => {
    if (newStatus !== status) {
      onChange(newStatus);
    }
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Change conversation status. Current status: ${activeConfig.label}`}
        className={`group inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all duration-150 cursor-pointer select-none text-xs font-semibold ${
          activeConfig.badgeBg
        } ${activeConfig.badgeText} ${activeConfig.badgeBorder} shadow-2xs hover:brightness-105 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span
          className={`w-2 h-2 rounded-full transition-transform ${activeConfig.dotClass} ${activeConfig.glowClass}`}
          aria-hidden="true"
        />
        <span className="tracking-tight">{activeConfig.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Luxury Popover Dropdown */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className="absolute right-0 mt-1.5 w-48 rounded-xl bg-bg-surface border border-border-default shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100 backdrop-blur-md space-y-0.5"
        >
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
            Conversation State
          </div>

          {(['open', 'pending', 'closed'] as const).map((opt) => {
            const conf = STATUS_CONFIG[opt];
            const isSelected = opt === status;

            return (
              <button
                key={opt}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left ${
                  isSelected
                    ? 'bg-bg-subtle text-text-primary font-semibold'
                    : 'text-text-secondary hover:bg-bg-subtle/80 hover:text-text-primary'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${conf.dotClass} ${
                      isSelected ? conf.glowClass : ''
                    }`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold">{conf.label}</div>
                  </div>
                </div>

                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-text-primary shrink-0 ml-2" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
