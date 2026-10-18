"use client";

import React, { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { StatCards } from "@/components/dashboard/StatCards";
import {
  DollarSign,
  Building2,
  FileCheck2,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  Download,
  ShieldCheck,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function FinanceDashboard() {
  const [loading, setLoading] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [settlementBatches, setSettlementBatches] = useState([
    {
      id: "SET-8821",
      broker: "Apex Realty Partners",
      rera: "A519000284",
      unit: "Skyline Tower A #1402",
      bookingVal: "₹1,90,00,000",
      slab: "2.50%",
      gross: "₹4,75,000",
      tds: "₹23,750",
      net: "₹4,51,250",
      status: "READY_FOR_RELEASE",
    },
    {
      id: "SET-8822",
      broker: "Prime Square Properties",
      rera: "A519000109",
      unit: "Marina Bay Suites #804",
      bookingVal: "₹1,45,00,000",
      slab: "2.00%",
      gross: "₹2,90,000",
      tds: "₹14,500",
      net: "₹2,75,500",
      status: "READY_FOR_RELEASE",
    },
    {
      id: "SET-8823",
      broker: "Nexus Estates Network",
      rera: "A519000311",
      unit: "Skyline Tower C #1804",
      bookingVal: "₹2,65,00,000",
      slab: "3.50%",
      gross: "₹9,27,500",
      tds: "₹46,375",
      net: "₹8,81,125",
      status: "APPROVED_QUEUED",
    },
    {
      id: "SET-8820",
      broker: "Metro City Alliance",
      rera: "A519000994",
      unit: "Skyline Tower B #402",
      bookingVal: "₹1,20,00,000",
      slab: "2.00%",
      gross: "₹2,40,000",
      tds: "₹12,000",
      net: "₹2,28,000",
      status: "SETTLED_DISPATCHED",
    },
  ]);

  const statItems = [
    {
      label: "Gross Sales Inflow",
      value: "₹148.5 Cr",
      icon: DollarSign,
      accent: "#2f5c50",
      trend: "+28% YoY",
      positive: true,
      sub: "Total booked property transactions",
    },
    {
      label: "Developer Inbound Due",
      value: "₹5.85 Cr",
      icon: Building2,
      accent: "#6366f1",
      trend: "Audited Receivables",
      positive: true,
      sub: "Commissions owed by builders to firm",
    },
    {
      label: "CP Broker Commission Payable",
      value: "₹1.83 Cr",
      icon: Receipt,
      accent: "#f59e0b",
      trend: "Tiered Slabs Active",
      positive: true,
      sub: "Brokerage for external partner network",
    },
    {
      label: "TDS Deductions (5%)",
      value: "₹9.15 L",
      icon: FileCheck2,
      accent: "#0ea5e9",
      trend: "Form 16A Compliant",
      positive: true,
      sub: "Tax deducted at source for RERA brokers",
    },
    {
      label: "Settlement Turnaround",
      value: "48 Hours",
      icon: Clock,
      accent: "#10b981",
      trend: "Automated BullMQ",
      positive: true,
      sub: "Average payout batch processing",
    },
  ];

  const handleApprove = (id: string) => {
    setSettlementBatches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "APPROVED_QUEUED" } : b))
    );
    toast.success(`Settlement ${id} queued for BullMQ automated disbursement.`);
  };

  return (
    <DashboardPageWrapper
      loading={loading}
      title="Finance & Settlement Ledger Portal"
      subtitle="Audited financial ledgers, developer inbound receivables & automated CP broker commission payouts."
      headerRight={
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.success("Settlement ledger exported to CSV.")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Download size={13} />
            <span>Export Financial Ledger</span>
          </button>
        </div>
      }
    >
      {/* Top Financial Stat Cards */}
      <StatCards items={statItems} />

      {/* Main Ledger Settlement Queue */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_12px_28px_-16px_rgba(20,24,36,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700">
              <Receipt size={16} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 tracking-tight m-0">
                Channel Partner Broker Commission Settlement Queue
              </h2>
              <span className="text-[10px] text-slate-400">
                Governed under isCpProject = true · TDS (5%) & GST Automated
              </span>
            </div>
          </div>

          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
            Bank Disbursement Gateway: Connected
          </span>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-slate-50/40">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3.5">Batch ID & Broker</th>
                <th className="py-2.5 px-3.5">Unit Transaction</th>
                <th className="py-2.5 px-3.5">Booking Val</th>
                <th className="py-2.5 px-3.5">Slab</th>
                <th className="py-2.5 px-3.5">Gross / TDS</th>
                <th className="py-2.5 px-3.5">Net Payout</th>
                <th className="py-2.5 px-3.5">Status</th>
                <th className="py-2.5 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70">
              {settlementBatches.map((batch) => (
                <tr key={batch.id} className="hover:bg-white/80 transition-colors">
                  <td className="py-2.5 px-3.5">
                    <span className="font-bold text-slate-900 block">{batch.broker}</span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {batch.id} · RERA #{batch.rera}
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 font-medium text-slate-700">
                    {batch.unit}
                  </td>
                  <td className="py-2.5 px-3.5 font-bold text-slate-900 tnum">
                    {batch.bookingVal}
                  </td>
                  <td className="py-2.5 px-3.5">
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      {batch.slab}
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 tnum">
                    <span className="text-slate-800 font-bold block">{batch.gross}</span>
                    <span className="text-[10px] text-slate-400">TDS: -{batch.tds}</span>
                  </td>
                  <td className="py-2.5 px-3.5 font-extrabold text-emerald-700 tnum text-sm">
                    {batch.net}
                  </td>
                  <td className="py-2.5 px-3.5">
                    {batch.status === "READY_FOR_RELEASE" && (
                      <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        <Clock size={11} />
                        Pending Approval
                      </span>
                    )}
                    {batch.status === "APPROVED_QUEUED" && (
                      <span className="inline-flex items-center gap-1 text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        <CheckCircle2 size={11} />
                        Queued in Batch
                      </span>
                    )}
                    {batch.status === "SETTLED_DISPATCHED" && (
                      <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        <CheckCircle2 size={11} />
                        Paid & Archived
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3.5 text-right">
                    {batch.status === "READY_FOR_RELEASE" ? (
                      <button
                        onClick={() => handleApprove(batch.id)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-2xs transition-all active:scale-[0.96] cursor-pointer"
                      >
                        Approve Payout
                      </button>
                    ) : (
                      <button
                        onClick={() => toast.success(`Viewing statement for ${batch.id}`)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                      >
                        Statement
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Guarantee */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Automated TDS Deductions & Bank Direct Credit Reconciled Hourly</span>
          </span>
          <span className="font-mono text-slate-600">PostgreSQL Transaction Safe · BullMQ Worker Guarded</span>
        </div>
      </div>
    </DashboardPageWrapper>
  );
}
