import { prismaClient as prisma } from '@brokeros/prisma';

async function main() {
  console.log('--- Payment Tracking Logic Test ---');

  // 1. Find a Closing Manager who has a booking
  // 1. Find any booking in the system to use for testing
  const testBooking = await prisma.booking.findFirst({
    include: {
      customer: true
    }
  });

  if (!testBooking) {
    console.log('No bookings found in the database. Please create a dummy booking manually to run this test.');
    return;
  }
  console.log(`Testing with Booking ${testBooking.bookingNumber} for Lead ${testBooking.customer.leadId}`);

  // 2. Clean up any existing test schedules for this booking
  await prisma.paymentSchedule.deleteMany({
    where: { bookingId: testBooking.id, milestoneName: { startsWith: 'Test Milestone' } }
  });

  // 3. Create dummy schedules
  // - Schedule 1: Due in exactly 3 days (Pre-payment reminder)
  // - Schedule 2: Due yesterday (Overdue reminder)
  const now = new Date();

  const in3Days = new Date();
  in3Days.setDate(now.getDate() + 3);
  in3Days.setHours(0, 0, 0, 0); // Normalize to start of day

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  console.log('\nCreating Test Payment Schedules...');

  const schedule1 = await prisma.paymentSchedule.create({
    data: {
      bookingId: testBooking.id,
      milestoneName: 'Test Milestone T-3',
      sequenceOrder: 1,
      amount: 50000,
      dueDate: in3Days,
      status: 'PENDING',
      remainingAmount: 50000,
    }
  });

  const schedule2 = await prisma.paymentSchedule.create({
    data: {
      bookingId: testBooking.id,
      milestoneName: 'Test Milestone T+1 (Overdue)',
      sequenceOrder: 2,
      amount: 50000,
      dueDate: yesterday,
      status: 'PENDING',
      remainingAmount: 50000,
    }
  });

  console.log('Created Schedules:');
  console.log(`- ${schedule1.milestoneName} due on ${schedule1.dueDate}`);
  console.log(`- ${schedule2.milestoneName} due on ${schedule2.dueDate}`);

  // 4. Test Cron Queries
  console.log('\nTesting CRON Queries...');

  // Helper to get normalized date range for a specific relative day
  const getDayRange = (daysOffset: number) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysOffset);
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(targetDate.getDate() + 1);

    return { gte: targetDate, lt: nextDay };
  };

  // 4a. Find schedules due in 3 days
  const dueIn3DaysQuery = getDayRange(3);
  const upcomingPayments = await prisma.paymentSchedule.findMany({
    where: {
      status: 'PENDING',
      dueDate: dueIn3DaysQuery
    },
    include: {
      booking: true
    }
  });
  console.log(`Found ${upcomingPayments.length} payments due in exactly 3 days.`);
  upcomingPayments.forEach(p => console.log(` -> Booking ${p.booking.bookingNumber} - ${p.milestoneName}`));

  // 4b. Find schedules overdue by 1 day
  const overdueBy1DayQuery = getDayRange(-1);
  const overduePayments = await prisma.paymentSchedule.findMany({
    where: {
      status: 'PENDING',
      dueDate: overdueBy1DayQuery
    },
    include: {
      booking: true
    }
  });
  console.log(`Found ${overduePayments.length} payments overdue by exactly 1 day.`);
  overduePayments.forEach(p => console.log(` -> Booking ${p.booking.bookingNumber} - ${p.milestoneName}`));

  // 5. Cleanup
  console.log('\nCleaning up test data...');
  await prisma.paymentSchedule.deleteMany({
    where: { id: { in: [schedule1.id, schedule2.id] } }
  });
  console.log('Test complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
