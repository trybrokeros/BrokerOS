import { prismaClient as prisma } from '@brokeros/prisma';

async function main() {
  await prisma.user.deleteMany({});
  console.log('DELETED ALL USERS');
}
main().finally(() => prisma.$disconnect());

