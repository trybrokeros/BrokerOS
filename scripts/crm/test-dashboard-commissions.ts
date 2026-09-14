import { prismaClient as prisma } from '@brokeros/prisma';
import { BrokersService } from '../../apps/api/src/brokers/brokers.service.js';
import { TranscriptionService } from '../../apps/api/src/leads/call-records/transcription.service.js';
// import { HttpService } from '@nestjs/axios';

async function runTest() {
  console.log("Fetching Commissions for Sourcing Manager Dashboard...\n");

  try {
    // We will use the Sourcing Manager from the previous test, or a known one
    // Use the exact Sourcing Manager ID the user mentioned
    const sourcingManager = await prisma.user.findUnique({
      where: { id: 'EMiwppVdzkdy6x15QgMEMaEYIv6baI6q' }
    });

    if (!sourcingManager) {
      console.log("No Sourcing Manager found.");
      process.exit(1);
    }

    console.log(`Using Sourcing Manager: ${sourcingManager.name} (ID: ${sourcingManager.id})`);

    // We can instantiate BrokersService with mock dependencies if needed,
    // but a direct Prisma query for what getCommissions does is perfectly accurate:
    // getCommissions logic:
    // whereClause = { broker: { sourcingManagerId: userId } };

    const commissions = await prisma.brokerageRecord.findMany({
      where: { broker: { sourcingManagerId: sourcingManager.id } },
      include: {
        broker: { select: { id: true, name: true, phone: true } },
        booking: { include: { customer: true, unit: { include: { floor: { include: { tower: { include: { project: true } } } } } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\n================ Total Commissions Found: ${commissions.length} ================`);

    let totalPending = 0;
    let totalPaid = 0;

    commissions.forEach((c, i) => {
      console.log(`\n--- Record ${i + 1} ---`);
      console.log(`Broker: ${c.broker.name}`);
      console.log(`Project: ${c.booking?.unit?.floor?.tower?.project?.name}`);
      console.log(`Unit: ${c.booking?.unit?.unitNumber}`);
      console.log(`Status: ${c.status}`);
      console.log(`Commission Amount: ₹${c.brokerageAmount}`);
      console.log(`Booking Value: ₹${c.bookingValue}`);

      if (c.status === 'PENDING') totalPending += Number(c.brokerageAmount);
      if (c.status === 'PAID') totalPaid += Number(c.brokerageAmount);
    });

    console.log(`\n================ SUMMARY ================`);
    console.log(`Total PENDING Value: ₹${totalPending.toLocaleString('en-IN')}`);
    console.log(`Total PAID Value: ₹${totalPaid.toLocaleString('en-IN')}`);

  } catch (error) {
    console.error("Test Error:", error);
  } finally {
    process.exit(0);
  }
}

runTest();
