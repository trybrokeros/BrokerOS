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
import { EmailStep1ProjectSender } from "@/features/marketing/email/wizard/EmailStep1ProjectSender";
import { EmailStep2Audience } from "@/features/marketing/email/wizard/EmailStep2Audience";
import { EmailStep3TemplateEditor } from "@/features/marketing/email/wizard/EmailStep3TemplateEditor";
import { EmailStep4ReviewLaunch } from "@/features/marketing/email/wizard/EmailStep4ReviewLaunch";
import { REAL_ESTATE_TEMPLATES, type TemplateOption } from "@/features/marketing/email/components/EmailTemplatePicker";
import type {
  AudienceSourceType,
  CsvLeadRow,
  EmailProviderType,
  EmailIntegrationItem,
} from "@/features/marketing/types";
import type {
  CampaignSenderPoolConfig,
  PreFlightCostSummary,
} from "@brokeros/types";

const DRAFT_STORAGE_KEY = "brokeros_campaign_draft_v1";

const WIZARD_STEPS = [
  { num: 1, label: "Campaign Info", desc: "Title & Project Scope" },
  { num: 2, label: "Audience Target", desc: "CRM Filter or CSV" },
  { num: 3, label: "Template & Content", desc: "Visual Email Body" },
  { num: 4, label: "Provider & Launch", desc: "Engine & Pre-flight" },
];

