// ============================================================================
// BrokerOS — SMS Interactive Flows Management Page
// ============================================================================

'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings, MessageSquare, Inbox } from 'lucide-react';
import { DashboardPageWrapper } from '@/components/dashboard/DashboardPageWrapper';
import { Button } from '@/components/ui/Button';
import { SmsFlowsTable } from '@/features/marketing/sms/components/flows/SmsFlowsTable';

export default function SmsFlowsPage() {
  return (
    <DashboardPageWrapper
      loading={false}
      title="SMS Automations & Flow Workflows"
      subtitle="Automated keyword responders, first-inbound welcomes, CRM taggers, and conditional bot trees."
      headerRight={
        <div className="flex items-center gap-2">
          <Link href="/dashboard/marketing/sms/inbox">
            <Button variant="outline" size="sm" className="gap-2 text-xs font-bold text-blue-600 border-blue-200 hover:bg-blue-50">
              <Inbox className="w-3.5 h-3.5" />
              <span>Live Inbox</span>
            </Button>
          </Link>
          <Link href="/dashboard/marketing/sms">
            <Button variant="outline" size="sm" className="gap-2 text-xs font-bold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Broadcasts</span>
            </Button>
          </Link>
          <Link href="/dashboard/marketing/sms/settings">
            <Button variant="outline" size="sm" className="gap-2 text-xs font-bold">
              <Settings className="w-3.5 h-3.5" />
              <span>Gateways & AI</span>
            </Button>
          </Link>
        </div>
      }
    >
      <SmsFlowsTable />
    </DashboardPageWrapper>
  );
}
