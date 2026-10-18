// ============================================================================
// BrokerOS — Dashboard Role Navigation Items & Marketing Channel Tree Config
// ============================================================================

import React from "react";
import {
  LayoutDashboard,
  Users,
  BarChart2,
  Settings,
  Star,
  List,
  Mail,
  CheckSquare,
  Calendar,
  Package,
  Handshake,
  Briefcase,
  DollarSign,
  Globe,
  Video,
  MessageSquare,
  PhoneCall,
  Phone,
  Radio,
  GitBranch,
  Send,
  Zap,
  FileText,
  Search,
  Workflow,
  Sparkles,
  Tag as TagIcon,
  ShieldCheck,
  Building2,
  Inbox,
} from "lucide-react";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import type { SystemRoleCode } from "@brokeros/constants";

export interface NavLinkItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: (SystemRoleCode | string)[];
}

export function getRoleNavLinks(userRole: string, pathname: string): NavLinkItem[] {
  // ── Marketing Subchannels (Active across any role visiting marketing routes) ──
  if (pathname.startsWith("/dashboard/marketing/email")) {
    return [
      { name: "Email Overview", href: "/dashboard/marketing/email", icon: LayoutDashboard, roles: ["MARKETING", "ADMIN"] },
      { name: "Live Inbox", href: "/dashboard/marketing/email/inbox", icon: Inbox, roles: ["MARKETING", "ADMIN"] },
      { name: "New Broadcast", href: "/dashboard/marketing/email/campaigns/new", icon: Send, roles: ["MARKETING", "ADMIN"] },
      { name: "Interactive Flows", href: "/dashboard/marketing/email/flows", icon: Workflow, roles: ["MARKETING", "ADMIN"] },
      { name: "Settings", href: "/dashboard/marketing/email/settings", icon: Settings, roles: ["MARKETING", "ADMIN"] },
    ];
  }

  if (pathname.startsWith("/dashboard/marketing/whatsapp")) {
    return [
      { name: "WhatsApp Overview", href: "/dashboard/marketing/whatsapp", icon: LayoutDashboard, roles: ["MARKETING", "ADMIN"] },
      { name: "Live Inbox", href: "/dashboard/marketing/whatsapp/inbox", icon: MessageSquare, roles: ["MARKETING", "ADMIN"] },
      { name: "Pipelines & Deals", href: "/dashboard/marketing/whatsapp/pipelines", icon: GitBranch, roles: ["MARKETING", "ADMIN"] },
      { name: "Broadcasts", href: "/dashboard/marketing/whatsapp/broadcasts", icon: Send, roles: ["MARKETING", "ADMIN"] },
      { name: "Contacts", href: "/dashboard/marketing/whatsapp/contacts", icon: Users, roles: ["MARKETING", "ADMIN"] },
      { name: "Automations", href: "/dashboard/marketing/whatsapp/automations", icon: Zap, roles: ["MARKETING", "ADMIN"] },
      { name: "Interactive Flows", href: "/dashboard/marketing/whatsapp/flows", icon: Briefcase, roles: ["MARKETING", "ADMIN"] },
      { name: "Templates", href: "/dashboard/marketing/whatsapp/templates", icon: FileText, roles: ["MARKETING", "ADMIN"] },
      { name: "Settings", href: "/dashboard/marketing/whatsapp/settings", icon: Settings, roles: ["MARKETING", "ADMIN"] },
    ];
  }

  if (pathname.startsWith("/dashboard/marketing/sms")) {
    return [
      { name: "SMS Overview", href: "/dashboard/marketing/sms", icon: LayoutDashboard, roles: ["MARKETING", "ADMIN"] },
      { name: "Live Inbox", href: "/dashboard/marketing/sms/inbox", icon: Inbox, roles: ["MARKETING", "ADMIN"] },
      { name: "New Broadcast", href: "/dashboard/marketing/sms/campaigns/new", icon: Send, roles: ["MARKETING", "ADMIN"] },
      { name: "2-Way Flows", href: "/dashboard/marketing/sms/flows", icon: Workflow, roles: ["MARKETING", "ADMIN"] },
      { name: "Gateways & Settings", href: "/dashboard/marketing/sms/settings", icon: Settings, roles: ["MARKETING", "ADMIN"] },
    ];
  }

  if (pathname.startsWith("/dashboard/marketing/voice")) {
    return [
      { name: "Voice Overview", href: "/dashboard/marketing/voice", icon: LayoutDashboard, roles: ["MARKETING", "ADMIN"] },
      { name: "New Voice Call", href: "/dashboard/marketing/voice/campaigns/new", icon: PhoneCall, roles: ["MARKETING", "ADMIN"] },
      { name: "Carrier & AI Gateways", href: "/dashboard/marketing/voice/settings", icon: Settings, roles: ["MARKETING", "ADMIN"] },
    ];
  }

  if (pathname.startsWith("/dashboard/marketing/ads")) {
    return [
      { name: "Ads Hub Overview", href: "/dashboard/marketing/ads", icon: LayoutDashboard, roles: ["MARKETING", "ADMIN"] },
      { name: "Meta (Facebook) Ads", href: "/dashboard/marketing/ads/meta", icon: Globe, roles: ["MARKETING", "ADMIN"] },
      { name: "Instagram Ads", href: "/dashboard/marketing/ads/instagram", icon: InstagramIcon, roles: ["MARKETING", "ADMIN"] },
      { name: "Google Ads", href: "/dashboard/marketing/ads/google", icon: Search, roles: ["MARKETING", "ADMIN"] },
      { name: "YouTube Video Ads", href: "/dashboard/marketing/ads/youtube", icon: Video, roles: ["MARKETING", "ADMIN"] },
    ];
  }

  if (userRole === "PRE_SALES") {
    return [
      { name: "Overview", href: "/dashboard/pre-sales", icon: LayoutDashboard, roles: ["PRE_SALES"] },
      { name: "Lead Management", href: "/dashboard/pre-sales/lead-management", icon: Users, roles: ["PRE_SALES"] },
      { name: "WhatsApp Inbox", href: "/dashboard/inbox/whatsapp", icon: MessageSquare, roles: ["PRE_SALES"] },
      { name: "SMS Inbox", href: "/dashboard/inbox/sms", icon: MessageSquare, roles: ["PRE_SALES"] },
      { name: "Email Inbox", href: "/dashboard/inbox/email", icon: Mail, roles: ["PRE_SALES"] },
      { name: "Analytics", href: "/dashboard/pre-sales/analytics", icon: BarChart2, roles: ["PRE_SALES"] },
      { name: "Settings", href: "/dashboard/pre-sales/settings", icon: Settings, roles: ["PRE_SALES"] },
    ];
  }

  if (userRole === "PRE_SALES_MANAGER") {
    return [
      { name: "Overview", href: "/dashboard/pre-sales-manager", icon: LayoutDashboard, roles: ["PRE_SALES_MANAGER"] },
      { name: "Employees", href: "/dashboard/pre-sales-manager/employees", icon: Users, roles: ["PRE_SALES_MANAGER"] },
      { name: "New Leads", href: "/dashboard/pre-sales-manager/new-leads", icon: Star, roles: ["PRE_SALES_MANAGER"] },
      { name: "Lead Management", href: "/dashboard/pre-sales-manager/lead-management", icon: List, roles: ["PRE_SALES_MANAGER"] },
      { name: "WhatsApp Inbox", href: "/dashboard/inbox/whatsapp", icon: MessageSquare, roles: ["PRE_SALES_MANAGER"] },
      { name: "SMS Inbox", href: "/dashboard/inbox/sms", icon: MessageSquare, roles: ["PRE_SALES_MANAGER"] },
      { name: "Email Inbox", href: "/dashboard/inbox/email", icon: Mail, roles: ["PRE_SALES_MANAGER"] },
      { name: "Analytics", href: "/dashboard/pre-sales-manager/analytics", icon: BarChart2, roles: ["PRE_SALES_MANAGER"] },
      { name: "Settings", href: "/dashboard/pre-sales-manager/settings", icon: Settings, roles: ["PRE_SALES_MANAGER"] },
    ];
  }

  if (userRole === "SALES_EXECUTIVE") {
    return [
      { name: "Overview", href: "/dashboard/sales-executive", icon: LayoutDashboard, roles: ["SALES_EXECUTIVE"] },
      { name: "Lead Management", href: "/dashboard/sales-executive/lead-management", icon: Users, roles: ["SALES_EXECUTIVE"] },
      { name: "WhatsApp Inbox", href: "/dashboard/inbox/whatsapp", icon: MessageSquare, roles: ["SALES_EXECUTIVE"] },
      { name: "SMS Inbox", href: "/dashboard/inbox/sms", icon: MessageSquare, roles: ["SALES_EXECUTIVE"] },
      { name: "Email Inbox", href: "/dashboard/inbox/email", icon: Mail, roles: ["SALES_EXECUTIVE"] },
      { name: "Approval", href: "/dashboard/sales-executive/approval", icon: CheckSquare, roles: ["SALES_EXECUTIVE"] },
      { name: "Booking", href: "/dashboard/sales-executive/booking", icon: Calendar, roles: ["SALES_EXECUTIVE"] },
      { name: "Inventory", href: "/dashboard/sales-executive/inventory", icon: Package, roles: ["SALES_EXECUTIVE"] },
      { name: "Analytics", href: "/dashboard/sales-executive/analytics", icon: BarChart2, roles: ["SALES_EXECUTIVE"] },
      { name: "Settings", href: "/dashboard/sales-executive/settings", icon: Settings, roles: ["SALES_EXECUTIVE"] },
    ];
  }

  if (userRole === "SALES_MANAGER") {
    return [
      { name: "Overview", href: "/dashboard/sales-manager", icon: LayoutDashboard, roles: ["SALES_MANAGER"] },
      { name: "Employees", href: "/dashboard/sales-manager/employees", icon: Users, roles: ["SALES_MANAGER"] },
      { name: "Lead Management", href: "/dashboard/sales-manager/lead-management", icon: List, roles: ["SALES_MANAGER"] },
      { name: "WhatsApp Inbox", href: "/dashboard/inbox/whatsapp", icon: MessageSquare, roles: ["SALES_MANAGER"] },
      { name: "SMS Inbox", href: "/dashboard/inbox/sms", icon: MessageSquare, roles: ["SALES_MANAGER"] },
      { name: "Email Inbox", href: "/dashboard/inbox/email", icon: Mail, roles: ["SALES_MANAGER"] },
      { name: "Approval", href: "/dashboard/sales-manager/approval", icon: CheckSquare, roles: ["SALES_MANAGER"] },
      { name: "Inventory", href: "/dashboard/sales-manager/inventory", icon: Package, roles: ["SALES_MANAGER"] },
      { name: "Booking", href: "/dashboard/sales-manager/booking", icon: Calendar, roles: ["SALES_MANAGER"] },
      { name: "Analytics", href: "/dashboard/sales-manager/analytics", icon: BarChart2, roles: ["SALES_MANAGER"] },
      { name: "Settings", href: "/dashboard/sales-manager/settings", icon: Settings, roles: ["SALES_MANAGER"] },
    ];
  }

  if (userRole === "POST_SALES") {
    return [
      { name: "Overview", href: "/dashboard/post-sales", icon: LayoutDashboard, roles: ["POST_SALES"] },
      { name: "Lead Management", href: "/dashboard/post-sales/lead-management", icon: List, roles: ["POST_SALES"] },
      { name: "WhatsApp Inbox", href: "/dashboard/inbox/whatsapp", icon: MessageSquare, roles: ["POST_SALES"] },
      { name: "SMS Inbox", href: "/dashboard/inbox/sms", icon: MessageSquare, roles: ["POST_SALES"] },
      { name: "Email Inbox", href: "/dashboard/inbox/email", icon: Mail, roles: ["POST_SALES"] },
      { name: "Inventory", href: "/dashboard/post-sales/inventory", icon: Package, roles: ["POST_SALES"] },
      { name: "Commissions", href: "/dashboard/post-sales/commissions", icon: Handshake, roles: ["POST_SALES"] },
      { name: "Handover", href: "/dashboard/post-sales/handover", icon: Handshake, roles: ["POST_SALES"] },
      { name: "Analytics", href: "/dashboard/post-sales/analytics", icon: BarChart2, roles: ["POST_SALES"] },
      { name: "Settings", href: "/dashboard/post-sales/settings", icon: Settings, roles: ["POST_SALES"] },
    ];
  }

  if (userRole === "POST_SALES_MANAGER") {
    return [
      { name: "Overview", href: "/dashboard/post-sales-manager", icon: LayoutDashboard, roles: ["POST_SALES_MANAGER"] },
      { name: "Employees", href: "/dashboard/post-sales-manager/employees", icon: Users, roles: ["POST_SALES_MANAGER"] },
      { name: "Lead Management", href: "/dashboard/post-sales-manager/lead-management", icon: List, roles: ["POST_SALES_MANAGER"] },
      { name: "WhatsApp Inbox", href: "/dashboard/inbox/whatsapp", icon: MessageSquare, roles: ["POST_SALES_MANAGER"] },
      { name: "SMS Inbox", href: "/dashboard/inbox/sms", icon: MessageSquare, roles: ["POST_SALES_MANAGER"] },
      { name: "Email Inbox", href: "/dashboard/inbox/email", icon: Mail, roles: ["POST_SALES_MANAGER"] },
      { name: "Commissions", href: "/dashboard/post-sales-manager/commissions", icon: Handshake, roles: ["POST_SALES_MANAGER"] },
      { name: "Handover", href: "/dashboard/post-sales-manager/handover", icon: Handshake, roles: ["POST_SALES_MANAGER"] },
      { name: "Analytics", href: "/dashboard/post-sales-manager/analytics", icon: BarChart2, roles: ["POST_SALES_MANAGER"] },
      { name: "Settings", href: "/dashboard/post-sales-manager/settings", icon: Settings, roles: ["POST_SALES_MANAGER"] },
    ];
  }

  if (userRole === "SOURCING_MANAGER") {
    return [
      { name: "Overview", href: "/dashboard/sourcing-manager", icon: LayoutDashboard, roles: ["SOURCING_MANAGER"] },
      { name: "Broker Management", href: "/dashboard/sourcing-manager/broker-management", icon: Handshake, roles: ["SOURCING_MANAGER"] },
      { name: "WhatsApp Inbox", href: "/dashboard/inbox/whatsapp", icon: MessageSquare, roles: ["SOURCING_MANAGER"] },
      { name: "SMS Inbox", href: "/dashboard/inbox/sms", icon: MessageSquare, roles: ["SOURCING_MANAGER"] },
      { name: "Email Inbox", href: "/dashboard/inbox/email", icon: Mail, roles: ["SOURCING_MANAGER"] },
      { name: "Commissions", href: "/dashboard/sourcing-manager/commissions", icon: Handshake, roles: ["SOURCING_MANAGER"] },
      { name: "Inventory", href: "/dashboard/sourcing-manager/inventory", icon: Package, roles: ["SOURCING_MANAGER"] },
      { name: "Analytics", href: "/dashboard/sourcing-manager/analytics", icon: BarChart2, roles: ["SOURCING_MANAGER"] },
      { name: "Settings", href: "/dashboard/sourcing-manager/settings", icon: Settings, roles: ["SOURCING_MANAGER"] },
    ];
  }

  if (userRole === "CLOSING_MANAGER") {
    return [
      { name: "Overview", href: "/dashboard/closing-manager", icon: LayoutDashboard, roles: ["CLOSING_MANAGER"] },
      { name: "Inventory", href: "/dashboard/closing-manager/inventory", icon: Package, roles: ["CLOSING_MANAGER"] },
      { name: "Lead Management", href: "/dashboard/closing-manager/lead-management", icon: List, roles: ["CLOSING_MANAGER"] },
      { name: "WhatsApp Inbox", href: "/dashboard/inbox/whatsapp", icon: MessageSquare, roles: ["CLOSING_MANAGER"] },
      { name: "SMS Inbox", href: "/dashboard/inbox/sms", icon: MessageSquare, roles: ["CLOSING_MANAGER"] },
      { name: "Email Inbox", href: "/dashboard/inbox/email", icon: Mail, roles: ["CLOSING_MANAGER"] },
      { name: "Broker Management", href: "/dashboard/closing-manager/broker-management", icon: Handshake, roles: ["CLOSING_MANAGER"] },
      { name: "Handover", href: "/dashboard/closing-manager/handover", icon: CheckSquare, roles: ["CLOSING_MANAGER"] },
      { name: "Analytics", href: "/dashboard/closing-manager/analytics", icon: BarChart2, roles: ["CLOSING_MANAGER"] },
      { name: "Settings", href: "/dashboard/closing-manager/settings", icon: Settings, roles: ["CLOSING_MANAGER"] },
    ];
  }

  if (userRole === "CHANNEL_PARTNER") {
    return [
      { name: "Overview", href: "/dashboard/channel-partner", icon: LayoutDashboard, roles: ["CHANNEL_PARTNER"] },
      { name: "Customer Management", href: "/dashboard/channel-partner/customer-management", icon: Users, roles: ["CHANNEL_PARTNER"] },
      { name: "Employees", href: "/dashboard/channel-partner/employees", icon: Briefcase, roles: ["CHANNEL_PARTNER"] },
      { name: "Broker Management", href: "/dashboard/channel-partner/broker-management", icon: Handshake, roles: ["CHANNEL_PARTNER"] },
      { name: "Inventory", href: "/dashboard/channel-partner/inventory", icon: Package, roles: ["CHANNEL_PARTNER"] },
      { name: "Analytics", href: "/dashboard/channel-partner/analytics", icon: BarChart2, roles: ["CHANNEL_PARTNER"] },
      { name: "Settings", href: "/dashboard/channel-partner/settings", icon: Settings, roles: ["CHANNEL_PARTNER"] },
    ];
  }

  if (userRole === "BUSINESS_MANAGER") {
    return [
      { name: "Overview", href: "/dashboard/business-manager", icon: LayoutDashboard, roles: ["BUSINESS_MANAGER"] },
      { name: "Leads", href: "/dashboard/business-manager/leads", icon: Users, roles: ["BUSINESS_MANAGER"] },
      { name: "WhatsApp Inbox", href: "/dashboard/inbox/whatsapp", icon: MessageSquare, roles: ["BUSINESS_MANAGER"] },
      { name: "SMS Inbox", href: "/dashboard/inbox/sms", icon: MessageSquare, roles: ["BUSINESS_MANAGER"] },
      { name: "Email Inbox", href: "/dashboard/inbox/email", icon: Mail, roles: ["BUSINESS_MANAGER"] },
      { name: "Inventory", href: "/dashboard/business-manager/inventory", icon: Package, roles: ["BUSINESS_MANAGER"] },
      { name: "Financials", href: "/dashboard/business-manager/financials", icon: DollarSign, roles: ["BUSINESS_MANAGER"] },
      { name: "Employees", href: "/dashboard/business-manager/employees", icon: Briefcase, roles: ["BUSINESS_MANAGER"] },
      { name: "Marketing", href: "/dashboard/marketing", icon: Mail, roles: ["BUSINESS_MANAGER"] },
      { name: "Analytics", href: "/dashboard/business-manager/analytics", icon: BarChart2, roles: ["BUSINESS_MANAGER"] },
    ];
  }

  if (userRole === "DIRECTOR") {
    return [
      { name: "Overview", href: "/dashboard/director", icon: LayoutDashboard, roles: ["DIRECTOR"] },
      { name: "WhatsApp Inbox", href: "/dashboard/inbox/whatsapp", icon: MessageSquare, roles: ["DIRECTOR"] },
      { name: "SMS Inbox", href: "/dashboard/inbox/sms", icon: MessageSquare, roles: ["DIRECTOR"] },
      { name: "Email Inbox", href: "/dashboard/inbox/email", icon: Mail, roles: ["DIRECTOR"] },
      { name: "Pre-Sales", href: "/dashboard/pre-sales", icon: Users, roles: ["DIRECTOR"] },
      { name: "Sales", href: "/dashboard/sales", icon: Briefcase, roles: ["DIRECTOR"] },
      { name: "Marketing", href: "/dashboard/marketing", icon: Mail, roles: ["DIRECTOR"] },
      { name: "Post-Sales", href: "/dashboard/post-sales", icon: Handshake, roles: ["DIRECTOR"] },
      { name: "Finance", href: "/dashboard/finance", icon: DollarSign, roles: ["DIRECTOR"] },
    ];
  }

  if (userRole === "FINANCE") {
    return [
      { name: "Overview", href: "/dashboard/finance", icon: LayoutDashboard, roles: ["FINANCE"] },
      { name: "WhatsApp Inbox", href: "/dashboard/inbox/whatsapp", icon: MessageSquare, roles: ["FINANCE"] },
      { name: "SMS Inbox", href: "/dashboard/inbox/sms", icon: MessageSquare, roles: ["FINANCE"] },
      { name: "Email Inbox", href: "/dashboard/inbox/email", icon: Mail, roles: ["FINANCE"] },
    ];
  }

  if (userRole === "MARKETING") {
    const isEmailSub = pathname.startsWith("/dashboard/marketing/email");
    const isSmsSub = pathname.startsWith("/dashboard/marketing/sms");
    const isVoiceSub = pathname.startsWith("/dashboard/marketing/voice");
    const isAdsSub = pathname.startsWith("/dashboard/marketing/ads");
    const isWhatsAppSub = pathname.startsWith("/dashboard/marketing/whatsapp");

    if (isEmailSub) {
      return [
        { name: "Email Overview", href: "/dashboard/marketing/email", icon: LayoutDashboard, roles: ["MARKETING"] },
        { name: "Live Inbox", href: "/dashboard/marketing/email/inbox", icon: Inbox, roles: ["MARKETING"] },
        { name: "New Campaign", href: "/dashboard/marketing/email/campaigns/new", icon: Star, roles: ["MARKETING"] },
        { name: "Interactive Flows", href: "/dashboard/marketing/email/flows", icon: Workflow, roles: ["MARKETING"] },
        { name: "Email Settings", href: "/dashboard/marketing/email/settings", icon: Settings, roles: ["MARKETING"] },
      ];
    }
    if (isSmsSub) {
      return [
        { name: "SMS Overview", href: "/dashboard/marketing/sms", icon: LayoutDashboard, roles: ["MARKETING"] },
        { name: "Live Inbox", href: "/dashboard/marketing/sms/inbox", icon: Inbox, roles: ["MARKETING"] },
        { name: "New Broadcast", href: "/dashboard/marketing/sms/campaigns/new", icon: Send, roles: ["MARKETING"] },
        { name: "2-Way Flows", href: "/dashboard/marketing/sms/flows", icon: Workflow, roles: ["MARKETING"] },
        { name: "Gateways & Settings", href: "/dashboard/marketing/sms/settings", icon: Settings, roles: ["MARKETING"] },
      ];
    }
    if (isVoiceSub) {
      return [
        { name: "Voice Overview", href: "/dashboard/marketing/voice", icon: LayoutDashboard, roles: ["MARKETING"] },
        { name: "New Voice Call", href: "/dashboard/marketing/voice/campaigns/new", icon: PhoneCall, roles: ["MARKETING"] },
        { name: "Carrier & AI Gateways", href: "/dashboard/marketing/voice/settings", icon: Settings, roles: ["MARKETING"] },
      ];
    }
    if (isAdsSub) {
      return [
        { name: "Ads Hub Overview", href: "/dashboard/marketing/ads", icon: LayoutDashboard, roles: ["MARKETING"] },
        { name: "Meta (Facebook) Ads", href: "/dashboard/marketing/ads/meta", icon: Globe, roles: ["MARKETING"] },
        { name: "Instagram Ads", href: "/dashboard/marketing/ads/instagram", icon: InstagramIcon, roles: ["MARKETING"] },
        { name: "Google Ads", href: "/dashboard/marketing/ads/google", icon: Search, roles: ["MARKETING"] },
        { name: "YouTube Video Ads", href: "/dashboard/marketing/ads/youtube", icon: Video, roles: ["MARKETING"] },
      ];
    }
    if (isWhatsAppSub) {
      return [
        { name: "WhatsApp Overview", href: "/dashboard/marketing/whatsapp", icon: LayoutDashboard, roles: ["MARKETING"] },
        { name: "Live Inbox", href: "/dashboard/marketing/whatsapp/inbox", icon: MessageSquare, roles: ["MARKETING"] },
        { name: "Pipelines & Deals", href: "/dashboard/marketing/whatsapp/pipelines", icon: GitBranch, roles: ["MARKETING"] },
        { name: "Broadcasts", href: "/dashboard/marketing/whatsapp/broadcasts", icon: Send, roles: ["MARKETING"] },
        { name: "Contacts", href: "/dashboard/marketing/whatsapp/contacts", icon: Users, roles: ["MARKETING"] },
        { name: "Automations", href: "/dashboard/marketing/whatsapp/automations", icon: Zap, roles: ["MARKETING"] },
        { name: "Interactive Flows", href: "/dashboard/marketing/whatsapp/flows", icon: Briefcase, roles: ["MARKETING"] },
        { name: "Templates", href: "/dashboard/marketing/whatsapp/templates", icon: FileText, roles: ["MARKETING"] },
        { name: "Settings", href: "/dashboard/marketing/whatsapp/settings", icon: Settings, roles: ["MARKETING"] },
      ];
    }

    return [
      { name: "Overview", href: "/dashboard/marketing", icon: LayoutDashboard, roles: ["MARKETING"] },
      { name: "WhatsApp CRM", href: "/dashboard/marketing/whatsapp", icon: Radio, roles: ["MARKETING"] },
      { name: "Ads Marketing", href: "/dashboard/marketing/ads", icon: Globe, roles: ["MARKETING"] },
      { name: "AI Voice Calling", href: "/dashboard/marketing/voice", icon: Phone, roles: ["MARKETING"] },
      { name: "SMS Campaigns", href: "/dashboard/marketing/sms", icon: MessageSquare, roles: ["MARKETING"] },
      { name: "Email Marketing", href: "/dashboard/marketing/email", icon: Mail, roles: ["MARKETING"] },
      { name: "Analytics", href: "/dashboard/marketing/analytics", icon: BarChart2, roles: ["MARKETING"] },
      { name: "Settings & BYO", href: "/dashboard/marketing/settings", icon: Settings, roles: ["MARKETING"] },
    ];
  }

  if (userRole === "ADMIN") {
    return [
      { name: "Overview", href: "/dashboard/admin", icon: LayoutDashboard, roles: ["ADMIN"] },
      { name: "WhatsApp Hub", href: "/dashboard/inbox/whatsapp", icon: MessageSquare, roles: ["ADMIN"] },
      { name: "SMS Hub", href: "/dashboard/inbox/sms", icon: MessageSquare, roles: ["ADMIN"] },
      { name: "Email Hub", href: "/dashboard/inbox/email", icon: Mail, roles: ["ADMIN"] },
      { name: "Settings", href: "/dashboard/admin/settings", icon: Settings, roles: ["ADMIN"] },
    ];
  }

  return [
    { name: "Overview", href: "/dashboard/pre-sales", icon: LayoutDashboard, roles: ["*"] },
  ];
}