export default function NewEmailCampaignPage() {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

  // Step Tracker
  const [currentStep, setCurrentStep] = useState(1);

  // Form State: Step 1
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [isCpCampaign, setIsCpCampaign] = useState(false);
  const [fromName, setFromName] = useState("Sales Team");
  const [fromEmail, setFromEmail] = useState("");
  const [replyTo, setReplyTo] = useState("");

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

  // Form State: Step 3 (Template & Content)
  const [selectedTemplateId, setSelectedTemplateId] = useState("project-launch");
  const [subject, setSubject] = useState(REAL_ESTATE_TEMPLATES[0].subject);
  const [htmlContent, setHtmlContent] = useState(REAL_ESTATE_TEMPLATES[0].htmlContent);

  // Form State: Step 4 (Provider Selection & Test)
  const [providerType, setProviderType] = useState<EmailProviderType>("SYSTEM_DEFAULT");
  const [senderPools, setSenderPools] = useState<CampaignSenderPoolConfig[]>([]);
  const [allocationMode, setAllocationMode] = useState<"AUTO_EVEN" | "CUSTOM_PERCENTAGE">("AUTO_EVEN");
  const [costEstimate, setCostEstimate] = useState<PreFlightCostSummary | null>(null);
  const [isLoadingEstimate, setIsLoadingEstimate] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSendStatus, setTestSendStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  // External data
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [integrations, setIntegrations] = useState<EmailIntegrationItem[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Draft Auto-Save State
  const [draftCampaignId, setDraftCampaignId] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch Projects and Integrations
  useEffect(() => {
    async function loadResources() {
      try {
        setIsLoadingProjects(true);
        const [projRes, intRes] = await Promise.all([
          fetch(`${baseUrl}/api/marketing/projects`),
          fetch(`${baseUrl}/api/marketing/integrations`),
        ]);

        if (projRes.ok) {
          const pData = await projRes.json();
          setProjects(pData || []);
        }
        if (intRes.ok) {
          const iData = await intRes.json();
          setIntegrations(iData || []);
        }
      } catch {
        // Ignore network errors on init
      } finally {
        setIsLoadingProjects(false);
      }
    }
    loadResources();
  }, [baseUrl]);

  // 2. Restore Draft from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.title) setTitle(draft.title);
        if (draft.projectId) setProjectId(draft.projectId);
        if (draft.isCpCampaign !== undefined) setIsCpCampaign(draft.isCpCampaign);
        if (draft.fromName) setFromName(draft.fromName);
        if (draft.fromEmail) setFromEmail(draft.fromEmail);
        if (draft.replyTo) setReplyTo(draft.replyTo);
        if (draft.audienceSource) setAudienceSource(draft.audienceSource);
        if (draft.filters) setFilters(draft.filters);
        if (draft.csvRecipients) setCsvRecipients(draft.csvRecipients);
        if (draft.saveCsvAsCrmLeads !== undefined) setSaveCsvAsCrmLeads(draft.saveCsvAsCrmLeads);
        if (draft.selectedTemplateId) setSelectedTemplateId(draft.selectedTemplateId);
        if (draft.subject) setSubject(draft.subject);
        if (draft.htmlContent) setHtmlContent(draft.htmlContent);
        if (draft.providerType) setProviderType(draft.providerType);
        if (draft.senderPools) setSenderPools(draft.senderPools);
        if (draft.allocationMode) setAllocationMode(draft.allocationMode);
        if (draft.draftCampaignId) setDraftCampaignId(draft.draftCampaignId);
        if (draft.currentStep) setCurrentStep(draft.currentStep);
        setHasRestoredDraft(true);
      }
    } catch {
      // LocalStorage parse error
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
        fromName,
        fromEmail,
        replyTo: replyTo || undefined,
        audienceSource,
        audienceFilters: audienceSource === "CRM_DATABASE" ? filters : undefined,
        csvRecipients: audienceSource === "CSV_UPLOAD" ? csvRecipients : undefined,
        saveCsvAsCrmLeads,
        selectedTemplateId,
        subject,
        htmlContent,
        providerType,
        senderPools,
        allocationMode,
        currentStep,
      };

      // Save to localStorage
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftState));

      // Save to Database
      const res = await fetch(`${baseUrl}/api/marketing/campaigns/draft`, {
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
      // Ignore background draft save errors
    } finally {
      setIsSavingDraft(false);
    }
  }, [
    baseUrl,
    draftCampaignId,
    title,
    projectId,
    isCpCampaign,
    fromName,
    fromEmail,
    replyTo,
    audienceSource,
    filters,
    csvRecipients,
    saveCsvAsCrmLeads,
    selectedTemplateId,
    subject,
    htmlContent,
    providerType,
    senderPools,
    allocationMode,
    currentStep,
  ]);

  // Cost Estimation Fetcher
  const fetchCostEstimate = useCallback(
    async (pools: CampaignSenderPoolConfig[], totalCount: number) => {
      if (!pools || pools.length === 0) return;
      try {
        setIsLoadingEstimate(true);
        const res = await fetch(`${baseUrl}/api/marketing/campaigns/cost-estimate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            totalLeads: totalCount,
            senderPools: pools,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setCostEstimate(data);
        }
      } catch {
        // Fallback calculation in PreFlightModal handles network issues
      } finally {
        setIsLoadingEstimate(false);
      }
    },
    [baseUrl]
  );

  useEffect(() => {
    if (currentStep === 4 && senderPools.length > 0) {
      const totalCount = audienceSource === "CSV_UPLOAD" ? csvRecipients.length : 1000;
      fetchCostEstimate(senderPools, totalCount);
    }
  }, [currentStep, senderPools, audienceSource, csvRecipients.length, fetchCostEstimate]);

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
  }, [title, projectId, subject, htmlContent, fromName, fromEmail, filters, audienceSource, saveDraftToDatabase]);

  // 5. Clear / Discard Draft
  const handleDiscardDraft = async () => {
    if (confirm("Are you sure you want to discard this draft and start fresh?")) {
      if (draftCampaignId) {
        try {
          await fetch(`${baseUrl}/api/marketing/campaigns/${draftCampaignId}`, {
            method: "DELETE",
          });
        } catch {
          // Ignore network cleanup errors
        }
      }
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setTitle("");
      setProjectId("");
      setIsCpCampaign(false);
      setFromName("Sales Team");
      setFromEmail("");
      setReplyTo("");
      setAudienceSource("CRM_DATABASE");
      setFilters({ statuses: [], temperatures: [], projectId: undefined, minBudget: undefined });
      setCsvRecipients([]);
      setSaveCsvAsCrmLeads(true);
      setSelectedTemplateId("project-launch");
      setSubject(REAL_ESTATE_TEMPLATES[0].subject);
      setHtmlContent(REAL_ESTATE_TEMPLATES[0].htmlContent);
      setProviderType("SYSTEM_DEFAULT");
      setSenderPools([]);
      setAllocationMode("AUTO_EVEN");
      setCostEstimate(null);
      setDraftCampaignId(null);
      setLastSavedTime(null);
      setHasRestoredDraft(false);
      setCurrentStep(1);
    }
  };

  const handleSelectTemplate = (tmpl: TemplateOption) => {
    setSelectedTemplateId(tmpl.id);
    setSubject(tmpl.subject);
    setHtmlContent(tmpl.htmlContent);
  };

  // 6. Test Email Dispatch
  const handleSendTest = async () => {
    if (!testEmail || !testEmail.includes("@")) {
      setTestSendStatus({ ok: false, msg: "Please enter a valid recipient email address." });
      return;
    }

    setIsSendingTest(true);
    setTestSendStatus(null);
    try {
      const activePool = senderPools[0];
      const activeInt = integrations.find((i) =>
        activePool?.integrationId ? i.id === activePool.integrationId : i.provider === providerType && i.isActive
      );
      const testFromEmail = activePool?.fromEmail || activeInt?.fromEmail || "";
      const testFromName = activePool?.fromName || activeInt?.fromName || "Sales Team";

      const res = await fetch(`${baseUrl}/api/marketing/campaigns/send-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: testEmail,
          toEmail: testEmail,
          subject: subject || "Test Email Preview",
          htmlContent: htmlContent || "<p>Hello test</p>",
          fromName: testFromName,
          fromEmail: testFromEmail,
          replyTo: replyTo || undefined,
          providerType: activePool?.provider || providerType,
          integrationId: activeInt?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to send test email");

      setTestSendStatus({
        ok: true,
        msg: `Test email dispatched to ${testEmail} via ${data.provider}. Check your inbox.`,
      });
    } catch (err: any) {
      setTestSendStatus({ ok: false, msg: err?.message || "Test dispatch error" });
    } finally {
      setIsSendingTest(false);
    }
  };

  // 7. Launch Campaign
  const handleLaunchCampaign = async () => {
    if (!title.trim()) {
      toast.error("Please provide a campaign title.");
      setCurrentStep(1);
      return;
    }
    if (audienceSource === "CSV_UPLOAD" && csvRecipients.length === 0) {
      toast.error("Please upload a CSV file with valid contacts.");
      setCurrentStep(2);
      return;
    }

    const activePool = senderPools[0];
    const activeInt = integrations.find((i) =>
      activePool?.integrationId ? i.id === activePool.integrationId : i.provider === providerType && i.isActive
    );
    const resolvedProviderType = senderPools.length > 1 ? "MULTI_PROVIDER" : (activePool?.provider || providerType);
    const resolvedFromEmail = activePool?.fromEmail || activeInt?.fromEmail || "";
    const resolvedFromName = activePool?.fromName || activeInt?.fromName || "Sales Team";

    setIsSubmitting(true);
    try {
      const payload = {
        campaignId: draftCampaignId || undefined,
        title,
        projectId: projectId || undefined,
        isCpCampaign,
        fromName: resolvedFromName,
        fromEmail: resolvedFromEmail,
        replyTo: replyTo || undefined,
        audienceSource,
        audienceFilters: audienceSource === "CRM_DATABASE" ? filters : undefined,
        csvRecipients: audienceSource === "CSV_UPLOAD" ? csvRecipients : undefined,
        saveCsvAsCrmLeads: audienceSource === "CSV_UPLOAD" ? saveCsvAsCrmLeads : false,
        subject,
        htmlContent,
        providerType: resolvedProviderType,
        integrationId: activeInt?.id,
        senderPools: senderPools.length > 0 ? senderPools : undefined,
        allocationMode,
      };

      const res = await fetch(`${baseUrl}/api/marketing/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.message || "Failed to create campaign");
      }

      // Cleanup local draft on successful launch
      localStorage.removeItem(DRAFT_STORAGE_KEY);

      const data = await res.json();
      toast.success("Email campaign launched successfully");
      router.push(`/dashboard/marketing/email/campaigns/${data.id}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to launch campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProjectObj = projects.find((p) => p.id === projectId);

  return (
    <DashboardPageWrapper
      loading={false}
      title="Create Email Campaign"
      subtitle="Follow the step-by-step wizard to target buyers, compose rich HTML templates, and dispatch high-deliverability emails."
      headerRight={
        <div className="flex items-center gap-2.5">
          {/* Auto-Save & Discard Controls */}
          {(draftCampaignId || lastSavedTime) && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-[var(--text-secondary)] shadow-xs">
              <Save className={`w-3.5 h-3.5 ${isSavingDraft ? "animate-spin text-[var(--brand-600)]" : "text-emerald-600"}`} />
              <span>
                {isSavingDraft ? "Saving draft..." : lastSavedTime ? `Draft saved (${lastSavedTime})` : "Draft saved in DB"}
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

          <Link href="/dashboard/marketing/email">
            <Button variant="outline" size="sm" className="gap-2 text-xs font-bold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Campaigns</span>
            </Button>
          </Link>
        </div>
      }
    >
      {/* ── RESTORED DRAFT BANNER ── */}
      {hasRestoredDraft && (
        <div className="bg-purple-50/80 border border-purple-200/90 rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <RotateCcw className="w-4 h-4 text-[var(--brand-600)]" />
            <span className="text-xs font-bold text-[var(--brand-900)]">
              Restored in-progress campaign draft. Your progress is automatically saved to the database.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setHasRestoredDraft(false)}
            className="text-xs font-bold text-[var(--brand-700)] hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── STEPPER HEADER ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <CampaignWizardStepper
          steps={WIZARD_STEPS}
          currentStep={currentStep}
          onStepClick={(stepNum) => setCurrentStep(stepNum)}
          accentColor="purple"
        />
      </div>

      {/* ── STEP 1: CAMPAIGN INFORMATION ── */}
      {currentStep === 1 && (
        <EmailStep1ProjectSender
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
        <EmailStep2Audience
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
          onBack={() => setCurrentStep(1)}
          onNext={() => setCurrentStep(3)}
        />
      )}

      {/* ── STEP 3: TEMPLATE & CONTENT COMPOSER ── */}
      {currentStep === 3 && (
        <EmailStep3TemplateEditor
          selectedTemplateId={selectedTemplateId}
          onSelectTemplate={handleSelectTemplate}
          subject={subject}
          onSubjectChange={setSubject}
          htmlContent={htmlContent}
          onHtmlContentChange={setHtmlContent}
          selectedProjectName={selectedProjectObj?.name}
          fromName={fromName}
          onBack={() => setCurrentStep(2)}
          onNext={() => setCurrentStep(4)}
        />
      )}

      {/* ── STEP 4: PROVIDER SELECTION & PRE-FLIGHT LAUNCH ── */}
      {currentStep === 4 && (
        <EmailStep4ReviewLaunch
          audienceSource={audienceSource}
          csvRecipients={csvRecipients}
          totalAudienceCount={audienceSource === "CSV_UPLOAD" ? csvRecipients.length : 1000}
          projectName={selectedProjectObj?.name}
          isCpCampaign={isCpCampaign}
          fromName={fromName}
          fromEmail={fromEmail}
          providerType={providerType}
          onProviderTypeChange={setProviderType}
          integrations={integrations}
          senderPools={senderPools}
          onSenderPoolsChange={setSenderPools}
          allocationMode={allocationMode}
          onAllocationModeChange={setAllocationMode}
          testEmail={testEmail}
          onTestEmailChange={setTestEmail}
          onSendTest={handleSendTest}
          isSendingTest={isSendingTest}
          testSendStatus={testSendStatus}
          isSubmitting={isSubmitting}
          onLaunch={handleLaunchCampaign}
          onBack={() => setCurrentStep(3)}
          costEstimate={costEstimate}
          isLoadingEstimate={isLoadingEstimate}
        />
      )}
    </DashboardPageWrapper>
  );
}
