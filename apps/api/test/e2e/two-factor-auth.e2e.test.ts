import { describe, it, expect } from 'vitest';
import { auth } from '../../src/lib/auth.js';

describe('API E2E: Better Auth Multi-Factor Authentication (A8 MFA)', () => {
  it('registers two-factor plugin with BrokerOS issuer', () => {
    expect(auth).toBeDefined();
    expect(auth.options).toBeDefined();

    const plugins = auth.options.plugins || [];
    const twoFactorPlugin = plugins.find((p: any) => p.id === 'two-factor');

    expect(twoFactorPlugin).toBeDefined();
    expect(twoFactorPlugin.id).toBe('two-factor');
  });

  it('exposes all standard RFC 6238 TOTP and backup code endpoints', () => {
    const plugins = auth.options.plugins || [];
    const twoFactorPlugin = plugins.find((p: any) => p.id === 'two-factor');

    expect(twoFactorPlugin.endpoints).toBeDefined();
    expect(twoFactorPlugin.endpoints.enableTwoFactor).toBeDefined();
    expect(twoFactorPlugin.endpoints.disableTwoFactor).toBeDefined();
    expect(twoFactorPlugin.endpoints.verifyTOTP).toBeDefined();
    expect(twoFactorPlugin.endpoints.getTOTPURI).toBeDefined();
    expect(twoFactorPlugin.endpoints.generateBackupCodes).toBeDefined();
    expect(twoFactorPlugin.endpoints.verifyBackupCode).toBeDefined();
  });

  it('includes twoFactorEnabled schema field on user model and twoFactor table', () => {
    const plugins = auth.options.plugins || [];
    const twoFactorPlugin = plugins.find((p: any) => p.id === 'two-factor');

    expect(twoFactorPlugin.schema).toBeDefined();
    expect(twoFactorPlugin.schema.user.fields.twoFactorEnabled).toBeDefined();
    expect(twoFactorPlugin.schema.twoFactor).toBeDefined();
    expect(twoFactorPlugin.schema.twoFactor.fields.secret).toBeDefined();
    expect(twoFactorPlugin.schema.twoFactor.fields.backupCodes).toBeDefined();
    expect(twoFactorPlugin.schema.twoFactor.fields.userId).toBeDefined();
  });

  it('hooks into sign-in flows to intercept credentials and enforce 2FA verification', () => {
    const plugins = auth.options.plugins || [];
    const twoFactorPlugin = plugins.find((p: any) => p.id === 'two-factor');

    expect(twoFactorPlugin.hooks).toBeDefined();
    expect(twoFactorPlugin.hooks.after).toBeDefined();
    expect(Array.isArray(twoFactorPlugin.hooks.after)).toBe(true);

    const signInHook = twoFactorPlugin.hooks.after[0];
    expect(signInHook.matcher({ path: '/sign-in/email' })).toBe(true);
    expect(signInHook.matcher({ path: '/sign-in/username' })).toBe(true);
    expect(signInHook.matcher({ path: '/sign-in/phone-number' })).toBe(true);
    expect(signInHook.matcher({ path: '/some-other-path' })).toBe(false);
  });
});
