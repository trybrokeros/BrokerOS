import { prismaClient as prisma } from '@brokeros/prisma';

async function main() {
  // Let's just find any booking and trace its relations
  const booking = await prisma.booking.findFirst({
    include: {
      customer: {
        include: {
          lead: {
            include: {
              broker: true
            }
          }
        }
      }
    }
  });

  console.log("Sample Booking:", JSON.stringify(booking, null, 2));

  // Find a Sourcing Manager to test
  const sourcingManager = await prisma.user.findFirst({
    where: {
      managedBrokers: {
        some: {}
      }
    }
  });

  if (sourcingManager) {
    console.log("Found Sourcing Manager:", sourcingManager.id);

    // Test the query
    const bookings = await prisma.booking.findMany({
      where: {
        customer: {
          lead: {
            broker: {
              sourcingManagerId: sourcingManager.id
            }
          }
        }
      },
      include: {
        customer: {
          include: {
            lead: true
          }
        }
      }
    });
    console.log(`Found ${bookings.length} bookings for Sourcing Manager ${sourcingManager.id}`);

    if (bookings.length > 0) {
      console.log("Sample Booking for SM:", bookings[0].totalPayable, bookings[0].status);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
