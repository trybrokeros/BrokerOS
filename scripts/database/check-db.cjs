import { prismaClient as prisma } from './src/lib/database/prisma-client.js';

async function run() {
  const bookings = await prisma.booking.findMany({ select: { id: true, closingManagerId: true } });
  console.log(bookings);
}
run().catch(console.error).finally(() => prisma.$disconnect());
