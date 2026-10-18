"use client";

import React, { useState } from "react";
import {
  PhoneCall,
  MessageSquare,
  Mail,
  Inbox,
  Smartphone,
  Bot,
  Zap,
  Radio,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Play,
  Volume2,
} from "lucide-react";
import { MARKETING_CHANNELS } from "../constants/scenarios";

export function OmnichannelSuiteShowcase() {
  const [activeVoiceDemo, setActiveVoiceDemo] = useState(false);

  return (
    <section id="marketing" className="mt-28 relative">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-3">
          <Zap className="w-3.5 h-3.5 text-emerald-600" />
          <span>Next-Gen Telephony & Messaging</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight mb-3">
          The Omnichannel Marketing Suite
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-tertiary)] leading-relaxed">
          From conversational AI voice calls with PSTN carrier bridging to official Meta WhatsApp Cloud API broadcasts
          and department-scoped inboxes — completely native to BrokerOS.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MARKETING_CHANNELS.map((channel, i) => {
          const Icon = channel.icon;
          return (
            <div
              key={i}
              className="card-template p-6 sm:p-8 hover-lift flex flex-col justify-between relative overflow-hidden group"
            >
              {/* Subtle top edge highlight */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-2xs ${channel.accent}`}>
                    <Icon className="w-6 h-6" strokeWidth={2.2} />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {channel.badge}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-[var(--text-primary)] mb-2.5">
                  {channel.title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-tertiary)] leading-relaxed mb-6">
                  {channel.description}
                </p>

                {/* Interactive Micro-Demos Inside Channel Cards */}
                {i === 0 && (
                  <div className="mb-6 p-3 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => setActiveVoiceDemo(!activeVoiceDemo)}
                        className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 active:scale-95 transition-all cursor-pointer shadow-xs"
                      >
                        {activeVoiceDemo ? <Volume2 className="w-4 h-4 animate-pulse" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                      </button>
                      <div>
                        <span className="text-xs font-bold text-purple-900 block">
                          {activeVoiceDemo ? "Simulated Carrier Call Active..." : "Sample Voice Bot Walkthrough"}
                        </span>
                        <span className="text-[10px] text-purple-700">
                          {activeVoiceDemo ? "PSTN Bridge · 380ms Latency · ElevenLabs" : "Click to preview autonomous audio triage"}
                        </span>
                      </div>
                    </div>
                    {activeVoiceDemo && (
                      <div className="flex items-center gap-0.5 h-4">
                        <span className="w-1 bg-purple-600 h-2 animate-pulse" />
                        <span className="w-1 bg-purple-600 h-4 animate-pulse delay-75" />
                        <span className="w-1 bg-purple-600 h-3 animate-pulse delay-150" />
                        <span className="w-1 bg-purple-600 h-1 animate-pulse" />
                      </div>
                    )}
                  </div>
                )}

                {i === 1 && (
                  <div className="mb-6 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="font-bold text-emerald-900">Meta Verified Cloud API</span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-700 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
                      98.4% Open Rate
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
                  {channel.stats}
                </span>
                <span className="text-[var(--text-muted)] text-[11px] font-medium flex items-center gap-1 group-hover:text-[var(--brand-600)] transition-colors">
                  <span>Explore Specs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
