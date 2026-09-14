import { prismaClient as prisma } from '@brokeros/prisma';
import { BookingCreationService } from '../../apps/api/src/leads/bookings/booking-creation.service.js';

async function runTest() {
  console.log("Starting Booking Commission Test...");
  const bookingService = new BookingCreationService(prisma as any, {} as any);

  try {
    // Find an existing unit
    const unit = await prisma.unit.findFirst({
      where: { status: 'AVAILABLE' },
      include: { floor: { include: { tower: { include: { project: true } } } } }
    });
    if (!unit) throw new Error("No available unit found in DB for testing.");

    // Find an existing broker or create one
    let broker = await prisma.broker.findFirst();
    if (!broker) {
      broker = await prisma.broker.create({
        data: {
          name: 'Test Broker',
          phone: `123456${Date.now().toString().slice(-4)}`,
          brokerCode: `BRK${Date.now()}`,
          status: 'NEW',
        }
      });
    }

    // Ensure Deal Card exists
    const projectId = unit.floor?.tower?.projectId;
    if (projectId) {
      const existingDeal = await prisma.brokerProjectAssignment.findUnique({
        where: { brokerId_projectId: { brokerId: broker.id, projectId: projectId } }
      });
      if (!existingDeal) {
        await prisma.brokerProjectAssignment.create({
          data: { brokerId: broker.id, projectId: projectId, brokeragePercent: 5.5 }
        });
      } else {
        await prisma.brokerProjectAssignment.update({
          where: { brokerId_projectId: { brokerId: broker.id, projectId: projectId } },
          data: { brokeragePercent: 5.5 }
        });
      }
    }

    let salesExec = await prisma.user.findFirst();
    if (!salesExec) throw new Error("No user found.");

    if (!salesExec) throw new Error("No user found.");

    const lead = await prisma.lead.create({
      data: {
        firstName: 'Test',
        lastName: 'Lead',
        email: `lead${Date.now()}@test.com`,
        phone: `99${Date.now().toString().slice(-8)}`,
        brokerId: broker.id,
        status: 'NEW'
      }
    });

    console.log("Data setup complete. Initiating Booking...");

    // Act
    const booking = await bookingService.createBooking(lead.id, {
      userId: salesExec.id,
      unitId: unit.id,
      agreedPrice: 1000000,
      bookingAmount: 10000,
    });

    console.log("Booking created successfully!");
    console.log(`Booking Commission %: ${booking.commissionPercentage}`);
    console.log(`Booking Commission Amt: ${booking.commissionAmount}`);

    // Verify Unit
    const updatedUnit = await prisma.unit.findUnique({ where: { id: unit.id } });
    console.log(`Unit Commission %: ${updatedUnit?.commissionPercentage}`);


  } catch (error) {
    console.error("Test Error:", error);
  } finally {
    console.log("Test finished.");
    process.exit(0);
  }
}

runTest();
