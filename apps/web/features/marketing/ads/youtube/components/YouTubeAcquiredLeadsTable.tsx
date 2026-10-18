'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ExternalLink,
  Search,
  User,
  Clock,
  Video,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLeadHref } from '@/lib/lead-navigation';
import type { YouTubeAcquiredLead } from '../types';

interface YouTubeAcquiredLeadsTableProps {
  leads: YouTubeAcquiredLead[];
  currency?: string;
}

export function YouTubeAcquiredLeadsTable({
  leads,
  currency = 'INR',
}: YouTubeAcquiredLeadsTableProps) {
  const getLeadHref = useLeadHref();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = leads.filter((item) => {
    const l = item.lead;
    if (!l) return false;
    const term = searchTerm.toLowerCase();
    return (
      l.name.toLowerCase().includes(term) ||
      l.phone.toLowerCase().includes(term) ||
      (l.email && l.email.toLowerCase().includes(term)) ||
      (l.city && l.city.toLowerCase().includes(term))
    );
  });

  const formatCurrency = (val: number) => {
    if (currency === 'INR' || currency === '₹') {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
      return `₹${Math.round(val).toLocaleString('en-IN')}`;
    }
    return `$${Math.round(val).toLocaleString('en-US')}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-50 text-blue-700 border-blue-200/80';
      case 'CONTACTED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
      case 'INTERESTED':
      case 'QUALIFIED':
        return 'bg-purple-50 text-purple-700 border-purple-200/80';
      case 'SITE_VISIT_SCHEDULED':
      case 'SITE_VISIT_DONE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'BOOKED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'LOST':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getTemperatureBadge = (temp: string) => {
    switch (temp) {
      case 'HOT':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      case 'WARM':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'COLD':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200/80';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Table Header / Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-[var(--text-primary)]">
              YouTube Video Inbound Leads
            </h4>
            <span className="text-[10px] text-[var(--text-tertiary)]">
              {leads.length} total lead(s) acquired via Video Form CTA
            </span>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200/80 bg-slate-50/50 text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-[var(--brand-500)]/20 focus:border-[var(--brand-500)] transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[var(--text-primary)]">
          <thead className="bg-slate-50/80 text-[var(--text-tertiary)] font-bold uppercase tracking-wider border-b border-slate-100 text-[10px]">
            <tr>
              <th className="py-3 px-4">Lead Contact</th>
              <th className="py-3 px-4">City / Location</th>
              <th className="py-3 px-4 text-right">Budget</th>
              <th className="py-3 px-4">Pipeline Status</th>
              <th className="py-3 px-4">Temperature</th>
              <th className="py-3 px-4">Assigned Agent</th>
              <th className="py-3 px-4">Captured Time</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-[var(--text-tertiary)]">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Users className="w-8 h-8 text-slate-300" />
                    <span className="text-xs font-bold text-slate-700">
                      No Leads Acquired Yet
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Leads submitted from your YouTube Video CTA will sync automatically.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const l = item.lead;
                return (
                  <tr key={item.logId} className="hover:bg-slate-50/50 transition-colors">
                    {/* Name & Phone/Email */}
                    <td className="py-3 px-4">
                      <div>
                        <Link
                          href={getLeadHref(l.id)}
                          className="font-extrabold text-slate-900 hover:text-[var(--brand-600)] transition-colors flex items-center gap-1"
                        >
                          {l.name}
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[var(--text-secondary)]">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <a href={`tel:${l.phone}`} className="hover:underline">
                              {l.phone}
                            </a>
                          </span>
                          {l.email && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 truncate max-w-[140px]">
                                <Mail className="w-3 h-3 text-slate-400" />
                                {l.email}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* City */}
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {l.city ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {l.city}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Budget */}
                    <td className="py-3 px-4 text-right font-black text-slate-900">
                      {l.budget ? formatCurrency(l.budget) : '—'}
                    </td>

                    {/* Pipeline Status */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${getStatusBadge(l.status)}`}>
                        {l.status}
                      </span>
                    </td>

                    {/* Temperature */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${getTemperatureBadge(l.temperature)}`}>
                        {l.temperature}
                      </span>
                    </td>

                    {/* Assigned Agent */}
                    <td className="py-3 px-4">
                      {l.assignedUser ? (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {l.assignedUser.name}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Captured Date */}
                    <td className="py-3 px-4 text-[11px] text-[var(--text-tertiary)] font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(item.capturedAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-center">
                      <Link href={getLeadHref(l.id)}>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] font-bold rounded-lg text-slate-600 hover:text-slate-900">
                          View Lead
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
