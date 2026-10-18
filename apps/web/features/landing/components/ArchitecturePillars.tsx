"use client";

import React from "react";
import { CORE_PILLARS } from "../constants/scenarios";
import { ShieldCheck, Cpu } from "lucide-react";

export function ArchitecturePillars() {
  return (
    <section id="pillars" className="mt-28 relative">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-[11px] font-bold text-indigo-800 uppercase tracking-wider mb-3">
          <Cpu className="w-3.5 h-3.5 text-indigo-600" />
          <span>Enterprise Engineering</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight mb-3">
          Uncompromising Technical Architecture
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-tertiary)] leading-relaxed">
          Engineered from ground zero for institutional brokerages: zero client-side role trust, atomic database
          transactions, and asynchronous background worker queues.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CORE_PILLARS.map((pillar, i) => {
          const Icon = pillar.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs hover-lift flex flex-col justify-between"
            >
              <div>
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-5 border shadow-xs ${pillar.accent}`}>
                  <Icon className="w-5 h-5" strokeWidth={2.2} />
                </div>
                <h3 className="text-base font-extrabold text-[var(--text-primary)] mb-2">
                  {pillar.title}
                </h3>
                <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
