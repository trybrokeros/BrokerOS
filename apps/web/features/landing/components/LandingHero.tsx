"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Compass, ShieldCheck, Zap, Sparkles } from "lucide-react";
import { EASE_OUT_EXPO } from "../constants/scenarios";

export function LandingHero() {
  return (
    <>
      <div className="text-center max-w-3xl mx-auto">
        {/* Live System Status Pill */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-purple-200/90 shadow-xs mb-8 text-[11px] font-bold uppercase tracking-wider text-[var(--brand-700)]"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
          <span>Mission-Critical Real Estate Operating System · v2.4 Enterprise</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: EASE_OUT_EXPO }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.08] mb-6 text-balance"
        >
          The Operating System Built for{" "}
          <span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 bg-clip-text text-transparent">
            Every Real Estate Role.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE_OUT_EXPO }}
          className="text-base sm:text-lg text-[var(--text-tertiary)] font-normal max-w-2xl mx-auto mb-10 leading-relaxed text-pretty"
        >
          Fourteen deeply crafted role workspaces, autonomous AI voice agents, WhatsApp Cloud API broadcasts,
          GPS-verified site visits, and automated commission ledgers — completely partitioning internal sales from external CP broker networks.
        </motion.p>

        {/* Hero Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: EASE_OUT_EXPO }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-bold text-white bg-[var(--brand-600)] hover:bg-[var(--brand-700)] shadow-lg shadow-purple-600/25 transition-all hover:shadow-xl hover:shadow-purple-600/30 active:scale-[0.96] press-effect"
          >
            <span>Launch Your Workspace</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>

          <a
            href="#sandbox"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-[var(--text-secondary)] bg-white border border-slate-200 hover:bg-slate-50 shadow-xs transition-all active:scale-[0.96] press-effect"
          >
            <span>Explore Live Role Cockpit</span>
            <Compass className="w-4 h-4 text-purple-600" />
          </a>
        </motion.div>
      </div>

      {/* ── Key Metrics Bento Strip (Wharf & Rapport-Inspired Concentric Cards) ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25, ease: EASE_OUT_EXPO }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-16 max-w-4xl mx-auto"
      >
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover-lift">
          <div className="text-2xl sm:text-3xl font-extrabold text-[var(--brand-600)] tabular-nums mb-1">
            14
          </div>
          <div className="text-xs font-bold text-[var(--text-primary)]">Role Workspaces</div>
          <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Pre-Sales to Director + Bypass</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover-lift">
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 tabular-nums mb-1">
            Omnichannel
          </div>
          <div className="text-xs font-bold text-[var(--text-primary)]">Marketing Suite</div>
          <div className="text-[11px] text-[var(--text-muted)] mt-0.5">AI Voice, WhatsApp, Email, SMS</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover-lift">
          <div className="text-2xl sm:text-3xl font-extrabold text-sky-600 tabular-nums mb-1">
            2 Worlds
          </div>
          <div className="text-xs font-bold text-[var(--text-primary)]">Clean Partition</div>
          <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Single isCpProject invariant</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover-lift">
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tabular-nums mb-1">
            Zero-Trust
          </div>
          <div className="text-xs font-bold text-[var(--text-primary)]">Better Auth & 2FA</div>
          <div className="text-[11px] text-[var(--text-muted)] mt-0.5">RFC 6238 TOTP authenticators</div>
        </div>
      </motion.div>
    </>
  );
}
