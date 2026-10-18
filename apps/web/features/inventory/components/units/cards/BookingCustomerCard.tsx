"use client";

import React from "react";
import Link from "next/link";
import { User, Phone, MapPin } from "lucide-react";
import { useLeadHref } from "@/lib/lead-navigation";

interface BookingCustomerCardProps {
  customer: any;
}

export function BookingCustomerCard({ customer }: BookingCustomerCardProps) {
  const getLeadHref = useLeadHref();
  const leadHref = customer?.leadId ? getLeadHref(customer.leadId) : null;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
      <div className="bg-slate-50/80 border-b border-slate-100 px-4 py-2.5 flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
          <User size={13} />
        </div>
        <h3 className="text-[10px] font-extrabold text-[var(--text-primary)] uppercase tracking-wider m-0">
          Customer Identity
        </h3>
      </div>
      <div className="p-4 space-y-3">
        <div>
          {leadHref ? (
            <Link
              href={leadHref}
              className="text-sm font-extrabold text-[var(--text-primary)] hover:text-[var(--brand-700)] hover:underline no-underline"
            >
              {customer?.firstName} {customer?.lastName}
            </Link>
          ) : (
            <span className="text-sm font-extrabold text-[var(--text-primary)]">
              {customer?.firstName} {customer?.lastName}
            </span>
          )}
          <div className="flex items-center gap-1.5 mt-1 text-xs text-[var(--text-secondary)] font-semibold tabular-nums">
            <Phone size={12} className="text-slate-400" />
            <span>{customer?.phone}</span>
          </div>
        </div>

        {(customer?.city || customer?.currentAddress) && (
          <div className="flex items-start gap-2 text-xs text-[var(--text-secondary)] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <MapPin size={13} className="mt-0.5 shrink-0 text-slate-400" />
            <p className="font-medium leading-relaxed m-0">
              {[customer?.currentAddress, customer?.city]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
