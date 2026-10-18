"use client";

import React, { useState } from "react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { AdminTelephonySettings } from "@/features/telephony/components/admin/AdminTelephonySettings";
import { WhatsAppConfigCard } from "@/features/marketing/whatsapp";
import { AdminSmsSettings } from "@/features/marketing/sms/components/admin/AdminSmsSettings";
import { AdminEmailSettings } from "@/features/marketing/email/components/admin/AdminEmailSettings";
import { AdminSecuritySettings } from "@/features/security/components/AdminSecuritySettings";
import { PhoneCall, Building2, ShieldCheck, Radio, MessageSquare, Mail } from "lucide-react";

type SettingsTab = "telephony" | "whatsapp" | "sms" | "email" | "general" | "security";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("telephony");

  const tabs: Array<{ id: SettingsTab; label: string; icon: React.ReactNode }> = [
    {
      id: "telephony",
      label: "CRM Telephony & WebRTC",
      icon: <PhoneCall className="w-4 h-4" />,
    },
    {
      id: "whatsapp",
      label: "WhatsApp Cloud API",
      icon: <Radio className="w-4 h-4" />,
    },
    {
      id: "sms",
      label: "Default SMS Gateway",
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      id: "email",
      label: "Default Email Service",
      icon: <Mail className="w-4 h-4" />,
    },
    {
      id: "general",
      label: "Organization Details",
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: "security",
      label: "Security & Permissions",
      icon: <ShieldCheck className="w-4 h-4" />,
    },
  ];

  return (
    <DashboardPageWrapper
      loading={false}
      title="Admin System Settings"
      subtitle="Manage global integrations, CRM telephony carrier connections, and company preferences."
    >
      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-[var(--brand-50)] text-[var(--brand-700)] border border-[var(--brand-200)] shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === "telephony" && <AdminTelephonySettings />}

      {activeTab === "whatsapp" && (
        <div className="space-y-4 max-w-4xl">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">Central WhatsApp Cloud API</h3>
            <p className="text-xs text-slate-500 mb-6">
              Connect your official Meta WhatsApp Business Account (WABA). All operational departments (Pre-Sales, Sales, Post-Sales, Sourcing, Closing, and Finance) automatically route outbound 1-on-1 messages through this verified line.
            </p>
            <WhatsAppConfigCard />
          </div>
        </div>
      )}

      {activeTab === "sms" && <AdminSmsSettings />}

      {activeTab === "email" && <AdminEmailSettings />}

      {activeTab === "general" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-base font-bold text-slate-900 mb-1">Company Profile</h3>
          <p className="text-xs text-slate-500 mb-6">
            Basic details about the real estate brokerage and timezone preferences.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Brokerage Name
              </label>
              <input
                type="text"
                defaultValue="BrokerOS Enterprise Real Estate"
                className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Default Timezone
              </label>
              <input
                type="text"
                defaultValue="UTC+05:30 (Asia/Kolkata)"
                className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs text-slate-800"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === "security" && <AdminSecuritySettings />}
    </DashboardPageWrapper>
  );
}
