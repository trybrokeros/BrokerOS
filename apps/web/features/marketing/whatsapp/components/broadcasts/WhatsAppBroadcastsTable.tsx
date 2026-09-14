// ============================================================================
// BrokerOS — WhatsApp Broadcasts Table & Campaign Analytics
// ============================================================================

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Send,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  Users,
  DollarSign,
  Layers,
  Sparkles,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import {
  calculateWhatsAppBroadcastCost,
  USD_TO_INR_EXCHANGE_RATE,
  WA_CONVERSATION_PRICING,
  type WhatsAppConversationCategory,
} from '@brokeros/constants';
import type { WhatsAppBroadcast } from '../../types';

interface WhatsAppBroadcastsTableProps {
  accountId?: string;
}

type StatusFilterKey =
  | 'ALL'
  | 'COMPLETED'
  | 'SENDING'
  | 'SCHEDULED'
  | 'DRAFT'
  | 'FAILED';

export const WhatsAppBroadcastsTable: React.FC<WhatsAppBroadcastsTableProps> = ({
  accountId,
}) => {
  const router = useRouter();
  const [broadcasts, setBroadcasts] = useState<WhatsAppBroadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterKey>('ALL');

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    async function fetchBroadcasts() {
      try {
        setLoading(true);
        const query = new URLSearchParams();
        if (accountId) query.set('accountId', accountId);

        const res = await fetch(`${baseUrl}/api/marketing/whatsapp/broadcasts?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setBroadcasts(data.items || []);
        }
      } catch (err) {
        console.error('Error fetching broadcasts:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchBroadcasts();
  }, [baseUrl, accountId]);

  // Counts by status
  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilterKey, number> = {
      ALL: broadcasts.length,
      COMPLETED: 0,
      SENDING: 0,
      SCHEDULED: 0,
      DRAFT: 0,
      FAILED: 0,
    };

    broadcasts.forEach((b) => {
      const st = (b.status || 'DRAFT').toUpperCase() as StatusFilterKey;
      if (counts[st] !== undefined) {
        counts[st]++;
      }
    });

    return counts;
  }, [broadcasts]);

  const renderStatusBadge = (status: WhatsAppBroadcast['status']) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50/80 text-emerald-700 border border-emerald-200/80">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case 'SENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50/80 text-blue-700 border border-blue-200/80 animate-pulse">
            <Clock className="w-3 h-3" />
            <span>Sending</span>
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50/80 text-amber-700 border border-amber-200/80">
            <Clock className="w-3 h-3" />
            <span>Scheduled</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50/80 text-rose-700 border border-rose-200/80">
            <AlertCircle className="w-3 h-3" />
            <span>Failed</span>
          </span>
        );
      case 'DRAFT':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-50 text-slate-700 border border-slate-200/80">
            <span>Draft</span>
          </span>
        );
    }
  };

  const filtered = useMemo(() => {
    return broadcasts.filter((b) => {
      const matchesSearch =
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.templateName.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' ? true : (b.status || '').toUpperCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [broadcasts, search, statusFilter]);

  const STATUS_PILLS: Array<{ key: StatusFilterKey; label: string }> = [
    { key: 'ALL', label: 'All Broadcasts' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'SENDING', label: 'Sending' },
    { key: 'SCHEDULED', label: 'Scheduled' },
    { key: 'DRAFT', label: 'Draft' },
    { key: 'FAILED', label: 'Failed' },
  ];

  return (
    <div className="space-y-4">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-bg-surface p-4 rounded-2xl border border-border-default shadow-2xs">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {STATUS_PILLS.map((pill) => {
            const count = statusCounts[pill.key] || 0;
            const active = statusFilter === pill.key;
            return (
              <button
                key={pill.key}
                type="button"
                onClick={() => setStatusFilter(pill.key)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 select-none',
                  active
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-bg-subtle text-text-secondary hover:text-text-primary hover:bg-bg-muted',
                )}
              >
                <span>{pill.label}</span>
                <span
                  className={cn(
                    'px-1.5 py-0.2 rounded-md text-[10px] font-extrabold',
                    active ? 'bg-white/20 text-white' : 'bg-border-default text-text-muted',
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & New Campaign CTA */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search campaigns or templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <Link
            href="/dashboard/marketing/whatsapp/broadcasts/new"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Broadcast</span>
          </Link>
        </div>
      </div>

      {/* Broadcasts Data Table */}
      <div className="bg-bg-surface border border-border-default rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-subtle/80 text-text-secondary font-bold uppercase tracking-wider text-[10px] border-b border-border-default">
              <tr>
                <th className="px-5 py-3">Campaign Details</th>
                <th className="px-5 py-3">Template & Category</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Audience Reach</th>
                <th className="px-5 py-3 text-right">Meta Cost (INR / USD)</th>
                <th className="px-5 py-3">Delivery Funnel</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-text-tertiary">
                    Loading broadcast campaigns...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-text-tertiary space-y-2">
                    <p className="font-semibold text-text-secondary">No broadcast campaigns found</p>
                    <p className="text-xs text-text-muted">
                      {statusFilter !== 'ALL'
                        ? `No campaigns with status "${statusFilter}". Try selecting "All Broadcasts".`
                        : 'Launch your first high-converting Meta WhatsApp broadcast.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((b) => {
                  const cost = calculateWhatsAppBroadcastCost(
                    b.totalRecipients || 0,
                    'MARKETING'
                  );

                  return (
                    <tr
                      key={b.id}
                      onClick={() => router.push(`/dashboard/marketing/whatsapp/broadcasts/${b.id}`)}
                      className="hover:bg-bg-subtle/60 transition-colors cursor-pointer group"
                    >
                      {/* Campaign Name */}
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-text-primary text-xs group-hover:text-emerald-600 transition-colors">
                          {b.name}
                        </div>
                        <div className="text-[10px] text-text-muted mt-0.5">
                          Created {new Date(b.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </td>

                      {/* Template & Category */}
                      <td className="px-5 py-3.5">
                        <div className="font-mono text-xs font-semibold text-text-primary truncate max-w-[160px]">
                          {b.templateName}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className="px-1.5 py-0.2 rounded text-[9px] font-extrabold"
                            style={{
                              backgroundColor: `${cost.categoryColor}15`,
                              color: cost.categoryColor,
                            }}
                          >
                            Marketing
                          </span>
                          <span className="text-[10px] text-text-muted">
                            ({b.templateLanguage || 'en'})
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">{renderStatusBadge(b.status)}</td>

                      {/* Audience */}
                      <td className="px-5 py-3.5 text-right font-extrabold text-text-primary tabular-nums">
                        {b.totalRecipients.toLocaleString()}
                        <div className="text-[10px] font-normal text-text-muted">contacts</div>
                      </td>

                      {/* Cost */}
                      <td className="px-5 py-3.5 text-right tabular-nums">
                        <div className="font-extrabold text-amber-800">
                          ₹{cost.totalCostINR.toFixed(0)}
                        </div>
                        <div className="text-[10px] text-emerald-700 font-semibold">
                          ${cost.totalCostUSD.toFixed(2)} USD
                        </div>
                      </td>

                      {/* Funnel */}
                      <td className="px-5 py-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold">
                            <span className="text-emerald-600">{b.sentCount} sent</span>
                            <span className="text-text-muted">•</span>
                            <span className="text-sky-600">{b.deliveredCount} del</span>
                            <span className="text-text-muted">•</span>
                            <span className="text-purple-600">{b.readCount} read</span>
                          </div>

                          {/* Progress bar */}
                          {b.totalRecipients > 0 && (
                            <div className="w-28 bg-bg-muted rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.round((b.sentCount / b.totalRecipients) * 100),
                                  )}%`,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-3.5 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 group-hover:text-emerald-700">
                          <span>Analytics</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
