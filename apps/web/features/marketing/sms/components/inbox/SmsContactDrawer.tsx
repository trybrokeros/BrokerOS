// ============================================================================
// BrokerOS — SMS Contact Info Drawer (CRM Lead Context & Live Updates)
// ============================================================================

import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  Building,
  ExternalLink,
  Flame,
  Zap,
  Snowflake,
  ShieldCheck,
  Server,
  Calendar,
  Lock,
  Tag,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useLeadHref } from '@/lib/lead-navigation';
import type { SmsConversation } from '../../types/inbox';
import { SMS_PROVIDERS } from '@brokeros/constants';

interface SmsContactDrawerProps {
  conversation: SmsConversation | null;
  isOpen?: boolean;
  onClose: () => void;
  onLeadUpdated?: (updatedLead: any) => void;
}

export const SmsContactDrawer: React.FC<SmsContactDrawerProps> = ({
  conversation,
  isOpen = true,
  onClose,
  onLeadUpdated,
}) => {
  const getLeadHref = useLeadHref();
  const [updatingTemp, setUpdatingTemp] = useState(false);

  if (!isOpen || !conversation) return null;

  const lead = conversation.lead;
  const displayName =
    conversation.contactName ||
    (lead ? `${lead.firstName || ''} ${lead.lastName || ''}`.trim() : null) ||
    conversation.contactPhone;

  const currentTemp = (lead?.temperature || '').toUpperCase();
  const provMeta =
    (SMS_PROVIDERS as Record<string, any>)[conversation.assignedProvider] || SMS_PROVIDERS.TWILIO;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  const handleUpdateTemperature = async (temp: 'HOT' | 'WARM' | 'COLD') => {
    if (!lead?.id || updatingTemp) return;

    try {
      setUpdatingTemp(true);
      const res = await fetch(`${baseUrl}/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ temperature: temp }),
      });

      if (!res.ok) {
        throw new Error('Failed to update lead temperature');
      }

      toast.success(`Lead marked as ${temp}`);
      if (lead) {
        lead.temperature = temp;
      }
      onLeadUpdated?.({ ...lead, temperature: temp });
    } catch (err: any) {
      toast.error(err.message || 'Could not update temperature');
    } finally {
      setUpdatingTemp(false);
    }
  };

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
          title="Close drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
        {/* Contact Avatar & Basic Info */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xl border-2 border-amber-500/20">
            {displayName.replace(/[^\w]/g, '').slice(0, 2).toUpperCase() || <Phone className="w-6 h-6" />}
          </div>
          <div>
            <h4 className="font-bold text-text-primary text-base">{displayName}</h4>
            <p className="text-xs font-mono font-medium text-text-secondary">{conversation.contactPhone}</p>
          </div>
        </div>

        {/* CRM Lead Connection Card */}
        {lead ? (
          <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Connected Lead</span>
              </div>
              <Link
                href={getLeadHref(lead.id)}
                className="text-xs text-amber-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>View CRM</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {/* Lead Temperature Selector */}
            <div>
              <span className="text-text-tertiary block text-[10px] uppercase font-bold tracking-wider mb-1.5">
                Lead Temperature
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleUpdateTemperature('HOT')}
                  disabled={updatingTemp}
                  className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${
                    currentTemp === 'HOT'
                      ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                      : 'bg-bg-surface border-border-default text-text-secondary hover:bg-rose-500/10 hover:text-rose-600'
                  }`}
                  title="Mark as Hot Lead (Immediate follow-up)"
                >
                  <Flame className="w-3 h-3" />
                  <span>HOT</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateTemperature('WARM')}
                  disabled={updatingTemp}
                  className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${
                    currentTemp === 'WARM'
                      ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                      : 'bg-bg-surface border-border-default text-text-secondary hover:bg-amber-500/10 hover:text-amber-600'
                  }`}
                  title="Mark as Warm Lead (Engaged & Interested)"
                >
                  <Zap className="w-3 h-3" />
                  <span>WARM</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateTemperature('COLD')}
                  disabled={updatingTemp}
                  className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${
                    currentTemp === 'COLD'
                      ? 'bg-sky-500 text-white border-sky-600 shadow-xs'
                      : 'bg-bg-surface border-border-default text-text-secondary hover:bg-sky-500/10 hover:text-sky-600'
                  }`}
                  title="Mark as Cold Lead (Nurturing / Low response)"
                >
                  <Snowflake className="w-3 h-3" />
                  <span>COLD</span>
                </button>
              </div>
            </div>

            {/* Pipeline Data */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-border-subtle">
              <div>
                <span className="text-text-tertiary block text-[10px] uppercase font-semibold">CRM Status</span>
                <span className="font-semibold text-text-primary">{lead.status || 'NEW'}</span>
              </div>
              {lead.score !== undefined && lead.score !== null && (
                <div>
                  <span className="text-text-tertiary block text-[10px] uppercase font-semibold">Lead Score</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{lead.score}/100</span>
                </div>
              )}
              {lead.budget && (
                <div className="col-span-2">
                  <span className="text-text-tertiary block text-[10px] uppercase font-semibold">Budget</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    ₹{Number(lead.budget).toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              {lead.interestedProject && (
                <div className="col-span-2">
                  <span className="text-text-tertiary block text-[10px] uppercase font-semibold">Interested Project</span>
                  <span className="font-semibold text-text-primary flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-text-tertiary" />
                    <span>{lead.interestedProject.name}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-bg-base border border-border-default rounded-xl text-center space-y-1">
            <p className="text-xs font-semibold text-text-secondary">Not linked to a CRM Lead</p>
            <p className="text-[11px] text-text-tertiary">
              This conversation is with an external mobile contact.
            </p>
          </div>
        )}

        {/* Contact Details List */}
        <div className="space-y-2.5">
          <h5 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
            Contact Details
          </h5>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2.5 text-text-secondary">
              <Phone className="w-4 h-4 text-text-tertiary shrink-0" />
              <span className="font-mono">{conversation.contactPhone}</span>
            </div>

            {lead?.email && (
              <div className="flex items-center gap-2.5 text-text-secondary">
                <Mail className="w-4 h-4 text-text-tertiary shrink-0" />
                <span className="truncate">{lead.email}</span>
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

        {/* Broadcast Campaign Source */}
        {conversation.campaign && (
          <div className="space-y-2">
            <h5 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
              Broadcast Source
            </h5>
            <div className="p-3 bg-bg-base border border-border-default rounded-xl space-y-1">
              <div className="text-[10px] uppercase font-bold text-amber-600">SMS Campaign</div>
              <p className="text-xs font-semibold text-text-primary truncate">{conversation.campaign.title}</p>
            </div>
          </div>
        )}

        {/* Carrier Delivery Route Architecture */}
        <div className="space-y-2.5">
          <h5 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-amber-500" />
            <span>Delivery Pipeline</span>
          </h5>

          <div className="p-3 bg-bg-base border border-border-default rounded-xl space-y-2 text-xs">
            <div>
              <span className="text-text-tertiary text-[10px] uppercase font-semibold block">Carrier Gateway</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: provMeta.color }}
                />
                <span className="font-bold text-text-primary">{provMeta.name}</span>
              </div>
            </div>
            <div>
              <span className="text-text-tertiary text-[10px] uppercase font-semibold block">Sender Identity</span>
              <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                {conversation.assignedSenderPhone || 'Provider Default'}
              </span>
            </div>
            <div className="text-[10px] text-text-tertiary flex items-center gap-1 pt-1 border-t border-border-subtle">
              <Lock className="w-2.5 h-2.5 text-emerald-500" />
              <span>Thread locked: Replies return through this exact route</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  );
};
