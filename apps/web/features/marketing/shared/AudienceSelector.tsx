"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Users, FileSpreadsheet } from 'lucide-react';
import type { AudienceSourceType, CsvLeadRow, AudienceEstimation } from '../types';
import { AudienceCrmFilters } from './audience/AudienceCrmFilters';
import { AudienceCsvUploader } from './audience/AudienceCsvUploader';
import { AudienceEstimationCard } from './audience/AudienceEstimationCard';

export interface AudienceSelectorProps {
  audienceSource: AudienceSourceType;
  onSourceChange: (source: AudienceSourceType) => void;
  filters: {
    temperatures?: Array<'HOT' | 'WARM' | 'COLD'>;
    statuses?: string[];
    projectId?: string;
    minBudget?: number;
    maxBudget?: number;
  };
  onFiltersChange: (filters: any) => void;
  csvRecipients: CsvLeadRow[];
  onCsvRecipientsChange: (recipients: CsvLeadRow[]) => void;
  saveCsvAsCrmLeads: boolean;
  onSaveCsvAsCrmLeadsChange: (val: boolean) => void;
  projects?: Array<{ id: string; name: string }>;
  apiBaseUrl?: string;
  channel?: 'EMAIL' | 'SMS' | 'VOICE';
  onAudienceCountChange?: (count: number) => void;
}

