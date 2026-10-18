"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import {
  LogOut,
  Building2,
  ChevronRight,
  ArrowLeft,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { ROLE_CONFIG } from "@/components/dashboard/layout/role-colors.config";
import {
  getRoleNavLinks,
  isSectionAllowedForRole,
  ROLE_TO_ROUTE_MAP,
} from "@/components/dashboard/layout/role-navigation.config";
import { TelephonyProvider } from "@/features/telephony/context/TelephonyContext";
import { ActiveCallWidget } from "@/features/telephony/components/ActiveCallWidget";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  const [roleCode, setRoleCode] = useState<string>("");
  const [fetchingRoles, setFetchingRoles] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const user = session?.user as any;
    if (user?.roleId) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      fetch(`${baseUrl}/roles`)
        .then((res) => res.json())
        .then((roles) => {
          if (Array.isArray(roles)) {
            const role = roles.find((r: any) => r.id === user.roleId);
            if (role) {
              setRoleCode(role.code);
              // Set role cookie for edge/proxy route guard
              document.cookie = `brokeros_role=${role.code}; path=/; SameSite=Lax; max-age=86400`;
            }
          }
        })
        .catch(console.error)
        .finally(() => setFetchingRoles(false));
    } else if (!isPending) {
      setFetchingRoles(false);
    }
  }, [session, isPending]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    document.cookie = "brokeros_role=; path=/; max-age=0";
    await authClient.signOut();
    router.push("/login");
  };

  const userRole = roleCode || "UNKNOWN";
  const pathSegments = pathname.split("/").filter(Boolean);
  const currentSection = pathSegments[1] || "";
  const isAuthorized = isSectionAllowedForRole(currentSection, userRole);

  useEffect(() => {
    if (!fetchingRoles && !isPending && !isAuthorized && roleCode) {
      const fallback = ROLE_TO_ROUTE_MAP[roleCode] || "/dashboard";
      const timer = setTimeout(() => {
        router.replace(fallback);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [fetchingRoles, isPending, isAuthorized, roleCode, router]);

  /* ── Loading State ───────────────────────────────────────────────── */
  if (isPending || fetchingRoles) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-base)] gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-purple-100" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--brand-600)] animate-spin" />
        </div>
        <p className="text-xs font-semibold text-[var(--text-tertiary)] tracking-tight">
          Authenticating workspace…
        </p>
      </div>
    );
  }

  const roleConfig = ROLE_CONFIG[userRole] || ROLE_CONFIG["PRE_SALES"];
  const navLinks = getRoleNavLinks(userRole, pathname);

  const userEmail = session?.user?.email || "";
  const userInitials = userEmail.slice(0, 2).toUpperCase() || "US";

  /* ── Active Page Title ───────────────────────────────────────────── */
  const activeLink = navLinks.find((link) => {
    if (link.name === "Overview") return pathname === link.href;
    return pathname === link.href || pathname.startsWith(link.href + "/");
  });
  const pageTitle = activeLink?.name || "Dashboard";

  return (
    <TelephonyProvider>
      <div className="flex min-h-screen bg-[var(--bg-base)] overflow-hidden font-sans text-[var(--text-primary)]">
        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200/80 flex flex-col relative z-20 shadow-xs">
          {/* Sidebar Brand Header */}
          <div className="p-3 border-b border-slate-100 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3 text-decoration-none group">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform duration-200 group-hover:scale-105"
                style={{ background: roleConfig.accent }}
              >
                <Building2 className="w-4 h-4 text-white" strokeWidth={2.2} />
              </div>
              <div>
                <div className="text-xs font-extrabold tracking-tight text-[var(--text-primary)] leading-none">
                  Broker<span style={{ color: roleConfig.accent }}>OS</span>
                </div>
                <div className="text-[10px] font-bold text-[var(--text-muted)] mt-1 tracking-tight">
                  {roleConfig.label}
                </div>
              </div>
            </Link>

            {/* System Live Dot */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>

          {/* Nav Links List */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-hide">
            {(pathname.startsWith("/dashboard/marketing/email") ||
              pathname.startsWith("/dashboard/marketing/sms") ||
              pathname.startsWith("/dashboard/marketing/voice") ||
              pathname.startsWith("/dashboard/marketing/whatsapp") ||
              pathname.startsWith("/dashboard/marketing/ads")) && (
                <Link
                  href="/dashboard/marketing"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl mb-3 transition-colors group"
                >
                  <ArrowLeft className="w-4 h-4 text-[var(--brand-600)] transition-transform group-hover:-translate-x-0.5" />
                  <span>Back to Marketing Hub</span>
                </Link>
              )}

            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/dashboard/marketing" ||
                  link.href === "/dashboard/marketing/email" ||
                  link.href === "/dashboard/marketing/sms" ||
                  link.href === "/dashboard/marketing/voice"
                  ? pathname === link.href
                  : link.name.toLowerCase().includes("overview")
                    ? pathname === link.href
                    : pathname === link.href || pathname.startsWith(link.href + "/");

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 active:scale-[0.98] ${isActive
                    ? "text-[var(--text-primary)] shadow-xs"
                    : "text-[var(--text-tertiary)] hover:bg-slate-50 hover:text-[var(--text-primary)]"
                    }`}
                  style={{
                    background: isActive ? roleConfig.bg : "transparent",
                    color: isActive ? roleConfig.accent : undefined,
                  }}
                >
                  {/* Active Indicator Bar */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-indicator"
                      className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                      style={{ background: roleConfig.accent }}
                      transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
                    />
                  )}
                  <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
                  <span className="truncate">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Footer Profile */}
          <div className="p-3 border-t border-slate-100">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/80 mb-2 border border-slate-100">
              <div
                className="w-7 h-7 rounded-full text-white flex items-center justify-center text-[10px] font-extrabold flex-shrink-0"
                style={{ background: roleConfig.accent }}
              >
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold text-[var(--text-primary)] truncate">
                  {userEmail}
                </div>
                <div className="text-[10px] text-[var(--text-muted)] font-medium truncate">
                  {roleConfig.label}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-[11px] font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-[0.96] press-effect disabled:opacity-50"
            >
              <LogOut className="w-3.5 h-3.5" strokeWidth={2} />
              <span>{isLoggingOut ? "Signing out…" : "Sign Out"}</span>
            </button>
          </div>
        </aside>

        {/* ── Main Content Shell ───────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          {/* Top Header Bar */}
          <header className="h-14 bg-white border-b border-slate-200/80 flex items-center justify-between px-7 flex-shrink-0 z-20">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[var(--text-muted)] font-medium">Workspace</span>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="font-extrabold text-[var(--text-primary)]">{pageTitle}</span>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-3">
              <NotificationBell />
            </div>
          </header>

          {/* Dynamic Page Content View */}
          <main className="flex-1 overflow-y-auto p-7 scrollbar-hide">
            {!isAuthorized ? (
              <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-rose-100 shadow-sm text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-2">
                  Access Restricted
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  Your assigned role <span className="font-semibold text-slate-700">({roleConfig.label})</span> does not have authorization to view the <span className="font-semibold text-slate-700">/{currentSection}</span> workspace. Redirecting you to your designated home...
                </p>
                <button
                  onClick={() => router.replace(ROLE_TO_ROUTE_MAP[userRole] || "/dashboard")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to My Workspace</span>
                </button>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
                  className="min-h-full"
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            )}
          </main>
        </div>

        {/* Real-time Global Team Chat Widget */}
        <ChatWidget />

        {/* Global In-Browser WebRTC Softphone Widget */}
        <ActiveCallWidget />
      </div>
    </TelephonyProvider>
  );
}
