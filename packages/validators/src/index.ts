/**
 * @brokeros/validators
 *
 * Shared Zod schemas for BrokerOS across API, Web, and Mobile.
 */

import { z } from 'zod';

export const PhoneSchema = z
  .string()
  .trim()
  .min(8, 'Phone number too short')
  .max(16, 'Phone number too long')
  .regex(/^\+?[1-9]\d{6,14}$/, 'Invalid international E.164 phone number format');

export const LeadTemperatureEnum = z.enum(['HOT', 'WARM', 'COLD']);
export const LeadStatusEnum = z.enum([
  'NEW',
  'CONTACTED',
  'FOLLOW_UP_SCHEDULED',
  'SITE_VISIT_SCHEDULED',
  'SITE_VISIT_COMPLETED',
  'NEGOTIATION',
  'BOOKED',
  'LOST',
]);

export const CreateLeadSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  phone: PhoneSchema,
  email: z.string().email('Invalid email address').optional().nullable(),
  city: z.string().trim().optional().nullable(),
  budget: z.number().nonnegative('Budget must be a positive number').optional().nullable(),
  temperature: LeadTemperatureEnum.default('WARM'),
  status: LeadStatusEnum.default('NEW'),
  projectId: z.string().uuid('Invalid project ID').optional().nullable(),
  source: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
});

export const CampaignChannelEnum = z.enum(['EMAIL', 'SMS', 'VOICE', 'WHATSAPP']);
export const AudienceSourceEnum = z.enum(['CRM_DATABASE', 'CSV_UPLOAD', 'HYBRID']);

export const CreateCampaignSchema = z.object({
  title: z.string().trim().min(3, 'Campaign title must be at least 3 characters'),
  channel: CampaignChannelEnum,
  projectId: z.string().uuid('Invalid project ID').optional().nullable(),
  isCpCampaign: z.boolean().default(false),
  audienceSource: AudienceSourceEnum.default('CRM_DATABASE'),
  scheduledAt: z.string().datetime({ offset: true }).optional().nullable(),
  messageContent: z.string().trim().optional().nullable(),
  scriptPrompt: z.string().trim().optional().nullable(),
});

export const SiteVisitVerificationSchema = z.object({
  siteVisitId: z.string().uuid('Invalid site visit ID'),
  latitude: z.number().min(-90).max(90, 'Invalid latitude'),
  longitude: z.number().min(-180).max(180, 'Invalid longitude'),
  selfieUrl: z.string().url('Invalid selfie media URL'),
  notes: z.string().optional().nullable(),
});

export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;
export type CreateCampaignInput = z.infer<typeof CreateCampaignSchema>;
export type SiteVisitVerificationInput = z.infer<typeof SiteVisitVerificationSchema>;
