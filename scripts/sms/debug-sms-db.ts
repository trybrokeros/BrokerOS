import { prismaClient as prisma } from '@brokeros/prisma';

async function main() {
  const integrations = await prisma.smsIntegration.findMany({
    include: { senderNumbers: true },
  });
  console.log('=== SMS Integrations in DB ===');
  for (const int of integrations) {
    console.log({
      id: int.id,
      provider: int.provider,
      name: int.name,
      fromSender: int.fromSender,
      accountSid: int.accountSid ? `${int.accountSid.slice(0, 8)}...` : null,
      authToken: int.authToken ? 'PRESENT' : null,
      messagingServiceSid: int.messagingServiceSid,
      senderNumbers: int.senderNumbers,
    });
  }

  const campaigns = await prisma.smsCampaign.findMany({
    include: { senderPools: true, recipients: { take: 5 } },
  });
  console.log('=== SMS Campaigns in DB ===');
  for (const c of campaigns) {
    console.log({
      id: c.id,
      title: c.title,
      fromSender: c.fromSender,
      providerType: c.providerType,
      senderPools: c.senderPools,
      recipients: c.recipients.map((r: any) => ({
        id: r.id,
        phone: r.phone,
        status: r.status,
        failReason: r.failReason,
        assignedSenderPhone: r.assignedSenderPhone,
      })),
    });
  }
}

main().finally(() => process.exit(0));
