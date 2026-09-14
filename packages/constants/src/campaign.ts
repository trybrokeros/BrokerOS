// ============================================================================
// BrokerOS — Shared Campaign & Merge Tag Constants
// ============================================================================

export const USD_TO_INR_EXCHANGE_RATE = 95;

export const CAMPAIGN_STATUS_CONFIG = {
  DRAFT: { label: 'Draft', color: 'slate', bg: 'bg-slate-50 text-slate-700 border border-slate-200/70 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800' },
  PENDING: { label: 'Pending', color: 'slate', bg: 'bg-slate-50 text-slate-700 border border-slate-200/70 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800' },
  SCHEDULED: { label: 'Scheduled', color: 'slate', bg: 'bg-slate-50 text-slate-700 border border-slate-200/70 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800' },
  PROCESSING: { label: 'Sending...', color: 'slate', bg: 'bg-slate-50/80 text-blue-700 border border-blue-200/60 dark:bg-slate-950/40 dark:text-blue-400 dark:border-blue-800/40' },
  RUNNING: { label: 'Active', color: 'slate', bg: 'bg-slate-50/80 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40' },
  ACTIVE: { label: 'Active', color: 'slate', bg: 'bg-slate-50/80 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40' },
  COMPLETED: { label: 'Completed', color: 'slate', bg: 'bg-slate-50/80 text-green-700 border border-green-200/60 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800' }, // green
  PAUSED: { label: 'Paused', color: 'slate', bg: 'bg-slate-50/80 text-yellow-700 border border-slate-200/70 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800' }, // yellow
  FAILED: { label: 'Failed', color: 'slate', bg: 'bg-slate-50/80 text-red-700 border border-slate-200/70 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800' }, // red
  CANCELLED: { label: 'Cancelled', color: 'slate', bg: 'bg-slate-50/80 text-gray-700 border border-slate-200/70 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800' }, // gray
} as const;

export const DEFAULT_MERGE_TAGS = [
  { tag: '{{lead.firstName}}', label: 'Lead First Name', sample: 'Rahul' },
  { tag: '{{lead.lastName}}', label: 'Lead Last Name', sample: 'Sharma' },
  { tag: '{{lead.fullName}}', label: 'Lead Full Name', sample: 'Rahul Sharma' },
  { tag: '{{lead.city}}', label: 'Lead City', sample: 'Mumbai' },
  { tag: '{{project.name}}', label: 'Project Name', sample: 'Skyline Luxuria' },
  { tag: '{{project.startingPrice}}', label: 'Starting Price', sample: '₹1.45 Cr' },
  { tag: '{{project.location}}', label: 'Project Location', sample: 'Bandra West, Mumbai' },
  { tag: '{{project.brochureUrl}}', label: 'Brochure Link', sample: 'https://brokeros.io/brochure/skyline' },
  { tag: '{{agent.name}}', label: 'Assigned Agent Name', sample: 'Amit Verma' },
  { tag: '{{agent.phone}}', label: 'Assigned Agent Phone', sample: '+91 98765 43210' },
  { tag: '{{unsubscribeUrl}}', label: 'Unsubscribe Link', sample: 'https://brokeros.io/api/marketing/unsubscribe?id=...' },
] as const;

export const SAMPLE_CSV_HEADERS = [
  'Full Name',
  'Email',
  'Phone Number',
  'City',
  'Budget (INR)',
  'Interested Project',
  'Lead Temperature (HOT/WARM/COLD)',
  'Tags',
] as const;

export const SAMPLE_CSV_CONTENT = `Full Name,Email,Phone Number,City,Budget (INR),Interested Project,Lead Temperature (HOT/WARM/COLD),Tags
Rahul Sharma,rahul.sharma@example.com,+919876543210,Mumbai,15000000,Skyline Luxuria,HOT,Investor;Luxury
Priya Patel,priya.patel@example.com,+919812345678,Pune,8500000,Green Valley,WARM,First-Time Buyer
Amit Verma,amit.verma@example.com,+919823456789,Bangalore,22000000,Signature Towers,COLD,NRI;Penthouse
Sneha Reddy,sneha.reddy@example.com,+919834567890,Hyderabad,12000000,Skyline Luxuria,HOT,High-Net-Worth
Vikram Malhotra,vikram.m@example.com,+919845678901,Delhi NCR,18000000,Signature Towers,WARM,Ready-To-Move
`;
