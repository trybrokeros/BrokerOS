// ============================================================================
// BrokerOS — SMS Marketing Provider Catalog, Pricing & Constants
// ============================================================================

export const SMS_PROVIDERS = {
  TWILIO: {
    id: 'TWILIO',
    type: 'TWILIO',
    name: 'Twilio Programmable SMS',
    badge: 'Global / High Speed',
    color: '#F22F46',
    docsUrl: 'https://www.twilio.com/docs/sms',
    description: 'Enterprise worldwide SMS delivery with smart Alphanumeric Sender IDs and automatic carrier routing.',
    fields: [
      { key: 'accountSid', label: 'Twilio Account SID', type: 'text', placeholder: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', required: true },
      { key: 'authToken', label: 'Twilio Auth Token', type: 'password', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', required: true },
      { key: 'fromNumber', label: 'Sender ID / Twilio Phone Number', type: 'text', placeholder: '+14155550199 or SKYLINE', required: true },
      { key: 'messagingServiceSid', label: 'Messaging Service SID (Optional)', type: 'text', placeholder: 'MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', required: false },
    ],
    requiresCredentials: true,
  },
  AWS_SNS: {
    id: 'AWS_SNS',
    type: 'AWS_SNS',
    name: 'Amazon Simple Notification Service (SNS)',
    badge: 'Cost Effective',
    color: '#FF9900',
    docsUrl: 'https://docs.aws.amazon.com/sns/',
    description: 'Mass scale global SMS infrastructure with transactional priority & low per-message rates ($0.00645).',
    fields: [
      { key: 'awsAccessKeyId', label: 'AWS Access Key ID', type: 'text', placeholder: 'AKIAIOSFODNN7EXAMPLE', required: true },
      { key: 'awsSecretKey', label: 'AWS Secret Access Key', type: 'password', placeholder: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY', required: true },
      { key: 'awsRegion', label: 'AWS Region', type: 'text', placeholder: 'ap-south-1', required: true },
      { key: 'senderId', label: 'Sender ID Header', type: 'text', placeholder: 'SKYLIN', required: false },
    ],
    requiresCredentials: true,
  },
  SINCH: {
    id: 'SINCH',
    type: 'SINCH',
    name: 'Sinch Enterprise SMS',
    badge: 'Tier-1 Direct Routing',
    color: '#0052FF',
    docsUrl: 'https://developers.sinch.com/docs/sms/',
    description: 'Direct operator connectivity across Europe, North America, and Asia-Pacific with high delivery SLAs.',
    fields: [
      { key: 'servicePlanId', label: 'Sinch Service Plan ID', type: 'text', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', required: true },
      { key: 'apiKey', label: 'Sinch API Token', type: 'password', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', required: true },
      { key: 'fromNumber', label: 'Sender Number / Alphanumeric ID', type: 'text', placeholder: 'SKYLNR', required: true },
    ],
    requiresCredentials: true,
  },
  GUPSHUP: {
    id: 'GUPSHUP',
    type: 'GUPSHUP',
    name: 'Gupshup Enterprise (DLT India)',
    badge: 'India DLT Compliant',
    color: '#10B981',
    docsUrl: 'https://www.gupshup.io/developer/docs',
    description: 'Specialized for India Telecom regulations with TRAI DLT template registration & scrub engine.',
    fields: [
      { key: 'apiKey', label: 'Gupshup API Key', type: 'password', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', required: true },
      { key: 'senderId', label: 'DLT Header / Sender ID (6 Chars)', type: 'text', placeholder: 'SKYLRE', required: true },
      { key: 'dltEntityId', label: 'DLT Principal Entity ID (PE ID)', type: 'text', placeholder: '11015544800000xxxxx', required: true },
    ],
    requiresCredentials: true,
  },
  MULTI_PROVIDER: {
    id: 'MULTI_PROVIDER',
    type: 'MULTI_PROVIDER',
    name: 'Distributed Multi-Gateway',
    badge: 'Multi-Stream',
    color: '#8B5CF6',
    docsUrl: '',
    description: 'Dynamic load distribution across multiple verified sender phone numbers and gateway providers.',
    fields: [],
    requiresCredentials: false,
  },
  INFOBIP: {
    id: 'INFOBIP',
    type: 'INFOBIP',
    name: 'Infobip Omnichannel SMS',
    badge: 'Global Enterprise',
    color: '#FF4500',
    docsUrl: 'https://www.infobip.com/docs/api',
    description: 'High deliverability global carrier connectivity with intelligent fallback routing.',
    fields: [
      { key: 'apiKey', label: 'Infobip API Key', type: 'password', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', required: true },
      { key: 'baseUrl', label: 'Infobip Base URL', type: 'text', placeholder: 'https://xxxxx.api.infobip.com', required: true },
      { key: 'fromNumber', label: 'Sender ID', type: 'text', placeholder: 'SKYLINE', required: true },
    ],
    requiresCredentials: true,
  },
  VONAGE: {
    id: 'VONAGE',
    type: 'VONAGE',
    name: 'Vonage (Nexmo) SMS',
    badge: 'Low Latency',
    color: '#000000',
    docsUrl: 'https://developer.vonage.com/en/messaging/sms/overview',
    description: 'Direct-to-carrier routes with real-time delivery receipts and adaptive routing.',
    fields: [
      { key: 'apiKey', label: 'Vonage API Key', type: 'text', placeholder: 'xxxxxxxx', required: true },
      { key: 'apiSecret', label: 'Vonage API Secret', type: 'password', placeholder: 'xxxxxxxxxxxxxxxx', required: true },
      { key: 'fromNumber', label: 'Sender ID / Phone Number', type: 'text', placeholder: '+14155550199', required: true },
    ],
    requiresCredentials: true,
  },
  TELNYX: {
    id: 'TELNYX',
    type: 'TELNYX',
    name: 'Telnyx Messaging',
    badge: 'Private Backbone',
    color: '#00BFA5',
    docsUrl: 'https://developers.telnyx.com/docs/messaging',
    description: 'Tier-1 IP carrier with private fiber backbone and deep messaging analytics.',
    fields: [
      { key: 'apiKey', label: 'Telnyx API Key', type: 'password', placeholder: 'KEYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', required: true },
      { key: 'fromNumber', label: 'Telnyx Phone Number', type: 'text', placeholder: '+14155550199', required: true },
    ],
    requiresCredentials: true,
  },
  PLIVO: {
    id: 'PLIVO',
    type: 'PLIVO',
    name: 'Plivo SMS Platform',
    badge: 'Cost Efficient',
    color: '#25D366',
    docsUrl: 'https://www.plivo.com/docs/sms/',
    description: 'Developer-friendly global SMS API with direct carrier relationships.',
    fields: [
      { key: 'authId', label: 'Plivo Auth ID', type: 'text', placeholder: 'MAxxxxxxxxxxxxxxxxxx', required: true },
      { key: 'authToken', label: 'Plivo Auth Token', type: 'password', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', required: true },
      { key: 'fromNumber', label: 'Sender ID / Number', type: 'text', placeholder: '+14155550199', required: true },
    ],
    requiresCredentials: true,
  },
  BIRD: {
    id: 'BIRD',
    type: 'BIRD',
    name: 'Bird.com (MessageBird)',
    badge: 'Omnichannel Scale',
    color: '#2481CC',
    docsUrl: 'https://docs.bird.com/api',
    description: 'Modern global SMS API with intelligent fallback routing and high throughput.',
    fields: [
      { key: 'apiKey', label: 'Bird Access Key', type: 'password', placeholder: 'AccessKey xxxxxxxxxxxxxxxxxxxxxxxx', required: true },
      { key: 'fromNumber', label: 'Sender ID / Phone Number', type: 'text', placeholder: '+14155550199 or SKYLIN', required: true },
    ],
    requiresCredentials: true,
  },
} as const;

export const SMS_PROVIDER_LIST = Object.values(SMS_PROVIDERS);

export const SMS_PROVIDER_PRICING_ESTIMATES = {
  TWILIO: { costPerSegmentUSD: 0.0079, costPerSegmentINR: 0.65, label: 'Twilio Programmable (~$0.0079/segment)' },
  AWS_SNS: { costPerSegmentUSD: 0.00645, costPerSegmentINR: 0.54, label: 'AWS SNS Direct (~$0.00645/segment)' },
  SINCH: { costPerSegmentUSD: 0.0072, costPerSegmentINR: 0.60, label: 'Sinch Tier-1 (~$0.0072/segment)' },
  GUPSHUP: { costPerSegmentUSD: 0.0030, costPerSegmentINR: 0.25, label: 'Gupshup India DLT (~₹0.25/msg)' },
  MULTI_PROVIDER: { costPerSegmentUSD: 0.0065, costPerSegmentINR: 0.55, label: 'Distributed Multi-Gateway (~$0.0065/segment)' },
  INFOBIP: { costPerSegmentUSD: 0.0075, costPerSegmentINR: 0.62, label: 'Infobip Enterprise (~$0.0075/segment)' },
  VONAGE: { costPerSegmentUSD: 0.0078, costPerSegmentINR: 0.64, label: 'Vonage Nexmo (~$0.0078/segment)' },
  TELNYX: { costPerSegmentUSD: 0.0050, costPerSegmentINR: 0.42, label: 'Telnyx Elastic (~$0.0050/segment)' },
  PLIVO: { costPerSegmentUSD: 0.0055, costPerSegmentINR: 0.45, label: 'Plivo Direct (~$0.0055/segment)' },
  BIRD: { costPerSegmentUSD: 0.0070, costPerSegmentINR: 0.58, label: 'Bird.com Global (~$0.0070/segment)' },
} as const;

export const SMS_PROVIDER_THROTTLE_LIMITS = {
  TWILIO: { maxPerSecond: 20, delayMs: 15 },
  AWS_SNS: { maxPerSecond: 30, delayMs: 10 },
  SINCH: { maxPerSecond: 20, delayMs: 15 },
  GUPSHUP: { maxPerSecond: 35, delayMs: 10 },
  MULTI_PROVIDER: { maxPerSecond: 50, delayMs: 10 },
  INFOBIP: { maxPerSecond: 25, delayMs: 15 },
  VONAGE: { maxPerSecond: 25, delayMs: 15 },
  TELNYX: { maxPerSecond: 30, delayMs: 10 },
  PLIVO: { maxPerSecond: 25, delayMs: 15 },
  BIRD: { maxPerSecond: 30, delayMs: 12 },
} as const;

export const SMS_ALLOCATION_MODES = {
  AUTO_EVEN: 'AUTO_EVEN',
  CUSTOM_PERCENTAGE: 'CUSTOM_PERCENTAGE',
} as const;

export const SMS_CHAR_LIMITS = {
  GSM_SINGLE_SEGMENT: 160,
  GSM_MULTI_SEGMENT: 153,
  UNICODE_SINGLE_SEGMENT: 70,
  UNICODE_MULTI_SEGMENT: 67,
} as const;

export const GSM_7_REGEX = /^[\x20-\x7E\r\n\f\t\u00A0-\u00FF\u0391-\u03A9\u03B1-\u03C9]*$/;

/**
 * Calculates character segment count and detects GSM-7 vs Unicode encoding.
 */
export function calculateSmsSegments(text: string): {
  charCount: number;
  segments: number;
  isUnicode: boolean;
  remainingInSegment: number;
} {
  const charCount = text ? text.length : 0;
  if (charCount === 0) {
    return { charCount: 0, segments: 1, isUnicode: false, remainingInSegment: SMS_CHAR_LIMITS.GSM_SINGLE_SEGMENT };
  }

  // Check if text has Unicode characters
  const isUnicode = !GSM_7_REGEX.test(text);

  if (isUnicode) {
    if (charCount <= SMS_CHAR_LIMITS.UNICODE_SINGLE_SEGMENT) {
      return {
        charCount,
        segments: 1,
        isUnicode: true,
        remainingInSegment: SMS_CHAR_LIMITS.UNICODE_SINGLE_SEGMENT - charCount,
      };
    }
    const segments = Math.ceil(charCount / SMS_CHAR_LIMITS.UNICODE_MULTI_SEGMENT);
    const remainingInSegment = segments * SMS_CHAR_LIMITS.UNICODE_MULTI_SEGMENT - charCount;
    return { charCount, segments, isUnicode: true, remainingInSegment };
  }

  // GSM-7
  if (charCount <= SMS_CHAR_LIMITS.GSM_SINGLE_SEGMENT) {
    return {
      charCount,
      segments: 1,
      isUnicode: false,
      remainingInSegment: SMS_CHAR_LIMITS.GSM_SINGLE_SEGMENT - charCount,
    };
  }
  const segments = Math.ceil(charCount / SMS_CHAR_LIMITS.GSM_MULTI_SEGMENT);
  const remainingInSegment = segments * SMS_CHAR_LIMITS.GSM_MULTI_SEGMENT - charCount;
  return { charCount, segments, isUnicode: false, remainingInSegment };
}

export const DEFAULT_SMS_QUICK_REPLIES = [
  {
    shortcut: '/brochure',
    title: 'Send Project Brochure',
    text: 'Hi! You can explore the complete brochure, master plan, and unit configurations here: {{projectUrl}}',
  },
  {
    shortcut: '/pricing',
    title: 'Send Starting Price Sheet',
    text: 'Unit prices start from {{project.startingPrice}} with a flexible 10:90 payment scheme. Would you like to see the detailed cost breakdown?',
  },
  {
    shortcut: '/visit',
    title: 'Schedule VIP Site Visit',
    text: 'We have private tours available this Saturday & Sunday. Would morning (11 AM) or afternoon (3 PM) work better for you?',
  },
  {
    shortcut: '/location',
    title: 'Send Location Pin & Directions',
    text: 'Our sales gallery is located at {{project.location}}. Valet parking is available. Location pin: {{projectUrl}}',
  },
  {
    shortcut: '/agent',
    title: 'Senior RM Callback',
    text: 'Our Senior Relationship Manager {{agent.name}} will connect with you in 15 minutes to answer all your queries.',
  },
] as const;

export const DEFAULT_SMS_MERGE_TAGS = [
  { tag: '{{lead.name}}', label: 'Lead Name' },
  { tag: '{{lead.firstName}}', label: 'First Name' },
  { tag: '{{lead.phone}}', label: 'Phone' },
  { tag: '{{lead.city}}', label: 'City' },
  { tag: '{{project.name}}', label: 'Project Name' },
  { tag: '{{project.location}}', label: 'Location' },
  { tag: '{{project.startingPrice}}', label: 'Starting Price' },
  { tag: '{{agent.name}}', label: 'Agent Name' },
  { tag: '{{agent.phone}}', label: 'Agent Phone' },
  { tag: '{{shortUrl}}', label: 'Short Tracking Link' },
] as const;

export const DEFAULT_SMS_TEMPLATES = [
  {
    id: 'tpl_luxury_invitation',
    name: 'Luxury Residence Private Preview',
    category: 'NEW_LAUNCH',
    dltTemplateId: '1107161829000021345',
    content:
      'Dear {{lead.name}}, exclusive preview for {{project.name}}, {{project.location}} starts this weekend. 3 & 4 BHK ultra-luxury residences with golf course views. Book private site visit: {{shortUrl}} - Skyline Realty',
    message:
      'Dear {{lead.name}}, exclusive preview for {{project.name}}, {{project.location}} starts this weekend. 3 & 4 BHK ultra-luxury residences with golf course views. Book private site visit: {{shortUrl}} - Skyline Realty',
  },
  {
    id: 'tpl_price_benefit',
    name: 'Pre-Launch Price Advantage',
    category: 'DISCOUNT_OFFER',
    dltTemplateId: '1107161829000021346',
    content:
      'Hello {{lead.name}}, save up to ₹15 Lakhs on early bookings at {{project.name}}. Starting at {{project.startingPrice}}. Special 10:90 payment plan valid till Sunday: {{shortUrl}} - Skyline',
    message:
      'Hello {{lead.name}}, save up to ₹15 Lakhs on early bookings at {{project.name}}. Starting at {{project.startingPrice}}. Special 10:90 payment plan valid till Sunday: {{shortUrl}} - Skyline',
  },
  {
    id: 'tpl_site_visit_reminder',
    name: 'Confirmed Site Visit Pass',
    category: 'SITE_VISIT',
    dltTemplateId: '1107161829000021347',
    content:
      'Hi {{lead.name}}, your VIP access pass for {{project.name}} is confirmed for tomorrow. Location & valet details: {{shortUrl}}. Relationship Mgr: {{agent.name}} ({{agent.phone}}) - Skyline',
    message:
      'Hi {{lead.name}}, your VIP access pass for {{project.name}} is confirmed for tomorrow. Location & valet details: {{shortUrl}}. Relationship Mgr: {{agent.name}} ({{agent.phone}}) - Skyline',
  },
  {
    id: 'tpl_possession_ready',
    name: 'Ready to Move-in Notice',
    category: 'READY_INVENTORY',
    dltTemplateId: '1107161829000021348',
    content:
      'Dear {{lead.name}}, OC received for {{project.name}}! Zero GST benefit on remaining ready-to-move-in luxury units. Schedule key handover tour: {{shortUrl}} - Skyline Realty',
    message:
      'Dear {{lead.name}}, OC received for {{project.name}}! Zero GST benefit on remaining ready-to-move-in luxury units. Schedule key handover tour: {{shortUrl}} - Skyline Realty',
  },
] as const;
