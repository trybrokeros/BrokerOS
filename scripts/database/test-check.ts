import { prismaClient as prisma } from '@brokeros/prisma';

async function runTest() {
  console.log("Checking Brokerage Records...");
  const records = await prisma.brokerageRecord.findMany({
    include: { broker: true }
  });
  console.log(JSON.stringify(records, null, 2));
  process.exit(0);
}

runTest();
