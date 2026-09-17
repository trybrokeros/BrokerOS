// ============================================================================
// BrokerOS — Voice Telephony Carrier Types & Interfaces
// ============================================================================

export type VoiceTelephonyType = 'TWILIO' | 'VOBIZ' | 'EXOTEL' | 'TELNYX' | 'AMAZON_CONNECT';
export const VOICE_TELEPHONY_TYPES: VoiceTelephonyType[] = ['TWILIO', 'VOBIZ', 'EXOTEL', 'TELNYX', 'AMAZON_CONNECT'];

export interface VoiceTelephonyCredentials {
  provider?: VoiceTelephonyType;
  accountSid?: string;
  authToken?: string;
  apiKey?: string;
  apiToken?: string;
  subdomain?: string;
  sipDomain?: string;
  fromNumbers?: string[];
}

export interface IVoiceTelephonyProvider {
  readonly providerType: VoiceTelephonyType;
  validateCredentials(credentials?: VoiceTelephonyCredentials): Promise<boolean>;
  testCarrierCall(
    toPhone: string,
    fromNumber: string,
    credentials?: VoiceTelephonyCredentials,
  ): Promise<{ success: boolean; callId?: string; error?: string }>;
}
