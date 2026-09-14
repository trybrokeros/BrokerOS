// ============================================================================
// BrokerOS — Email Interactive Flows Management Page
// ============================================================================

'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings, Mail, Inbox } from 'lucide-react';
import { DashboardPageWrapper } from '@/components/dashboard/DashboardPageWrapper';
import { Button } from '@/components/ui/Button';
import { EmailFlowsTable } from '@/features/marketing/email/components/flows/EmailFlowsTable';

export default function EmailFlowsPage() {
  return (
    <DashboardPageWrapper
      loading={false}
      title="Email Automations & Flow Workflows"
      subtitle="Automated reply sequences, Groq AI concierge, CRM taggers, and Pre-Sales handoff trees."
      headerRight={
        <div className="flex items-center gap-2">
          <Link href="/dashboard/marketing/email/inbox">
            <Button variant="outline" size="sm" className="gap-2 text-xs font-bold text-blue-600 border-blue-200 hover:bg-blue-50">
              <Inbox className="w-3.5 h-3.5" />
              <span>Live Inbox</span>
            </Button>
          </Link>
          <Link href="/dashboard/marketing/email">
            <Button variant="outline" size="sm" className="gap-2 text-xs font-bold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Broadcasts</span>
            </Button>
          </Link>
          <Link href="/dashboard/marketing/email/settings">
            <Button variant="outline" size="sm" className="gap-2 text-xs font-bold">
              <Settings className="w-3.5 h-3.5" />
              <span>Settings & Tools</span>
            </Button>
          </Link>
        </div>
      }
    >
      <EmailFlowsTable />
    </DashboardPageWrapper>
  );
}
