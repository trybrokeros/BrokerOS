"use client";

import React, { useState } from "react";
import {
  ClipboardList,
  FileText,
  Banknote,
  Handshake,
  PhoneForwarded,
  ChevronRight,
  Key,
} from "lucide-react";
import Link from "next/link";

import { motion } from "framer-motion";

export function ClosingManagerTasks({ dashData }: { dashData: any }) {
  const [activeTab, setActiveTab] = useState<
    "DOCUMENTS" | "LOANS" | "AGREEMENTS" | "HANDOVERS" | "FOLLOW_UPS"
  >("DOCUMENTS");

  const lists = dashData?.lists || {};
  const documents = lists.documentPending || [];
  const loans = lists.loanPending || [];
  const agreements = lists.agreementPending || [];
  const handovers = lists.handoverPending || [];
  const followUps = lists.todayFollowups || [];

  const tabs = [
    { id: "DOCUMENTS", label: "Documents", count: documents.length },
    { id: "LOANS", label: "Loans", count: loans.length },
    { id: "AGREEMENTS", label: "Agreements", count: agreements.length },
    { id: "HANDOVERS", label: "Handovers", count: handovers.length },
    { id: "FOLLOW_UPS", label: "Follow-ups", count: followUps.length },
  ];

  return (
    <div
      className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between h-full mt-4"
      style={{
        boxShadow:
          "0 1px 0 rgba(255, 255, 255, 0.95) inset, 0 16px 36px -24px rgba(15, 23, 42, 0.12)",
      }}
    >
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50/90 border border-purple-200/60 flex items-center justify-center text-[var(--brand-700)] shadow-2xs">
              <ClipboardList size={16} />
            </div>
            <div>
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider m-0">
                Pending Pipeline Milestones &amp; Follow-ups
              </h2>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5 m-0">
                Manage deal closing tasks, loan sanctions, registration agreements and customer touchpoints
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
            {documents.length + loans.length + agreements.length + handovers.length + followUps.length} Pending
          </span>
        </div>

        {/* Fluid tab pill bar */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/70 overflow-x-auto mb-4">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="closingTasksActiveTab"
                    className="absolute inset-0 bg-white rounded-xl shadow-xs border border-slate-200/80"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
                <span className="relative z-10 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-slate-100 text-slate-700 tabular-nums">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="max-h-[460px] overflow-y-auto pr-1">
          {activeTab === "DOCUMENTS" && (
            <ListBookings
              items={documents}
              emptyMsg="No documents pending."
              iconColor="#9333ea"
              iconBg="bg-purple-50"
              borderAccent="border-purple-100"
              Icon={FileText}
            />
          )}
          {activeTab === "LOANS" && (
            <ListBookings
              items={loans}
              emptyMsg="No loans pending."
              iconColor="#3b82f6"
              iconBg="bg-blue-50"
              borderAccent="border-blue-100"
              Icon={Banknote}
            />
          )}
          {activeTab === "AGREEMENTS" && (
            <ListBookings
              items={agreements}
              emptyMsg="No agreements pending."
              iconColor="#9333ea"
              iconBg="bg-purple-50"
              borderAccent="border-purple-100"
              Icon={Handshake}
            />
          )}
          {activeTab === "HANDOVERS" && (
            <ListBookings
              items={handovers}
              emptyMsg="No handovers pending."
              iconColor="#f59e0b"
              iconBg="bg-amber-50"
              borderAccent="border-amber-100"
              Icon={Key}
            />
          )}
          {activeTab === "FOLLOW_UPS" && (
            <ListFollowUps
              items={followUps}
              emptyMsg="No follow-ups scheduled for today."
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ListBookings({
  items,
  emptyMsg,
  iconColor,
  iconBg,
  borderAccent,
  Icon,
}: {
  items: any[];
  emptyMsg: string;
  iconColor: string;
  iconBg: string;
  borderAccent: string;
  Icon: any;
}) {
  if (items.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-xs font-semibold text-[var(--text-muted)] text-center gap-2">
        <Icon size={24} className="text-slate-300" />
        <span>{emptyMsg}</span>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {items.map((booking) => (
        <Link
          key={booking.id}
          href={
            booking.customer?.leadId
              ? `/dashboard/closing-manager/lead-management/${booking.customer.leadId}`
              : "#"
          }
          className="flex items-center justify-between p-3 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-100/60 transition-colors no-underline group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl ${iconBg} border ${borderAccent} flex items-center justify-center shrink-0`}
              style={{ color: iconColor }}
            >
              <Icon size={16} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--brand-700)] transition-colors">
                {booking.customer?.firstName} {booking.customer?.lastName}
              </div>
              <div className="text-[10px] font-semibold text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                <span className="px-1.5 py-0.5 rounded bg-purple-50 text-[var(--brand-700)] font-extrabold uppercase tracking-wider text-[8px] border border-purple-200/60">
                  {booking.status.replace(/_/g, " ")}
                </span>
                <span>•</span>
                <span className="tabular-nums">
                  Unit: {booking.unit?.unitNumber || "N/A"}
                </span>
              </div>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-400 shrink-0 group-hover:text-slate-600 transition-colors" />
        </Link>
      ))}
    </div>
  );
}

function ListFollowUps({
  items,
  emptyMsg,
}: {
  items: any[];
  emptyMsg: string;
}) {
  if (items.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-xs font-semibold text-[var(--text-muted)] text-center gap-2">
        <PhoneForwarded size={24} className="text-slate-300" />
        <span>{emptyMsg}</span>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {items.map((fup) => (
        <Link
          key={fup.id}
          href={
            fup.customer?.leadId
              ? `/dashboard/closing-manager/lead-management/${fup.customer.leadId}`
              : "#"
          }
          className="flex items-center justify-between p-3 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-100/60 transition-colors no-underline group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
              <PhoneForwarded size={16} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--brand-700)] transition-colors">
                {fup.customer?.firstName} {fup.customer?.lastName}
              </div>
              <div className="text-[10px] font-semibold text-[var(--text-muted)] mt-0.5 tabular-nums">
                Scheduled:{" "}
                {new Date(fup.scheduledDate).toLocaleString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </div>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-400 shrink-0 group-hover:text-slate-600 transition-colors" />
        </Link>
      ))}
    </div>
  );
}
