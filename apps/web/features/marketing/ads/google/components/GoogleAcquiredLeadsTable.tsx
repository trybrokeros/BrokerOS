"use client";

import React, { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLeadHref } from "@/lib/lead-navigation";
import type { GoogleAcquiredLeadItem } from "../types";

interface GoogleAcquiredLeadsTableProps {
  leads: GoogleAcquiredLeadItem[];
  currency?: string;
}

export function GoogleAcquiredLeadsTable({
  leads,
  currency = "INR",
}: GoogleAcquiredLeadsTableProps) {
  const getLeadHref = useLeadHref();
  const [searchTerm, setSearchTerm] = useState("");

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
    if (currency === "INR" || currency === "₹") {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
      return `₹${Math.round(val).toLocaleString("en-IN")}`;
    }
    return `$${Math.round(val).toLocaleString("en-US")}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-50 text-blue-700 border-blue-200/80";
      case "CONTACTED":
        return "bg-indigo-50 text-indigo-700 border-indigo-200/80";
      case "INTERESTED":
      case "QUALIFIED":
        return "bg-purple-50 text-purple-700 border-purple-200/80";
      case "SITE_VISIT_SCHEDULED":
      case "SITE_VISIT_COMPLETED":
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      case "BOOKING":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200/80";
    }
  };

  const getTempBadge = (temp?: string) => {
    switch (temp) {
      case "HOT":
        return "bg-rose-50 text-rose-700 border-rose-200/80";
      case "WARM":
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      case "COLD":
        return "bg-blue-50 text-blue-700 border-blue-200/80";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200/80";
    }
  };

  if (!leads || leads.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200/80 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto text-blue-600 mb-2 shadow-xs">
          <Users className="w-6 h-6" />
        </div>
        <p className="text-xs font-extrabold text-[var(--text-primary)]">
          No Inbound Google Leads Captured Yet
        </p>
        <p className="text-xs font-medium text-[var(--text-tertiary)] mt-0.5">
          Form submissions from Google Lead Form Assets will appear here automatically via webhook.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search leads by name, phone, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200/80 bg-slate-50/50 text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-[var(--brand-500)]/20 focus:border-[var(--brand-500)] transition-all"
          />
        </div>
        <span className="text-xs font-bold text-[var(--text-tertiary)]">
          Showing {filtered.length} of {leads.length} leads
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-tertiary)]">
              <th className="py-3 px-4">Prospect Details</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Location & Budget</th>
              <th className="py-3 px-4">CRM Status</th>
              <th className="py-3 px-4">Assigned Agent</th>
              <th className="py-3 px-4">Captured</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filtered.map((item) => {
              const lead = item.lead;
              return (
                <tr key={item.logId} className="hover:bg-slate-50/50 transition-colors">
                  {/* Prospect Details */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shadow-xs">
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-extrabold text-[var(--text-primary)] block">
                          {lead.name}
                        </span>
                        {item.formId && (
                          <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                            Form: {item.formId}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="space-y-0.5">
                      <a
                        href={`tel:${lead.phone}`}
                        className="flex items-center gap-1.5 text-blue-600 hover:underline font-mono font-bold text-xs"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{lead.phone}</span>
                      </a>
                      {lead.email && (
                        <div className="flex items-center gap-1.5 text-[var(--text-tertiary)] text-[11px]">
                          <Mail className="w-3 h-3" />
                          <span>{lead.email}</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Location & Budget */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="space-y-0.5">
                      {lead.city && (
                        <div className="flex items-center gap-1 text-[var(--text-secondary)] font-medium">
                          <MapPin className="w-3 h-3 text-[var(--text-tertiary)]" />
                          <span>{lead.city}</span>
                        </div>
                      )}
                      {lead.budget && (
                        <div className="text-[11px] font-black text-emerald-600">
                          {formatCurrency(lead.budget)}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* CRM Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${getStatusBadge(lead.status)}`}
                      >
                        {lead.status}
                      </span>
                      {lead.temperature && (
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded-md text-[10px] font-black border ${getTempBadge(lead.temperature)}`}
                        >
                          {lead.temperature}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Assigned Agent */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-[var(--text-secondary)] font-medium">
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                      <span>{lead.assignedUser?.name || "Unassigned"}</span>
                    </div>
                  </td>

                  {/* Captured */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-[var(--text-tertiary)] text-[11px] font-medium">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(item.capturedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <Link href={getLeadHref(lead.id)}>
                      <Button variant="outline" size="sm" className="gap-1 text-xs font-bold">
                        <span>View Lead</span>
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
