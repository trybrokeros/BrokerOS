"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Lock,
  QrCode,
} from "lucide-react";

export function AdminSecuritySettings() {
  const { data: session, refetch } = (authClient.useSession as any)();
  const user = session?.user;
  const is2FAEnabled = Boolean(user?.twoFactorEnabled);

  // Setup state
  const [step, setStep] = useState<"idle" | "password" | "verify" | "backupCodes">("idle");
  const [password, setPassword] = useState("");
  const [totpURI, setTotpURI] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verifyCode, setVerifyCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Disable 2FA state
  const [isDisabling, setIsDisabling] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");

  // Step 1: Start 2FA Setup
  const handleStartSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Please enter your current account password to initiate 2FA.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await (authClient.twoFactor as any).enable({
        password,
        issuer: "BrokerOS",
      });

      if (res.error) {
        setError(res.error.message || "Failed to initialize two-factor authentication.");
      } else if (res.data) {
        setTotpURI(res.data.totpURI || "");
        if (Array.isArray(res.data.backupCodes)) {
          setBackupCodes(res.data.backupCodes);
        }
        setStep("verify");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during 2FA initialization.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify TOTP Code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCode.trim() || verifyCode.trim().length !== 6) {
      setError("Please enter the complete 6-digit TOTP code.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await (authClient.twoFactor as any).verifyTotp({
        code: verifyCode.trim(),
      });

      if (res.error) {
        setError(res.error.message || "Invalid verification code. Please check your authenticator app.");
      } else {
        if (backupCodes.length > 0) {
          setStep("backupCodes");
        } else {
          setStep("idle");
        }
        await refetch?.();
      }
    } catch (err: any) {
      setError(err?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Disable 2FA
  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disablePassword) {
      setError("Please enter your password to disable two-factor authentication.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await (authClient.twoFactor as any).disable({
        password: disablePassword,
      });

      if (res.error) {
        setError(res.error.message || "Failed to disable two-factor authentication.");
      } else {
        setIsDisabling(false);
        setDisablePassword("");
        setStep("idle");
        await refetch?.();
      }
    } catch (err: any) {
      setError(err?.message || "Failed to disable 2FA. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Extract secret key from URI if present
  const extractSecret = (uri: string) => {
    try {
      const url = new URL(uri);
      return url.searchParams.get("secret") || uri;
    } catch {
      return uri;
    }
  };

  const copyToClipboard = (text: string, type: "secret" | "codes") => {
    navigator.clipboard.writeText(text);
    if (type === "secret") {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* 2FA Main Status Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                is2FAEnabled
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : "bg-purple-50 text-[var(--brand-600)] border border-purple-200"
              }`}
            >
              {is2FAEnabled ? (
                <ShieldCheck className="w-5 h-5" strokeWidth={2.2} />
              ) : (
                <KeyRound className="w-5 h-5" strokeWidth={2.2} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Two-Factor Authentication (TOTP)
                </h3>
                {is2FAEnabled ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Enforced
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    <ShieldAlert className="w-3 h-3" />
                    Not Configured
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Protect your enterprise BrokerOS account with time-based one-time passwords (TOTP). Compatible with Google Authenticator, Microsoft Authenticator, 1Password, and Authy.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!is2FAEnabled && step === "idle" && (
              <button
                type="button"
                onClick={() => {
                  setStep("password");
                  setError(null);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--brand-600)] hover:bg-[var(--brand-700)] shadow-xs transition-all cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Enable 2FA</span>
              </button>
            )}

            {is2FAEnabled && !isDisabling && (
              <button
                type="button"
                onClick={() => {
                  setIsDisabling(true);
                  setError(null);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
              >
                Disable 2FA
              </button>
            )}
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Request Password to start 2FA */}
        {step === "password" && !is2FAEnabled && (
          <form onSubmit={handleStartSetup} className="mt-6 space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Confirm Account Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 ps-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your current password"
                  required
                  autoFocus
                  className="w-full ps-9 pe-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[var(--brand-600)] outline-none transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Security check required before generating your unique TOTP secret.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--brand-600)] hover:bg-[var(--brand-700)] shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Continue Setup</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("idle");
                  setPassword("");
                  setError(null);
                }}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Show Secret / QR URI and Verify 6-digit Code */}
        {step === "verify" && (
          <div className="mt-6 space-y-6">
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80">
              <h4 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-[var(--brand-600)]" />
                <span>Step 1: Add Account to Authenticator App</span>
              </h4>
              <p className="text-xs text-slate-600 mb-3">
                Open your authenticator app and enter the secret key manually, or paste the URI.
              </p>

              <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-purple-200 text-xs font-mono text-purple-950 break-all select-all">
                <span className="flex-1">{extractSecret(totpURI)}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(extractSecret(totpURI), "secret")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-[var(--brand-700)] bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors shrink-0 cursor-pointer"
                >
                  {copiedSecret ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSecret ? "Copied" : "Copy Key"}</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-4 max-w-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Step 2: Enter 6-Digit Code from App
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  placeholder="000000"
                  autoFocus
                  required
                  className="w-full py-2.5 text-center text-lg font-mono font-bold tracking-widest text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[var(--brand-600)] outline-none transition-all"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--brand-600)] hover:bg-[var(--brand-700)] shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Verify & Activate 2FA</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("idle");
                    setPassword("");
                    setVerifyCode("");
                    setError(null);
                  }}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Display Backup Codes */}
        {step === "backupCodes" && (
          <div className="mt-6 space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Save Your Emergency Recovery Codes
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  If you ever lose access to your authenticator device, each code can be used once to access your account.
                </p>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(backupCodes.join("\n"), "codes")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--brand-700)] bg-white border border-slate-200 hover:bg-purple-50 transition-colors cursor-pointer shadow-2xs"
              >
                {copiedCodes ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCodes ? "Codes Copied" : "Copy All Codes"}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {backupCodes.map((code, idx) => (
                <div
                  key={idx}
                  className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-center font-mono text-xs font-bold text-slate-800 select-all"
                >
                  {code}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setStep("idle")}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--brand-600)] hover:bg-[var(--brand-700)] transition-all cursor-pointer shadow-xs"
              >
                I Have Saved My Codes
              </button>
            </div>
          </div>
        )}

        {/* Disable 2FA Form */}
        {isDisabling && (
          <form onSubmit={handleDisable2FA} className="mt-6 p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-4 max-w-md">
            <div>
              <h4 className="text-xs font-bold text-rose-950 mb-1">
                Deactivate Two-Factor Authentication
              </h4>
              <p className="text-[11px] text-rose-800 mb-3">
                This will revert your account to single-factor password authentication. Confirm with your password to proceed.
              </p>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 ps-3 flex items-center pointer-events-none text-rose-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  placeholder="Enter account password"
                  required
                  autoFocus
                  className="w-full ps-9 pe-3 py-2 bg-white border border-rose-200 rounded-xl text-xs text-rose-950 focus:border-rose-400 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Confirm Disable</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDisabling(false);
                  setDisablePassword("");
                  setError(null);
                }}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Security Architecture Specifications Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Identity & Access Compliance
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          BrokerOS cryptographic standards and session verification parameters.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
              Protocol Standard
            </span>
            <span className="text-xs font-semibold text-slate-800">
              RFC 6238 TOTP
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
              Time Window & Drift
            </span>
            <span className="text-xs font-semibold text-slate-800">
              30-Second Rolling Token
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
              Recovery Storage
            </span>
            <span className="text-xs font-semibold text-slate-800">
              Encrypted Backup Codes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