export function AudienceSelector({
  audienceSource,
  onSourceChange,
  filters,
  onFiltersChange,
  csvRecipients,
  onCsvRecipientsChange,
  saveCsvAsCrmLeads,
  onSaveCsvAsCrmLeadsChange,
  projects = [],
  apiBaseUrl = '',
  channel = 'EMAIL',
  onAudienceCountChange,
}: AudienceSelectorProps) {
  const [csvFileName, setCsvFileName] = useState<string | null>(null);

  // Filter Toggles
  const [enableProjectFilter, setEnableProjectFilter] = useState(Boolean(filters.projectId));
  const [enableTempFilter, setEnableTempFilter] = useState(Boolean(filters.temperatures?.length));
  const [enableBudgetFilter, setEnableBudgetFilter] = useState(Boolean(filters.minBudget));

  const [estimation, setEstimation] = useState<AudienceEstimation>({
    totalCount: 0,
    validEmailCount: 0,
    duplicateCount: 0,
    unsubscribedCount: 0,
    finalAudienceCount: 0,
  });
  const [isEstimating, setIsEstimating] = useState(false);

  // Recalculate preview live from backend
  useEffect(() => {
    let isMounted = true;
    setIsEstimating(true);

    const activeFilters: any = {};

    if (filters.statuses?.length && !filters.statuses.includes('ALL')) {
      activeFilters.statuses = filters.statuses;
    }
    if (enableTempFilter && filters.temperatures?.length) {
      activeFilters.temperatures = filters.temperatures;
    }
    if (enableProjectFilter && filters.projectId) {
      activeFilters.projectId = filters.projectId;
    }
    if (enableBudgetFilter && filters.minBudget) {
      activeFilters.minBudget = filters.minBudget;
    }

    const payload = {
      audienceSource,
      audienceFilters: activeFilters,
      csvRecipients: audienceSource === 'CSV_UPLOAD' ? csvRecipients : undefined,
    };

    const previewEndpoint =
      channel === 'VOICE'
        ? `${apiBaseUrl}/api/marketing/voice/campaigns/estimate-audience`
        : channel === 'SMS'
          ? `${apiBaseUrl}/api/marketing/sms/audience-preview`
          : `${apiBaseUrl}/api/marketing/audience-preview`;

    fetch(previewEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.finalAudienceCount !== undefined) {
          setEstimation(data);
          onAudienceCountChange?.(data.finalAudienceCount);
        }
      })
      .catch(() => {
        if (isMounted) {
          const fallbackCount = audienceSource === 'CSV_UPLOAD' ? csvRecipients.length : 0;
          setEstimation({
            totalCount: fallbackCount,
            validEmailCount: fallbackCount,
            duplicateCount: 0,
            unsubscribedCount: 0,
            finalAudienceCount: fallbackCount,
          });
          onAudienceCountChange?.(fallbackCount);
        }
      })
      .finally(() => {
        if (isMounted) setIsEstimating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [
    audienceSource,
    filters,
    enableProjectFilter,
    enableTempFilter,
    enableBudgetFilter,
    csvRecipients,
    apiBaseUrl,
    channel,
  ]);

  // Handle CSV File Parse
  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a valid .csv file');
      return;
    }

    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) return;

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const emailIdx = headers.findIndex((h) => h.includes('email'));
      const nameIdx = headers.findIndex((h) => h.includes('name'));
      const phoneIdx = headers.findIndex((h) => h.includes('phone') || h.includes('mobile') || h.includes('contact'));
      const cityIdx = headers.findIndex((h) => h.includes('city'));
      const budgetIdx = headers.findIndex((h) => h.includes('budget'));
      const projectIdx = headers.findIndex((h) => h.includes('project'));
      const tempIdx = headers.findIndex((h) => h.includes('temperature'));

      const rows: CsvLeadRow[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
        const email = emailIdx !== -1 ? cols[emailIdx] : '';
        const phone = phoneIdx !== -1 ? cols[phoneIdx] : '';

        if (channel === 'EMAIL' && (!email || !email.includes('@'))) continue;
        if (channel === 'SMS' && !phone && (!email || !email.includes('@'))) continue;
        if (channel === 'VOICE' && !phone) continue;

        rows.push({
          email: email || `user-${i}@csv-import.local`,
          name: nameIdx !== -1 ? cols[nameIdx] : undefined,
          phone: phone || undefined,
          city: cityIdx !== -1 ? cols[cityIdx] : undefined,
          budget: budgetIdx !== -1 ? Number(cols[budgetIdx]) || undefined : undefined,
          interestedProject: projectIdx !== -1 ? cols[projectIdx] : undefined,
          temperature:
            tempIdx !== -1 && ['HOT', 'WARM', 'COLD'].includes(cols[tempIdx]?.toUpperCase())
              ? (cols[tempIdx].toUpperCase() as any)
              : undefined,
        });
      }

      onCsvRecipientsChange(rows);
      onAudienceCountChange?.(rows.length);
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Source Selector Tabs */}
      <div className="grid grid-cols-2 gap-2.5 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80">
        <button
          type="button"
          onClick={() => onSourceChange('CRM_DATABASE')}
          className={`flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl font-extrabold text-xs transition-all ${audienceSource === 'CRM_DATABASE'
              ? 'bg-white text-[var(--text-primary)] shadow-xs border border-slate-200/60'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
            }`}
        >
          <Users className="w-4 h-4 text-[var(--brand-600)]" />
          <span>Filter CRM Database</span>
        </button>

        <button
          type="button"
          onClick={() => onSourceChange('CSV_UPLOAD')}
          className={`flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl font-extrabold text-xs transition-all ${audienceSource === 'CSV_UPLOAD'
              ? 'bg-white text-[var(--text-primary)] shadow-xs border border-slate-200/60'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
            }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Upload CSV / Excel File</span>
        </button>
      </div>

      {/* ── TAB 1: CRM DATABASE FILTERS ── */}
      {audienceSource === 'CRM_DATABASE' && (
        <AudienceCrmFilters
          filters={filters}
          onFiltersChange={onFiltersChange}
          enableTempFilter={enableTempFilter}
          setEnableTempFilter={setEnableTempFilter}
          enableProjectFilter={enableProjectFilter}
          setEnableProjectFilter={setEnableProjectFilter}
          enableBudgetFilter={enableBudgetFilter}
          setEnableBudgetFilter={setEnableBudgetFilter}
          projects={projects}
        />
      )}

      {/* ── TAB 2: CSV / EXCEL UPLOAD ── */}
      {audienceSource === 'CSV_UPLOAD' && (
        <AudienceCsvUploader
          apiBaseUrl={apiBaseUrl}
          csvFileName={csvFileName}
          csvRecipientsLength={csvRecipients.length}
          handleFileUpload={handleFileUpload}
          saveCsvAsCrmLeads={saveCsvAsCrmLeads}
          onSaveCsvAsCrmLeadsChange={onSaveCsvAsCrmLeadsChange}
        />
      )}

      {/* ── LIVE AUDIENCE ESTIMATION BANNER ── */}
      <AudienceEstimationCard
        estimation={estimation}
        isEstimating={isEstimating}
      />
    </div>
  );
}