export const ROLE_TO_ROUTE_MAP: Record<string, string> = {
  PRE_SALES: "/dashboard/pre-sales",
  PRE_SALES_MANAGER: "/dashboard/pre-sales-manager",
  SALES_EXECUTIVE: "/dashboard/sales-executive",
  SALES_MANAGER: "/dashboard/sales-manager",
  POST_SALES: "/dashboard/post-sales",
  POST_SALES_MANAGER: "/dashboard/post-sales-manager",
  FINANCE: "/dashboard/finance",
  BUSINESS_MANAGER: "/dashboard/business-manager",
  DIRECTOR: "/dashboard/director",
  ADMIN: "/dashboard/admin",
  MARKETING: "/dashboard/marketing",
  SOURCING_MANAGER: "/dashboard/sourcing-manager",
  CLOSING_MANAGER: "/dashboard/closing-manager",
  CHANNEL_PARTNER: "/dashboard/channel-partner",
};

export const ROLE_SECTION_PERMISSIONS: Record<string, string[]> = {
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

export function isSectionAllowedForRole(section: string, roleCode: string): boolean {
  if (!section) return true;
  if (roleCode === "ADMIN") return true;
  const allowed = ROLE_SECTION_PERMISSIONS[section];
  if (!allowed) return true; // Unrestricted sections (e.g. inbox, overview)
  return allowed.includes(roleCode);
}

