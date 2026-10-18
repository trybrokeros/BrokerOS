import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLE_SECTION_PERMISSIONS: Record<string, string[]> = {
  admin: ["ADMIN"],
  finance: ["FINANCE", "DIRECTOR", "ADMIN"],
  "business-manager": ["BUSINESS_MANAGER", "ADMIN"],
  director: ["DIRECTOR", "ADMIN"],
  "pre-sales-manager": ["PRE_SALES_MANAGER", "ADMIN"],
  "pre-sales": ["PRE_SALES", "PRE_SALES_MANAGER", "DIRECTOR", "ADMIN"],
  "sales-manager": ["SALES_MANAGER", "ADMIN"],
  "sales-executive": ["SALES_EXECUTIVE", "SALES_MANAGER", "ADMIN"],
  "post-sales-manager": ["POST_SALES_MANAGER", "ADMIN"],
  "post-sales": ["POST_SALES", "POST_SALES_MANAGER", "DIRECTOR", "ADMIN"],
  "sourcing-manager": ["SOURCING_MANAGER", "ADMIN"],
  "closing-manager": ["CLOSING_MANAGER", "ADMIN"],
  "channel-partner": ["CHANNEL_PARTNER", "ADMIN"],
  marketing: ["MARKETING", "BUSINESS_MANAGER", "DIRECTOR", "ADMIN"],
};

export function proxy(request: NextRequest) {
  const sessionToken = request.cookies.get("better-auth.session_token");

  // Protect /dashboard and all its subpaths
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based route guard at edge/proxy level
    const roleCookie = request.cookies.get("brokeros_role")?.value;
    if (roleCookie && roleCookie !== "ADMIN") {
      const segments = request.nextUrl.pathname.split("/").filter(Boolean);
      const section = segments[1]; // /dashboard/:section
      const allowedRoles = section ? ROLE_SECTION_PERMISSIONS[section] : null;

      if (allowedRoles && !allowedRoles.includes(roleCookie)) {
        const dashboardUrl = new URL("/dashboard", request.url);
        return NextResponse.redirect(dashboardUrl);
      }
    }
  }

  // Redirect logged-in users away from /login
  if (request.nextUrl.pathname === "/login") {
    if (sessionToken) {
      const dashboardUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const middleware = proxy;
export default proxy;

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
