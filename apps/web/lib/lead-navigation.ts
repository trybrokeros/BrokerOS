// ============================================================================
// BrokerOS — Dynamic Role & Department Scoped Lead Navigation Resolver
// ============================================================================

"use client";

import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export const ROLE_TO_LEAD_BASE: Record<string, string> = {
  PRE_SALES: "/dashboard/pre-sales/lead-management",
  PRE_SALES_MANAGER: "/dashboard/pre-sales-manager/lead-management",
  SALES_EXECUTIVE: "/dashboard/sales-executive/lead-management",
  SALES_MANAGER: "/dashboard/sales-manager/lead-management",
  POST_SALES: "/dashboard/post-sales/lead-management",
  POST_SALES_MANAGER: "/dashboard/post-sales-manager/lead-management",
  CLOSING_MANAGER: "/dashboard/closing-manager/lead-management",
  SOURCING_MANAGER: "/dashboard/sales-manager/lead-management",
  CHANNEL_PARTNER: "/dashboard/sales-manager/lead-management",
  BUSINESS_MANAGER: "/dashboard/sales-manager/lead-management",
  DIRECTOR: "/dashboard/sales-manager/lead-management",
  ADMIN: "/dashboard/sales-manager/lead-management",
  MARKETING: "/dashboard/marketing/leads",
};

export const DEPARTMENT_TO_LEAD_BASE: Record<string, string> = {
  PRE_SALES: "/dashboard/pre-sales/lead-management",
  "pre-sales": "/dashboard/pre-sales/lead-management",
  "pre-sales-manager": "/dashboard/pre-sales-manager/lead-management",
  SALES: "/dashboard/sales-executive/lead-management",
  "sales-executive": "/dashboard/sales-executive/lead-management",
  "sales-manager": "/dashboard/sales-manager/lead-management",
  POST_SALES: "/dashboard/post-sales/lead-management",
  "post-sales": "/dashboard/post-sales/lead-management",
  "post-sales-manager": "/dashboard/post-sales-manager/lead-management",
  CLOSING: "/dashboard/closing-manager/lead-management",
  "closing-manager": "/dashboard/closing-manager/lead-management",
  SOURCING: "/dashboard/sales-manager/lead-management",
  "sourcing-manager": "/dashboard/sales-manager/lead-management",
  MARKETING: "/dashboard/marketing/leads",
  marketing: "/dashboard/marketing/leads",
  ADMIN: "/dashboard/sales-manager/lead-management",
  admin: "/dashboard/sales-manager/lead-management",
  DIRECTOR: "/dashboard/sales-manager/lead-management",
  director: "/dashboard/sales-manager/lead-management",
};

/**
 * Pure function to resolve the target lead URL dynamically.
 */
export function resolveLeadHref(
  leadId: string,
  pathname?: string | null,
  role?: string | null,
  department?: string | null
): string {
  if (!leadId) return "/dashboard";

  // 1. If currently inside a specific department path:
  if (pathname) {
    const segments = pathname.split("/").filter(Boolean); // ["dashboard", "sales-executive", ...]
    const section = segments[1]; // e.g. "pre-sales", "sales-executive", "marketing", "inbox"

    if (section && section !== "inbox" && section !== "leads") {
      if (section === "marketing") {
        return `/dashboard/marketing/leads/${leadId}`;
      }
      if (DEPARTMENT_TO_LEAD_BASE[section]) {
        return `${DEPARTMENT_TO_LEAD_BASE[section]}/${leadId}`;
      }
      return `/dashboard/${section}/lead-management/${leadId}`;
    }
  }

  // 2. If explicit department override provided:
  if (department && DEPARTMENT_TO_LEAD_BASE[department]) {
    return `${DEPARTMENT_TO_LEAD_BASE[department]}/${leadId}`;
  }

  // 3. If role is provided from user session or cookie:
  if (role) {
    const norm = role.toUpperCase();
    if (ROLE_TO_LEAD_BASE[norm]) {
      return `${ROLE_TO_LEAD_BASE[norm]}/${leadId}`;
    }
  }

  // 4. Default fallback:
  return `/dashboard/sales-executive/lead-management/${leadId}`;
}

/**
 * React hook that automatically reads pathname & user session to generate contextual lead links.
 */
export function useLeadHref() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const role = (session?.user as any)?.role as string | undefined;

  return (leadId: string, departmentOverride?: string | null) => {
    return resolveLeadHref(leadId, pathname, role, departmentOverride);
  };
}
