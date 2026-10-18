// ============================================================================
// BrokerOS — Email Contact Info Drawer
// ============================================================================

import React from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  Building,
  Tag,
  ExternalLink,
  Flame,
  ShieldCheck,
  Server,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { useLeadHref } from '@/lib/lead-navigation';
import type { EmailConversation } from '../../types/inbox';

interface EmailContactDrawerProps {
  conversation: EmailConversation | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EmailContactDrawer: React.FC<EmailContactDrawerProps> = ({
  conversation,
  isOpen,
  onClose,
}) => {
  const getLeadHref = useLeadHref();
  if (!isOpen || !conversation) return null;

  const lead = conversation.lead;
  const displayName =
    conversation.contactName ||
    (lead ? `${lead.firstName || ''} ${lead.lastName || ''}`.trim() : null) ||
    conversation.contactEmail;

  return (
    <>
      {/* Mobile/Tablet Backdrop Overlay (hidden on xl desktop where 3 columns sit side-by-side) */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 bg-black/20 backdrop-blur-2xs z-20 xl:hidden animate-in fade-in duration-200"
      />

      <div className="absolute inset-y-0 right-0 z-30 w-full sm:w-80 md:w-88 border-l border-border-default bg-bg-surface flex flex-col h-full shrink-0 shadow-2xl xl:relative xl:shadow-none xl:z-auto xl:w-72 2xl:w-80 animate-in slide-in-from-right-4 duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-default">
        <h3 className="font-semibold text-text-primary text-sm">Contact Profile</h3>
        <button
          onClick={onClose}
          className="p-1.5 text-text-tertiary hover:text-text-primary rounded-lg hover:bg-bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm">
        {/* Contact Avatar & Basic Info */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xl border-2 border-blue-500/20">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h4 className="font-bold text-text-primary text-base">{displayName}</h4>
            <p className="text-xs text-text-secondary">{conversation.contactEmail}</p>
          </div>
        </div>

        {/* CRM Lead Connection Card */}
        {lead ? (
          <div className="p-4 bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
                <ShieldCheck className="w-4 h-4" />
                <span>Connected Lead</span>
              </div>
              <Link
                href={getLeadHref(lead.id)}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
              >
                <span>View</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-text-tertiary block text-[10px] uppercase font-semibold">Status</span>
                <span className="font-semibold text-text-primary">{lead.status || 'NEW'}</span>
              </div>
              <div>
                <span className="text-text-tertiary block text-[10px] uppercase font-semibold">Temperature</span>
                <span className="font-semibold text-text-primary flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-500" />
                  {lead.temperature || 'COLD'}
                </span>
              </div>
              {lead.budget && (
                <div className="col-span-2">
                  <span className="text-text-tertiary block text-[10px] uppercase font-semibold">Budget</span>
                  <span className="font-semibold text-text-primary">
                    ₹{lead.budget.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-3.5 bg-bg-base border border-border-default rounded-xl text-center space-y-1">
            <p className="text-xs font-medium text-text-secondary">Not linked to a CRM Lead</p>
            <p className="text-[11px] text-text-tertiary">
              This conversation is with an external email recipient.
            </p>
          </div>
        )}

        {/* Contact Details List */}
        <div className="space-y-3">
          <h5 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
            Details
          </h5>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center gap-2.5 text-text-secondary">
              <Mail className="w-4 h-4 text-text-tertiary shrink-0" />
              <span className="truncate">{conversation.contactEmail}</span>
            </div>

            {lead?.phone && (
              <div className="flex items-center gap-2.5 text-text-secondary">
                <Phone className="w-4 h-4 text-text-tertiary shrink-0" />
                <span>{lead.phone}</span>
              </div>
            )}

            <div className="flex items-center gap-2.5 text-text-secondary">
              <Calendar className="w-4 h-4 text-text-tertiary shrink-0" />
              <span>
                Started{' '}
                {new Date(conversation.createdAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Dedicated Thread Routing Architecture */}
        <div className="space-y-3">
          <h5 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-blue-500" />
            <span>Delivery Pipeline</span>
          </h5>

          <div className="p-3 bg-bg-base border border-border-default rounded-xl space-y-2 text-xs">
            <div>
              <span className="text-text-tertiary text-[10px] uppercase font-semibold block">Routing Provider</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                {conversation.assignedProvider.replace('_', ' ')}
              </span>
            </div>
            <div>
              <span className="text-text-tertiary text-[10px] uppercase font-semibold block">Sender Address</span>
              <span className="font-medium text-text-primary truncate block">
                {conversation.assignedSenderEmail || 'sales@brokeros.com'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  );
};
