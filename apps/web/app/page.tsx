"use client";

import React from "react";
import {
  LandingNavbar,
  LandingHero,
  RoleSandboxShowcase,
  OmnichannelSuiteShowcase,
  DualWorldPartitionSection,
  ArchitecturePillars,
  LandingFooter,
} from "@/features/landing";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] relative selection:bg-purple-100 selection:text-purple-900 overflow-x-hidden">
      {/* ── Ambient Architectural Lighting (Inspired by Rapport & Wharf) ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden z-0"
      >
        <div className="absolute -top-40 -left-40 w-[650px] h-[650px] rounded-full bg-purple-200/30 blur-[130px]" />
        <div className="absolute top-1/4 -right-40 w-[600px] h-[600px] rounded-full bg-indigo-200/25 blur-[140px]" />
        <div className="absolute top-2/3 left-1/4 w-[550px] h-[550px] rounded-full bg-emerald-100/25 blur-[140px]" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full bg-amber-100/20 blur-[130px]" />

        {/* Architectural Subtle Dot Matrix */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(var(--text-primary) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* ── Top Navigation Bar ───────────────────────────────────────── */}
      <LandingNavbar />

      {/* ── Main Content Sections ────────────────────────────────────── */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 pt-16 sm:pt-24 pb-20">
        <LandingHero />
        <RoleSandboxShowcase />
        <OmnichannelSuiteShowcase />
        <DualWorldPartitionSection />
        <ArchitecturePillars />
      </main>

      {/* ── Clean Enterprise Footer ─────────────────────────────────── */}
      <LandingFooter />
    </div>
  );
}
