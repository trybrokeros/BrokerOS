"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { Button } from "@/components/ui/Button";
import { CampaignWizardStepper } from "@/features/marketing/shared/CampaignWizardStepper";
import { SmsStep1ProjectGateway } from "@/features/marketing/sms/wizard/SmsStep1ProjectGateway";
import { SmsStep2Audience } from "@/features/marketing/sms/wizard/SmsStep2Audience";
import { SmsStep3MessageMockup } from "@/features/marketing/sms/wizard/SmsStep3MessageMockup";
import { SmsStep4ReviewLaunch } from "@/features/marketing/sms/wizard/SmsStep4ReviewLaunch";
import { DEFAULT_SMS_TEMPLATES } from "@brokeros/constants";
import type {
  AudienceSourceType,
  CsvLeadRow,
  SmsProviderType,
} from "@/features/marketing/types";
import type { CampaignSmsSenderPoolConfig } from "@brokeros/types";

const SMS_DRAFT_STORAGE_KEY = "brokeros_sms_campaign_draft_v1";

const SMS_WIZARD_STEPS = [
  { num: 1, label: "Campaign Info", desc: "Title & Gateway Setup" },
  { num: 2, label: "Audience Target", desc: "CRM Filter or CSV" },
  { num: 3, label: "SMS Composer", desc: "Copy & Phone Preview" },
  { num: 4, label: "Review & Launch", desc: "Test SMS & Dispatch" },
];

