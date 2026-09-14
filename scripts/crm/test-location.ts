import { prismaClient as prisma } from '@brokeros/prisma';

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      lastLatitude: true,
      lastLongitude: true,
      lastLocationAt: true
    }
  });
  console.log("USERS IN DATABASE:");
  console.table(users);
}

main().catch(console.error).finally(() => prisma.$disconnect());

