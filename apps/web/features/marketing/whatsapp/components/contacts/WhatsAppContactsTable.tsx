'use client';

// ============================================================================
// BrokerOS — WhatsApp Contacts Table (Connected with Add, Edit, Import & Drawer)
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  UserPlus,
  Upload,
  MessageSquare,
  Tag as TagIcon,
  Phone,
  Mail,
  ExternalLink,
  Flame,
  Pencil,
  Trash2,
  MoreVertical,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLeadHref } from '@/lib/lead-navigation';
import type { WhatsAppContact } from '../../types';
import { ContactFormModal } from './ContactFormModal';
import { ImportContactsModal } from './ImportContactsModal';
import { ContactDetailDrawer } from './ContactDetailDrawer';

interface WhatsAppContactsTableProps {
  accountId?: string;
}

export const WhatsAppContactsTable: React.FC<WhatsAppContactsTableProps> = ({
  accountId,
}) => {
  const router = useRouter();
  const getLeadHref = useLeadHref();
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [startingChatId, setStartingChatId] = useState<string | null>(null);

  // Modals and Drawers
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<WhatsAppContact | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [detailContactId, setDetailContactId] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  const handleStartChat = async (contactId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      setStartingChatId(contactId);
      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId, accountId }),
      });
      if (res.ok) {
        const conv = await res.json();
        router.push(`/dashboard/marketing/whatsapp/inbox?conversationId=${conv.id}`);
      } else {
        router.push(`/dashboard/marketing/whatsapp/inbox`);
      }
    } catch (err) {
      console.error('Error starting chat:', err);
      router.push(`/dashboard/marketing/whatsapp/inbox`);
    } finally {
      setStartingChatId(null);
    }
  };

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (accountId) query.set('accountId', accountId);
      if (search.trim()) query.set('search', search.trim());
      query.set('page', String(page));
      query.set('limit', '15');

      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/contacts?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setContacts(data.items || []);
        if (data.pagination) {
          setTotalPages(data.pagination.pages || 1);
        }
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, accountId, search, page]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleDelete = async (contactId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/contacts/${contactId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchContacts();
      }
    } catch (err) {
      console.error('Failed to delete contact:', err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-bg-surface p-4 rounded-2xl border border-border-default shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-text-tertiary absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by phone, name, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-brand-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-bg-base hover:bg-bg-subtle border border-border-default text-text-primary transition-colors shadow-2xs"
          >
            <Upload className="w-4 h-4 text-text-tertiary" />
            <span>Import CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setContactToEdit(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-2xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-bg-surface border border-border-default rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-subtle/80 text-text-secondary font-semibold uppercase tracking-wider text-[11px] border-b border-border-default">
              <tr>
                <th className="px-6 py-3.5">Contact</th>
                <th className="px-6 py-3.5">Phone</th>
                <th className="px-6 py-3.5">CRM Lead</th>
                <th className="px-6 py-3.5">Tags</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-text-tertiary">
                    Loading contacts...
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-text-tertiary">
                    No contacts found matching your criteria.
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    onClick={() => setDetailContactId(contact.id)}
                    className="hover:bg-bg-subtle/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 font-bold flex items-center justify-center shrink-0">
                          {(contact.name || contact.phone).slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-text-primary text-xs group-hover:text-brand-600 transition-colors">
                            {contact.name || 'Unnamed Contact'}
                          </p>
                          {contact.email && (
                            <p className="text-[11px] text-text-tertiary">{contact.email}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono text-text-secondary">
                      {contact.phone}
                    </td>

                    <td className="px-6 py-4">
                      {contact.lead ? (
                        <Link
                          href={getLeadHref(contact.lead.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-600 border border-brand-200 dark:border-brand-800 font-medium hover:underline text-[11px]"
                        >
                          <Flame className="w-3 h-3 text-amber-500" />
                          <span>{contact.lead.status}</span>
                          {contact.lead.temperature && (
                            <span className="font-bold">({contact.lead.temperature})</span>
                          )}
                          <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                        </Link>
                      ) : (
                        <span className="text-[11px] text-text-tertiary italic">Not linked</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags && contact.tags.length > 0 ? (
                          contact.tags.map((t: any) => (
                            <span
                              key={t.id || t.tagId}
                              className="px-2 py-0.5 rounded-md bg-bg-muted text-text-secondary text-[10px] font-medium"
                            >
                              {t.tag?.name || 'Tag'}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-text-muted">—</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setContactToEdit(contact);
                            setIsFormOpen(true);
                          }}
                          className="p-1.5 text-text-tertiary hover:text-text-primary hover:bg-bg-subtle rounded-lg transition-colors"
                          title="Edit Contact"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(contact.id, e)}
                          className="p-1.5 text-text-tertiary hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete Contact"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleStartChat(contact.id, e)}
                          disabled={startingChatId === contact.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-colors ml-1 disabled:opacity-50"
                          title="Open WhatsApp Chat"
                        >
                          {startingChatId === contact.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <MessageSquare className="w-3.5 h-3.5" />
                          )}
                          <span>Chat</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-border-default bg-bg-subtle/40 text-xs">
            <span className="text-text-tertiary">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 bg-bg-surface border border-border-default rounded-lg disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 bg-bg-surface border border-border-default rounded-lg disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Contact Modal */}
      <ContactFormModal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        contact={contactToEdit}
        accountId={accountId}
        onSaved={() => fetchContacts()}
      />

      {/* CSV Bulk Import Modal */}
      <ImportContactsModal
        open={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        accountId={accountId}
        onImportSuccess={() => fetchContacts()}
      />

      {/* Contact Detail Slide-Out Drawer */}
      <ContactDetailDrawer
        open={detailContactId !== null}
        onClose={() => setDetailContactId(null)}
        contactId={detailContactId}
        accountId={accountId}
        onUpdated={() => fetchContacts()}
        onOpenChat={(contactId) => handleStartChat(contactId)}
      />
    </div>
  );
};
