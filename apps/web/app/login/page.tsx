"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Phone,
  ArrowRight,
  Building2,
  Loader2,
  Mail,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from "lucide-react";

type Role = {
  id: string;
  name: string;
  code: string;
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");

  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Two-Factor Authentication state
  const [isTwoFactor, setIsTwoFactor] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);

  const router = useRouter();

  useEffect(() => {
    async function fetchRoles() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"}/roles`
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          setRoles(data);
        }
      } catch (err) {
        console.error("Failed to load roles", err);
      }
    }
    fetchRoles();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!roleId) {
      setError("Please select your assigned role identity.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await (authClient.signIn.email as any)({
        email,
        password,
        phoneNumber,
        roleId,
      });

      if (authError) {
        setError(authError.message || "Invalid credentials or role identity mismatch.");
      } else if (data) {
        if ((data as any).twoFactorRedirect) {
          setIsTwoFactor(true);
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please verify your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!twoFactorCode.trim()) {
      setError(useBackupCode ? "Please enter a backup code." : "Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      if (useBackupCode) {
        const { data, error: mfaError } = await (authClient.twoFactor as any).verifyBackupCode({
          code: twoFactorCode.trim(),
        });
        if (mfaError) {
          setError(mfaError.message || "Invalid backup recovery code.");
        } else {
          router.push("/dashboard");
        }
      } else {
        const { data, error: mfaError } = await (authClient.twoFactor as any).verifyTotp({
          code: twoFactorCode.trim(),
        });
        if (mfaError) {
          setError(mfaError.message || "Invalid 6-digit verification code.");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setError(err?.message || "Failed to verify 2FA code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[var(--bg-base)] text-[var(--text-primary)] relative overflow-hidden font-sans selection:bg-purple-100 selection:text-purple-900">
      {/* Ambient Background Lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden z-0"
      >
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-purple-200/30 blur-[130px]" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-indigo-200/25 blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(var(--text-primary) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Header Bar */}
      <header className="relative z-10 px-6 py-5 max-w-6xl w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group text-decoration-none">
          <div className="w-8 h-8 rounded-xl bg-[var(--brand-600)] flex items-center justify-center shadow-md shadow-purple-600/20 group-hover:scale-105 transition-transform duration-200">
            <Building2 className="w-4 h-4 text-white" strokeWidth={2.2} />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-[var(--text-primary)]">
            Broker<span className="text-[var(--brand-600)]">OS</span>
          </span>
        </Link>

        <Link
          href="/"
          className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--brand-600)] transition-colors"
        >
          &larr; Back to Overview
        </Link>
      </header>

      {/* Main Authentication Form Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 sm:p-10 relative overflow-hidden">
          {isTwoFactor ? (
            <div>
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200/80 text-[10px] font-bold uppercase tracking-wider text-[var(--brand-700)] mb-3">
                  <KeyRound className="w-3.5 h-3.5 text-[var(--brand-600)]" />
                  <span>Two-Factor Authentication</span>
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
                  {useBackupCode ? "Recovery Code" : "Security Verification"}
                </h1>
                <p className="text-xs text-[var(--text-tertiary)] mt-1.5 max-w-xs mx-auto">
                  {useBackupCode
                    ? "Enter one of your emergency backup recovery codes."
                    : "Enter the 6-digit TOTP verification code from your authenticator app."}
                </p>
              </div>

              <form onSubmit={handleVerify2FA} className="space-y-4">
                {error && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                    {useBackupCode ? "Backup Code" : "6-Digit Authenticator Code"}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      autoFocus
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value)}
                      placeholder={useBackupCode ? "e.g. a1b2c3d4" : "000000"}
                      maxLength={useBackupCode ? 32 : 6}
                      required
                      className="w-full ps-10 pe-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg font-mono font-bold tracking-widest text-[var(--text-primary)] placeholder:text-slate-300 focus:bg-white focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-[var(--brand-600)] hover:bg-[var(--brand-700)] shadow-md shadow-purple-600/25 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.96] press-effect cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Enter Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setUseBackupCode(!useBackupCode);
                      setTwoFactorCode("");
                      setError("");
                    }}
                    className="text-[var(--brand-600)] hover:underline font-semibold cursor-pointer"
                  >
                    {useBackupCode ? "Use Authenticator app" : "Use a backup code"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsTwoFactor(false);
                      setTwoFactorCode("");
                      setError("");
                    }}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    Back to login
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              {/* Top Brand & Access Badge */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200/80 text-[10px] font-bold uppercase tracking-wider text-[var(--brand-700)] mb-3">
                  <ShieldCheck className="w-3.5 h-3.5 text-[var(--brand-600)]" />
                  <span>4-Factor RBAC Gateway</span>
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
                  Executive Sign In
                </h1>
                <p className="text-xs text-[var(--text-tertiary)] mt-1.5 max-w-xs mx-auto">
                  Authenticate with your verified email, phone, role designation, and password.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Error Message */}
                {error && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Field 1: Email */}
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                    Work Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rahul@brokeros.internal"
                      required
                      className="w-full ps-10 pe-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm text-[var(--text-primary)] placeholder:text-slate-400 focus:bg-white focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Field 2: Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                    Registered Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      required
                      className="w-full ps-10 pe-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm text-[var(--text-primary)] placeholder:text-slate-400 focus:bg-white focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 outline-none transition-all tabular-nums"
                    />
                  </div>
                </div>

                {/* Field 3: Role Identity */}
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                    Role Identity Designation
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <select
                      value={roleId}
                      onChange={(e) => setRoleId(e.target.value)}
                      required
                      className="w-full ps-10 pe-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm text-[var(--text-primary)] focus:bg-white focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="" disabled>
                        Select Your Role Identity
                      </option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Field 4: Password */}
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                    Access Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full ps-10 pe-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm text-[var(--text-primary)] placeholder:text-slate-400 focus:bg-white focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-[var(--brand-600)] hover:bg-[var(--brand-700)] shadow-md shadow-purple-600/25 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.96] press-effect cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying RBAC Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Identity & Enter Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Security Assurance Footer */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-[11px] text-[var(--text-muted)] flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Session tokens encrypted & validated via NestJS Better Auth</span>
            </p>
          </div>
        </div>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="relative z-10 py-4 text-center text-[11px] text-[var(--text-muted)]">
        BrokerOS v2.4 · Enterprise Real Estate Operating System
      </footer>
    </div>
  );
}
