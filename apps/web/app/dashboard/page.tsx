"use client";

import { authClient } from "@/lib/auth-client";
import { Building2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ROLE_TO_ROUTE_MAP } from "@/components/dashboard/layout/role-navigation.config";

export default function DashboardOverview() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && session) {
      const user = session.user as any;
      if (user?.roleId) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
        fetch(`${baseUrl}/roles`)
          .then((res) => res.json())
          .then((roles) => {
            if (Array.isArray(roles)) {
              const role = roles.find((r: any) => r.id === user.roleId);
              if (role && ROLE_TO_ROUTE_MAP[role.code]) {
                router.replace(ROLE_TO_ROUTE_MAP[role.code]);
              }
            }
          })
          .catch(console.error);
      }
    }
  }, [session, isPending, router]);

  return (
    <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* Brand Icon with Spinner */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-4xl bg-[var(--brand-600)] flex items-center justify-center text-white shadow-lg shadow-purple-600/25">
          <Building2 className="w-7 h-7 text-white" strokeWidth={2.2} />
        </div>
        <div className="absolute -inset-2 rounded-3xl border-2 border-transparent border-t-[var(--brand-600)] animate-spin pointer-events-none" />
      </div>

      <h1 className="text-xl font-extrabold tracking-tight text-[var(--text-primary)] mb-1.5">
        Authenticating Workspace
      </h1>
      <p className="text-xs text-[var(--text-tertiary)] max-w-sm mb-6">
        Validating 4-factor session credentials and routing to your departmental dashboard…
      </p>

      <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200/90 shadow-xs text-xs font-semibold text-[var(--text-secondary)]">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>{session?.user?.email || "Checking session…"}</span>
      </div>
    </div>
  );
}
