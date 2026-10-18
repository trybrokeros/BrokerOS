"use client";

import React from "react";
import Link from "next/link";
import { Building2, ShieldCheck, Lock, Layers } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200/80 bg-white pt-14 pb-10 px-4 sm:px-8 mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-100 text-xs">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 font-extrabold text-base text-[var(--text-primary)]">
              <div className="w-7 h-7 rounded-lg bg-[var(--brand-600)] flex items-center justify-center text-white">
                <Building2 className="w-4 h-4" />
              </div>
              <span>BrokerOS Enterprise</span>
            </div>
            <p className="text-[var(--text-tertiary)] max-w-sm leading-relaxed">
              The mission-critical real estate operating system for property brokerages. Fourteen governed role workspaces,
              omnichannel AI telephony, WhatsApp Cloud API, and clean dual-world partitioning.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md w-fit border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Better Auth Verified · RFC 6238 TOTP Multi-Factor Protection</span>
            </div>
          </div>

          {/* Quick Workspaces */}
          <div>
            <h4 className="font-bold text-[var(--text-primary)] mb-3 uppercase tracking-wider text-[11px]">
              Role Workspaces
            </h4>
            <ul className="space-y-2 text-[var(--text-tertiary)]">
              <li><Link href="/login" className="hover:text-[var(--brand-600)] transition-colors">Pre-Sales Executive & Manager</Link></li>
              <li><Link href="/login" className="hover:text-[var(--brand-600)] transition-colors">Direct Sales & Field GPS Visits</Link></li>
              <li><Link href="/login" className="hover:text-[var(--brand-600)] transition-colors">CP Sourcing & Closing Network</Link></li>
              <li><Link href="/login" className="hover:text-[var(--brand-600)] transition-colors">Finance & Broker Settlements</Link></li>
              <li><Link href="/login" className="hover:text-[var(--brand-600)] transition-colors">Director Universal Oversight</Link></li>
            </ul>
          </div>

          {/* Infrastructure */}
          <div>
            <h4 className="font-bold text-[var(--text-primary)] mb-3 uppercase tracking-wider text-[11px]">
              Technology Core
            </h4>
            <ul className="space-y-2 text-[var(--text-tertiary)] font-mono text-[11px]">
              <li>Next.js 16 (App Router)</li>
              <li>NestJS 11 Micro-services</li>
              <li>PostgreSQL & Prisma 7</li>
              <li>BullMQ Asynchronous Workers</li>
              <li>Vapi / Retell / Twilio Bridge</li>
              <li>Expo 54 Native Mobile App</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-tertiary)]">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} BrokerOS. Licensed, not sold. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="font-mono text-[11px]">isCpProject Invariant Enforced</span>
            <Link href="/login" className="text-[var(--brand-600)] font-bold hover:underline">
              Access Staff Portal →
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
