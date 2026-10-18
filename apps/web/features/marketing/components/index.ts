// Shared Marketing Components
export { AudienceSelector } from "../shared/AudienceSelector";
export type { AudienceSelectorProps } from "../shared/AudienceSelector";
export { CampaignWizardStepper } from "../shared/CampaignWizardStepper";
export type { WizardStepItem } from "../shared/CampaignWizardStepper";
export { MarketingChannelGrid } from "./MarketingChannelGrid";
export type { MarketingChannelGridProps } from "./MarketingChannelGrid";
export { UnifiedBroadcastsTable } from "./UnifiedBroadcastsTable";
export type { UnifiedBroadcastsTableProps, UnifiedBroadcastItem } from "./UnifiedBroadcastsTable";

// Email Marketing Components & Wizards
export { EmailCampaignListTable } from "../email/components/EmailCampaignListTable";
export { EmailFunnelAnalytics } from "../email/components/EmailFunnelAnalytics";
export { EmailRecipientTable } from "../email/components/EmailRecipientTable";
export { EmailTemplatePicker, REAL_ESTATE_TEMPLATES } from "../email/components/EmailTemplatePicker";
export type { TemplateOption } from "../email/components/EmailTemplatePicker";
export { EmailProviderConfigCard } from "../email/components/EmailProviderConfigCard";
export type { IntegrationRecord } from "../email/components/EmailProviderConfigCard";
export { EmailMergeTagSelector } from "../email/components/EmailMergeTagSelector";

// Email Wizard Steps
export { EmailStep1ProjectSender } from "../email/wizard/EmailStep1ProjectSender";
export { EmailStep2Audience } from "../email/wizard/EmailStep2Audience";
export { EmailStep3TemplateEditor } from "../email/wizard/EmailStep3TemplateEditor";
export { EmailStep4ReviewLaunch } from "../email/wizard/EmailStep4ReviewLaunch";

// SMS Marketing Components & Wizards
export { SmsCampaignListTable } from "../sms/components/SmsCampaignListTable";
export { SmsFunnelAnalytics } from "../sms/components/SmsFunnelAnalytics";
export { SmsRecipientTable } from "../sms/components/SmsRecipientTable";
export { SmsMessageEditor } from "../sms/components/SmsMessageEditor";
export { SmsPhoneMockup } from "../sms/components/SmsPhoneMockup";
export { SmsPreFlightModal } from "../sms/components/SmsPreFlightModal";
export { SmsProviderConfigCard } from "../sms/components/SmsProviderConfigCard";
export type { SmsIntegrationRecord } from "../sms/components/SmsProviderConfigCard";
export { SmsAiConfigCard } from "../sms/components/settings/SmsAiConfigCard";
export { SmsTagsAndQuickReplies } from "../sms/components/settings/SmsTagsAndQuickReplies";
export { SmsWebhookDiagnostics } from "../sms/components/settings/SmsWebhookDiagnostics";

// SMS Wizard Steps
export { SmsStep1ProjectGateway } from "../sms/wizard/SmsStep1ProjectGateway";
export { SmsStep2Audience } from "../sms/wizard/SmsStep2Audience";
export { SmsStep3MessageMockup } from "../sms/wizard/SmsStep3MessageMockup";
export { SmsStep4ReviewLaunch } from "../sms/wizard/SmsStep4ReviewLaunch";

// Legacy compatibility re-exports
export { EmailCampaignListTable as CampaignListTable } from "../email/components/EmailCampaignListTable";
export { EmailFunnelAnalytics as CampaignFunnelAnalytics } from "../email/components/EmailFunnelAnalytics";
export { EmailRecipientTable as RecipientActivityTable } from "../email/components/EmailRecipientTable";
export { EmailProviderConfigCard as ProviderConfigCard } from "../email/components/EmailProviderConfigCard";
export { EmailMergeTagSelector as MergeTagSelector } from "../email/components/EmailMergeTagSelector";
export { SmsRecipientTable as SmsRecipientActivityTable } from "../sms/components/SmsRecipientTable";

// Scheduled Messaging Components
export { ScheduleMessageModal } from "./ScheduleMessageModal";
export type { ScheduleMessageModalProps, ScheduleModalPayload } from "./ScheduleMessageModal";
export { ScheduledMessagesDock } from "./ScheduledMessagesDock";
export type { ScheduledMessagesDockProps } from "./ScheduledMessagesDock";

// Unified Inbox Components
export { ConversationStatusDropdown } from "./ConversationStatusDropdown";
export type { ConversationStatus } from "./ConversationStatusDropdown";
export { CrmContextBadges } from "./CrmContextBadges";
export type { CrmContextData } from "./CrmContextBadges";


