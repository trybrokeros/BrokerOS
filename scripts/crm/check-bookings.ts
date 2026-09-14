import { prismaClient as prisma } from '@brokeros/prisma';

async function main() {
  const bookings = await prisma.booking.findMany();
  console.log('Total bookings:', bookings.length);
  const nonCancelled = bookings.filter(b => b.status !== 'CANCELLED');
  console.log('Non-cancelled bookings:', nonCancelled.length);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
