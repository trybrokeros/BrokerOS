import { prismaClient as prisma } from '@brokeros/prisma';

const projectId = 'e8c45a9a-8ef2-468f-be4b-4829a38160d6';

async function main() {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      towers: {
        include: {
          floors: {
            include: {
              units: {
                include: {
                  bookings: {
                    include: {
                      customer: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!project) {
    console.log('Project not found');
    process.exit(1);
  }

  console.log(`\n==================================================`);
  console.log(`PROJECT: ${project.name}`);
  console.log(`==================================================`);

  for (const tower of project.towers) {
    for (const floor of tower.floors) {
      for (const unit of floor.units) {
        console.log(`\n▶ Unit: ${unit.unitNumber} (Tower: ${tower.name} | Floor: ${floor.floorNumber})`);
        console.log(`  Status: ${unit.status} | Base Price: ${unit.basePrice}`);
        console.log(`  Commission %: ${unit.commissionPercentage || 'NOT SET'} | Amount: ${unit.commissionAmount || 'NOT SET'}`);

        if (unit.bookings && unit.bookings.length > 0) {
          const booking = unit.bookings[0];
          console.log(`  [Booking Found] ID: ${booking.id}`);
          console.log(`  Customer: ${booking.customer.firstName} ${booking.customer.lastName}`);
          // console.log(`  Possession Status: ${booking.possessionStatus}`);
        } else {
          console.log(`  [No Booking Associated]`);
        }
      }
    }
  }

  console.log(`\n==================================================\n`);
}

main().catch(console.error).finally(() => process.exit(0));
