import { prismaClient as prisma } from '@brokeros/prisma';
import { ClosingManagerDashboardService } from '../../apps/api/src/dashboard/closing-manager/closing-manager-dashboard.service.js';
import { ChannelPartnerDashboardService } from '../../apps/api/src/dashboard/channel-partner/channel-partner-dashboard.service.js';


async function main() {
  const closingService = new ClosingManagerDashboardService(prisma as any);
  const cpService = new ChannelPartnerDashboardService(prisma as any);

  // Get a user for Closing Manager
  const cmUser = await prisma.user.findFirst({ where: { role: { code: 'CLOSING_MANAGER' } } });

  // Get a user for Channel Partner
  const cpUser = await prisma.user.findFirst({ where: { role: { code: 'CHANNEL_PARTNER' } } });

  console.log("--- CLOSING MANAGER ---");
  if (cmUser) {
    try {
      const cmDash = await closingService.getDashboard(cmUser.id);
      console.log("WIDGETS:", JSON.stringify(cmDash.widgets, null, 2));
    } catch (e) {
      console.log("Error running CM dash:", e);
    }
  } else {
    console.log("No CM user found");
  }

  console.log("\n--- CHANNEL PARTNER ---");
  let userToUse = cpUser;
  if (!userToUse) {
    userToUse = await prisma.user.findFirst();
  }

  if (userToUse) {
    try {
      const cpDash = await cpService.getDashboard(userToUse.id);
      console.log("WIDGETS:", JSON.stringify(cpDash.kpis, null, 2));
    } catch (e) {
      console.log("Error running CP dash:", e);
    }
  }

  await prisma.$disconnect();
}

main().catch(console.error);
