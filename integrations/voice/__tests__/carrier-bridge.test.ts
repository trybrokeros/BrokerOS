import { describe, it, expect } from 'vitest';
import { tryCarrierBridgeDispatch } from '../bridge/carrier-bridge-dispatcher.js';

describe('@brokeros/int-voice — Carrier Bridge Dispatcher Tests', () => {
  it('returns handled: false when telephonyCredentials are not provided (direct platform mode)', async () => {
    const result = await tryCarrierBridgeDispatch('vapi', {
      toPhone: '+919800000000',
      prompt: 'Test script',
    });

    expect(result.handled).toBe(false);
    expect(result.result).toBeUndefined();
  });

  it('handles Vobiz bridge and flags missing credentials gracefully', async () => {
    const result = await tryCarrierBridgeDispatch('vapi', {
      toPhone: '+919800000000',
      prompt: 'Test script',
      telephonyCredentials: {
        provider: 'VOBIZ',
      } as any,
    });

    expect(result.handled).toBe(true);
    expect(result.result?.success).toBe(false);
    expect(result.result?.error).toContain('Vobiz Auth ID and Auth Token are required');
  });

  it('handles Twilio bridge and flags missing SID or AuthToken gracefully', async () => {
    const result = await tryCarrierBridgeDispatch('vapi', {
      toPhone: '+919800000000',
      prompt: 'Test script',
      telephonyCredentials: {
        provider: 'TWILIO',
      } as any,
    });

    expect(result.handled).toBe(true);
    expect(result.result?.success).toBe(false);
    expect(result.result?.error).toContain('Twilio Account SID and Auth Token are required');
  });

  it('handles Exotel bridge and flags missing registered caller ID gracefully', async () => {
    const result = await tryCarrierBridgeDispatch('vapi', {
      toPhone: '+919800000000',
      prompt: 'Test script',
      telephonyCredentials: {
        provider: 'EXOTEL',
        apiKey: 'test_key',
        apiToken: 'test_token',
      } as any,
    });

    expect(result.handled).toBe(true);
    expect(result.result?.success).toBe(false);
    expect(result.result?.error).toContain('Exotel requires a registered Caller ID / Virtual Number');
  });

  it('handles Telnyx bridge and flags missing API Key gracefully', async () => {
    const result = await tryCarrierBridgeDispatch('vapi', {
      toPhone: '+919800000000',
      prompt: 'Test script',
      telephonyCredentials: {
        provider: 'TELNYX',
      } as any,
    });

    expect(result.handled).toBe(true);
    expect(result.result?.success).toBe(false);
    expect(result.result?.error).toContain('Telnyx API Key is required');
  });
});
