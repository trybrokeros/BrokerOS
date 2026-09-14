"use client";

import React from "react";
import { Check, ArrowRight } from "lucide-react";
import {
  type TemplateOption,
  REAL_ESTATE_TEMPLATES,
} from "../templates/catalog";

// Re-export for backward-compatible consumer imports
export type { TemplateOption };
export { REAL_ESTATE_TEMPLATES };

interface EmailTemplatePickerProps {
  selectedTemplateId: string;
  onSelectTemplate: (tmpl: TemplateOption) => void;
}

export function EmailTemplatePicker({
  selectedTemplateId,
  onSelectTemplate,
}: EmailTemplatePickerProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
      {REAL_ESTATE_TEMPLATES.map((tmpl) => {
        const isSelected = selectedTemplateId === tmpl.id;
        const Icon = tmpl.icon;

        return (
          <div
            key={tmpl.id}
            onClick={() => onSelectTemplate(tmpl)}
            className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-150 active:scale-[0.99] flex flex-col justify-between ${
              isSelected
                ? "bg-purple-50/60 border-[var(--brand-500)] shadow-xs ring-2 ring-purple-500/15"
                : "bg-slate-50/60 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? "bg-[var(--brand-600)] text-white shadow-xs"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-extrabold text-xs text-[var(--text-primary)]">
                    {tmpl.name}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    isSelected
                      ? "bg-[var(--brand-600)] text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {tmpl.badge}
                </span>
              </div>

              <p className="text-[11px] font-medium text-[var(--text-tertiary)] line-clamp-2 leading-relaxed">
                {tmpl.preview}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-[10px] font-bold text-[var(--text-muted)] truncate max-w-[200px]">
                {tmpl.subject}
              </span>
              {isSelected ? (
                <div className="flex items-center gap-1 text-[11px] font-extrabold text-[var(--brand-600)]">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Selected</span>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]">
                  <span>Select</span>
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
