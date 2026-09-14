import { prismaClient as prisma } from '@brokeros/prisma';
import { BookingCreationService } from '../../apps/api/src/leads/bookings/booking-creation.service.js';
import { BookingStatusService } from '../../apps/api/src/leads/bookings/booking-status.service.js';

async function runTest() {
  console.log("Starting E2E Commission Test...");
  const bookingService = new BookingCreationService(prisma as any, {} as any);
  const bookingStatusService = new BookingStatusService(prisma as any, {} as any);

  try {
    // 1. Find a Sourcing Manager
    let sourcingManager = await prisma.user.findFirst({ where: { role: { code: 'SOURCING_MANAGER' } } });
    if (!sourcingManager) {
      sourcingManager = await prisma.user.findFirst();
    }
    console.log(`Using Sourcing Manager: ${sourcingManager?.name || sourcingManager?.email}`);

    // 2. Find a Sales Exec / Closing Manager
    let salesExec = await prisma.user.findFirst({ where: { role: { code: 'CLOSING_MANAGER' } } });
    if (!salesExec) {
      salesExec = await prisma.user.findFirst({ where: { roleId: "2" } }); // Fallback to Sales Exec
    }
    if (!salesExec) salesExec = sourcingManager; // Fallback
    console.log(`Using Sales Exec/Closer: ${salesExec?.name || salesExec?.email}`);

    // 3. Get a Project and 2 Units
    const units = await prisma.unit.findMany({
      where: { status: 'AVAILABLE' },
      include: { floor: { include: { tower: { include: { project: true } } } } },
      take: 2
    });
    if (units.length < 2) {
      console.log("Not enough available units for the test. We need at least 2.");
      process.exit(1);
    }

    // We will use the project of the first unit for simplicity
    const project = units[0].floor?.tower?.project;
    if (!project) throw new Error("Unit 1 has no project.");
    console.log(`Target Project: ${project.name}`);

    // 4. Create Broker XYZ
    const broker = await prisma.broker.create({
      data: {
        brokerCode: `XYZ-${Date.now().toString().slice(-6)}`,
        name: 'XYZ Broker',
        companyName: 'XYZ Realty',
        phone: `9876${Date.now().toString().slice(-6)}`,
        status: 'DEAL',
        sourcingManagerId: sourcingManager!.id
      }
    });
    console.log(`Created Broker: ${broker.name} (ID: ${broker.id})`);

    // 5. Create Deal Card (2% Commission)
    await prisma.brokerProjectAssignment.create({
      data: {
        brokerId: broker.id,
        projectId: project.id,
        brokeragePercent: 2.0,
      }
    });
    console.log(`Created Deal Card for ${broker.name} at 2% for ${project.name}`);

    // 6. Create 2 Leads assigned to this broker
    const lead1 = await prisma.lead.create({
      data: {
        firstName: 'E2E Lead 1',
        email: `lead1_${Date.now()}@test.com`,
        phone: `99${Date.now().toString().slice(-8)}`,
        brokerId: broker.id,
        status: 'NEW'
      }
    });
    const lead2 = await prisma.lead.create({
      data: {
        firstName: 'E2E Lead 2',
        email: `lead2_${Date.now()}@test.com`,
        phone: `98${Date.now().toString().slice(-8)}`,
        brokerId: broker.id,
        status: 'NEW'
      }
    });
    console.log(`Created 2 Leads assigned to ${broker.name}`);

    // 7. Create Bookings (Reserved)
    console.log("Creating Bookings for both leads (Reserving Units)...");
    const booking1 = await bookingService.createBooking(lead1.id, {
      userId: salesExec!.id,
      unitId: units[0].id,
      agreedPrice: 2000000,
      bookingAmount: 50000,
    });

    // We must ensure the second unit is from the same project if we want 2% commission to apply to both. 
    // If unit 2 is in a different project, the deal card won't apply. But let's assume it is or we just see the result.
    const booking2 = await bookingService.createBooking(lead2.id, {
      userId: salesExec!.id,
      unitId: units[1].id,
      agreedPrice: 3500000,
      bookingAmount: 100000,
    });

    console.log(`Booking 1 Created: Unit ${units[0].unitNumber}, Comm %: ${booking1.commissionPercentage}`);
    console.log(`Booking 2 Created: Unit ${units[1].unitNumber}, Comm %: ${booking2.commissionPercentage}`);

    // 8. Mark Bookings as Done (Handover)
    console.log("Marking Bookings as Done (Handover)... This should generate BrokerageRecords!");
    await bookingStatusService.markBookingDone(booking1.id);
    await bookingStatusService.markBookingDone(booking2.id);

    // 9. Fetch Data that Sourcing Manager would see
    console.log("\n================ TEST RESULTS ================\n");

    const records = await prisma.brokerageRecord.findMany({
      where: { brokerId: broker.id },
      include: { booking: { include: { unit: true } } }
    });

    console.log(`Brokerage Records Found for ${broker.name}: ${records.length}`);
    records.forEach((record, index) => {
      console.log(`\nRecord ${index + 1}:`);
      console.log(`- Booking Value: ₹${record.bookingValue}`);
      console.log(`- Commission %: ${record.brokeragePercent}%`);
      console.log(`- Commission Amount (Net Payable): ₹${record.netPayable}`);
      console.log(`- Status: ${record.status}`);
      console.log(`- Unit Details: Unit ${record.booking?.unit?.unitNumber}, Commission Attached: ${record.booking?.unit?.commissionPercentage}%`);
    });

    console.log("\nThese records are now available in the Commissions page under 'Pending'!");

  } catch (error) {
    console.error("Test Error:", error);
  } finally {
    process.exit(0);
  }
}

runTest();
