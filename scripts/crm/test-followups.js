import { prismaClient as prisma } from '@brokeros/prisma';
prisma.followUp.findMany({ include: { lead: true } })
  .then(res => console.log(JSON.stringify(res, null, 2)))
  .finally(() => prisma.$disconnect());