export default function NewSmsCampaignPage() {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

  // Step Tracker
  const [currentStep, setCurrentStep] = useState(1);

  // Form State: Step 1 (Campaign & Gateway Info)
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [isCpCampaign, setIsCpCampaign] = useState(false);
  const [providerType, setProviderType] = useState<SmsProviderType>("TWILIO");
  const [fromSender, setFromSender] = useState("");
  const [dltTemplateId, setDltTemplateId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  // Form State: Step 2 (Audience)
  const [audienceSource, setAudienceSource] = useState<AudienceSourceType>("CRM_DATABASE");
  const [filters, setFilters] = useState<{
    temperatures?: Array<"HOT" | "WARM" | "COLD">;
    statuses?: string[];
    projectId?: string;
    minBudget?: number;
  }>({ statuses: [], temperatures: [], projectId: undefined, minBudget: undefined });
  const [csvRecipients, setCsvRecipients] = useState<CsvLeadRow[]>([]);
  const [saveCsvAsCrmLeads, setSaveCsvAsCrmLeads] = useState(true);
  const [totalAudienceCount, setTotalAudienceCount] = useState<number>(0);

  // Form State: Step 3 (Message Copy)
  const [messageContent, setMessageContent] = useState<string>(DEFAULT_SMS_TEMPLATES[0].message);

  // Form State: Step 4 (Test SMS & Review)
  const [senderPools, setSenderPools] = useState<CampaignSmsSenderPoolConfig[]>([]);
  const [allocationMode, setAllocationMode] = useState<"AUTO_EVEN" | "CUSTOM_PERCENTAGE">("AUTO_EVEN");
  const [testPhone, setTestPhone] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSendStatus, setTestSendStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  // External data
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Provider change handler to automatically adapt fromSender to verified number
  const handleProviderTypeChange = (newProvider: SmsProviderType) => {
    setProviderType(newProvider);
    const matched = integrations.find((i) => i.provider === newProvider && i.isActive);
    if (matched) {
      const best =
        matched.senderNumbers?.find((n: any) => n.phoneNumber?.startsWith("+"))?.phoneNumber ||
        matched.fromSender;
      if (best) {
        setFromSender(best);
        return;
      }
    }
    setFromSender("");
  };

  // Draft Auto-Save State
  const [draftCampaignId, setDraftCampaignId] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch Projects & SMS Integrations
  useEffect(() => {
    async function loadProjectsAndIntegrations() {
      try {
        setIsLoadingProjects(true);
        const [pRes, iRes] = await Promise.all([
          fetch(`${baseUrl}/api/marketing/sms/projects`),
          fetch(`${baseUrl}/api/marketing/sms/integrations`),
        ]);

        if (pRes.ok) {
          const data = await pRes.json();
          setProjects(data || []);
        }
        if (iRes.ok) {
          const intData = await iRes.json();
          const list = Array.isArray(intData) ? intData : [];
          setIntegrations(list);

          // Initialize fromSender from any active integration's verified number
          const defaultInt = list.find((i: any) => i.isActive && i.isDefault) || list.find((i: any) => i.isActive);
          if (defaultInt) {
            setProviderType(defaultInt.provider);
            const verified =
              defaultInt.senderNumbers?.find((n: any) => n.phoneNumber?.startsWith("+") && n.isVerified)?.phoneNumber ||
              defaultInt.senderNumbers?.find((n: any) => n.isVerified)?.phoneNumber ||
              defaultInt.senderNumbers?.[0]?.phoneNumber ||
              defaultInt.fromSender;
            if (verified) {
              setFromSender(verified);
            }
          }
        }
      } catch {
        // Fallback gracefully
      } finally {
        setIsLoadingProjects(false);
      }
    }
    loadProjectsAndIntegrations();
  }, [baseUrl]);

  // 2. Restore Draft from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SMS_DRAFT_STORAGE_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.title) setTitle(draft.title);
        if (draft.projectId) setProjectId(draft.projectId);
        if (draft.isCpCampaign !== undefined) setIsCpCampaign(draft.isCpCampaign);
        if (draft.providerType) setProviderType(draft.providerType);
        if (draft.fromSender && draft.fromSender !== "SKYLIN" && draft.fromSender !== "SKYLRE") {
          setFromSender(draft.fromSender);
        }
        if (draft.dltTemplateId) setDltTemplateId(draft.dltTemplateId);
        if (draft.scheduledAt) setScheduledAt(draft.scheduledAt);
        if (draft.audienceSource) setAudienceSource(draft.audienceSource);
        if (draft.filters) setFilters(draft.filters);
        if (draft.csvRecipients) setCsvRecipients(draft.csvRecipients);
        if (draft.saveCsvAsCrmLeads !== undefined) setSaveCsvAsCrmLeads(draft.saveCsvAsCrmLeads);
        if (draft.totalAudienceCount !== undefined) setTotalAudienceCount(draft.totalAudienceCount);
        if (draft.messageContent) setMessageContent(draft.messageContent);
        if (draft.draftCampaignId) setDraftCampaignId(draft.draftCampaignId);
        if (draft.currentStep) setCurrentStep(draft.currentStep);
        setHasRestoredDraft(true);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // 3. Save Draft to LocalStorage and Backend Database
  const saveDraftToDatabase = useCallback(async () => {
    if (!title.trim()) return;

    try {
      setIsSavingDraft(true);

      const draftState = {
        campaignId: draftCampaignId || undefined,
        title,
        projectId: projectId || undefined,
        isCpCampaign,
        providerType,
        fromSender,
        dltTemplateId: dltTemplateId || undefined,
        scheduledAt: scheduledAt || undefined,
        audienceSource,
        audienceFilters: audienceSource === "CRM_DATABASE" ? filters : undefined,
        csvRecipients: audienceSource === "CSV_UPLOAD" ? csvRecipients : undefined,
        saveCsvAsCrmLeads,
        totalAudienceCount: audienceSource === "CSV_UPLOAD" ? csvRecipients.length : totalAudienceCount,
        messageContent,
        currentStep,
      };

      localStorage.setItem(SMS_DRAFT_STORAGE_KEY, JSON.stringify(draftState));

      const res = await fetch(`${baseUrl}/api/marketing/sms/campaigns/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draftState),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.id && !draftCampaignId) {
          setDraftCampaignId(data.id);
        }
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      }
    } catch {
      // Ignore background draft errors
    } finally {
      setIsSavingDraft(false);
    }
  }, [
    baseUrl,
    draftCampaignId,
    title,
    projectId,
    isCpCampaign,
    providerType,
    fromSender,
    dltTemplateId,
    scheduledAt,
    audienceSource,
    filters,
    csvRecipients,
    saveCsvAsCrmLeads,
    messageContent,
    currentStep,
  ]);

  // 4. Auto-save Draft on Changes (Debounced 1200ms)
  useEffect(() => {
    if (!title.trim()) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      saveDraftToDatabase();
    }, 1200);

    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
  }, [title, projectId, messageContent, fromSender, filters, audienceSource, saveDraftToDatabase]);

  // 5. Clear / Discard Draft
  const handleDiscardDraft = async () => {
    if (confirm("Are you sure you want to discard this SMS draft and start fresh?")) {
      if (draftCampaignId) {
        try {
          await fetch(`${baseUrl}/api/marketing/sms/campaigns/${draftCampaignId}`, {
            method: "DELETE",
          });
        } catch {
          // Ignore network cleanup errors
        }
      }
      localStorage.removeItem(SMS_DRAFT_STORAGE_KEY);
      setTitle("");
      setProjectId("");
      setIsCpCampaign(false);
      setProviderType("TWILIO");
      setFromSender("");
      setDltTemplateId("");
      setScheduledAt("");
      setAudienceSource("CRM_DATABASE");
      setFilters({ statuses: [], temperatures: [], projectId: undefined, minBudget: undefined });
      setCsvRecipients([]);
      setSaveCsvAsCrmLeads(true);
      setMessageContent(DEFAULT_SMS_TEMPLATES[0].message);
      setDraftCampaignId(null);
      setLastSavedTime(null);
      setHasRestoredDraft(false);
      setCurrentStep(1);
    }
  };

  // 6. Test SMS Send
  const handleSendTest = async () => {
    if (!testPhone || testPhone.length < 7) {
      setTestSendStatus({ ok: false, msg: "Please enter a valid mobile number with country code." });
      return;
    }

    setIsSendingTest(true);
    setTestSendStatus(null);
    try {
      const res = await fetch(`${baseUrl}/api/marketing/sms/campaigns/send-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientPhone: testPhone,
          toPhone: testPhone,
          messageContent: messageContent || "Test SMS Preview from BrokerOS",
          fromSender: fromSender || senderPools[0]?.phoneNumber || senderPools[0]?.senderId || undefined,
          providerType,
          dltTemplateId: dltTemplateId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to dispatch test SMS");

      setTestSendStatus({
        ok: true,
        msg: `Test SMS successfully dispatched to ${testPhone} via ${data.provider}.`,
      });
    } catch (err: any) {
      setTestSendStatus({ ok: false, msg: err?.message || "Test dispatch failed." });
    } finally {
      setIsSendingTest(false);
    }
  };

  // 7. Launch Campaign
  const handleLaunchCampaign = async () => {
    if (!title.trim()) {
      toast.error("Please enter a campaign title.");
      setCurrentStep(1);
      return;
    }
    if (!messageContent.trim()) {
      toast.error("Please compose SMS message copy.");
      setCurrentStep(3);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        campaignId: draftCampaignId || undefined,
        title,
        projectId: projectId || undefined,
        isCpCampaign,
        fromSender: fromSender || senderPools[0]?.phoneNumber || senderPools[0]?.senderId || undefined,
        providerType: senderPools.length > 1 ? "MULTI_PROVIDER" : providerType,
        senderPools: senderPools.length > 0 ? senderPools : undefined,
        allocationMode,
        dltTemplateId: dltTemplateId || undefined,
        messageContent,
        audienceSource,
        audienceFilters: audienceSource === "CRM_DATABASE" ? filters : undefined,
        csvRecipients: audienceSource === "CSV_UPLOAD" ? csvRecipients : undefined,
        saveCsvAsCrmLeads: audienceSource === "CSV_UPLOAD" ? saveCsvAsCrmLeads : false,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      };

      const res = await fetch(`${baseUrl}/api/marketing/sms/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.message || "Failed to create SMS campaign");
      }

      localStorage.removeItem(SMS_DRAFT_STORAGE_KEY);
      const data = await res.json();
      toast.success("SMS campaign launched successfully");
      router.push(`/dashboard/marketing/sms/campaigns/${data.id}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to launch SMS campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProjectObj = projects.find((p) => p.id === projectId);

  return (
    <DashboardPageWrapper
      loading={false}
      title="Create SMS Broadcast"
      subtitle="Follow the step-by-step wizard to target mobile leads, compose character-optimized copy, and dispatch carrier SMS."
      headerRight={
        <div className="flex items-center gap-2.5">
          {/* Auto-Save indicator */}
          {(draftCampaignId || lastSavedTime) && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-[var(--text-secondary)] shadow-xs">
              <Save className={`w-3.5 h-3.5 ${isSavingDraft ? "animate-spin text-amber-600" : "text-emerald-600"}`} />
              <span>
                {isSavingDraft ? "Saving SMS draft..." : lastSavedTime ? `Draft saved (${lastSavedTime})` : "Draft saved"}
              </span>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => saveDraftToDatabase()}
            disabled={isSavingDraft}
            className="gap-1.5 text-xs font-bold"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDiscardDraft}
            className="gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Draft</span>
          </Button>

          <Link href="/dashboard/marketing/sms">
            <Button variant="outline" size="sm" className="gap-2 text-xs font-bold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to SMS</span>
            </Button>
          </Link>
        </div>
      }
    >
      {/* ── RESTORED DRAFT BANNER ── */}
      {hasRestoredDraft && (
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <RotateCcw className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-amber-900">
              Restored in-progress SMS campaign draft from your last session.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setHasRestoredDraft(false)}
            className="text-xs font-bold text-amber-800 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── STEPPER HEADER ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <CampaignWizardStepper
          steps={SMS_WIZARD_STEPS}
          currentStep={currentStep}
          onStepClick={(stepNum) => setCurrentStep(stepNum)}
          accentColor="amber"
        />
      </div>

      {/* ── STEP 1: CAMPAIGN INFORMATION ── */}
      {currentStep === 1 && (
        <SmsStep1ProjectGateway
          title={title}
          onTitleChange={setTitle}
          projectId={projectId}
          onProjectIdChange={setProjectId}
          isCpCampaign={isCpCampaign}
          onIsCpCampaignChange={setIsCpCampaign}
          projects={projects}
          isLoadingProjects={isLoadingProjects}
          onNext={() => setCurrentStep(2)}
        />
      )}

      {/* ── STEP 2: AUDIENCE TARGETING ── */}
      {currentStep === 2 && (
        <SmsStep2Audience
          audienceSource={audienceSource}
          onAudienceSourceChange={setAudienceSource}
          filters={filters}
          onFiltersChange={setFilters}
          csvRecipients={csvRecipients}
          onCsvRecipientsChange={setCsvRecipients}
          saveCsvAsCrmLeads={saveCsvAsCrmLeads}
          onSaveCsvAsCrmLeadsChange={setSaveCsvAsCrmLeads}
          projects={projects}
          apiBaseUrl={baseUrl}
          onAudienceCountChange={setTotalAudienceCount}
          onBack={() => setCurrentStep(1)}
          onNext={() => setCurrentStep(3)}
        />
      )}

      {/* ── STEP 3: MESSAGE COMPOSER & PHONE SIMULATOR ── */}
      {currentStep === 3 && (
        <SmsStep3MessageMockup
          messageContent={messageContent}
          onMessageContentChange={setMessageContent}
          fromSender={fromSender}
          dltTemplateId={dltTemplateId}
          onDltTemplateIdChange={setDltTemplateId}
          selectedProjectName={selectedProjectObj?.name}
          onBack={() => setCurrentStep(2)}
          onNext={() => setCurrentStep(4)}
        />
      )}

      {/* ── STEP 4: REVIEW, LIVE TEST SMS & LAUNCH ── */}
      {currentStep === 4 && (
        <SmsStep4ReviewLaunch
          audienceSource={audienceSource}
          csvRecipients={csvRecipients}
          totalAudienceCount={audienceSource === "CSV_UPLOAD" ? csvRecipients.length : totalAudienceCount}
          fromSender={fromSender}
          providerType={providerType}
          projectName={selectedProjectObj?.name}
          messageContent={messageContent}
          integrations={integrations}
          senderPools={senderPools}
          onSenderPoolsChange={setSenderPools}
          allocationMode={allocationMode}
          onAllocationModeChange={setAllocationMode}
          testPhone={testPhone}
          onTestPhoneChange={setTestPhone}
          onSendTest={handleSendTest}
          isSendingTest={isSendingTest}
          testSendStatus={testSendStatus}
          scheduledAt={scheduledAt}
          onScheduledAtChange={setScheduledAt}
          isSubmitting={isSubmitting}
          onLaunch={handleLaunchCampaign}
          onBack={() => setCurrentStep(3)}
        />
      )}
    </DashboardPageWrapper>
  );
}
