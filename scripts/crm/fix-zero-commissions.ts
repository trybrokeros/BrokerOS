import { prismaClient as prisma } from '@brokeros/prisma';

async function main() {
  const commissions = await prisma.inboundCommission.findMany({
    where: { commissionAmount: 0 },
    include: { unit: true }
  });

  for (const comm of commissions) {
    const unit = comm.unit;
    const basePrice = unit.basePrice ? Number(unit.basePrice) : 0;
    const commPct = 2;
    const commAmt = (basePrice * commPct) / 100;

    await prisma.unit.update({
      where: { id: unit.id },
      data: { commissionPercentage: commPct, commissionAmount: commAmt }
    });

    await prisma.inboundCommission.update({
      where: { id: comm.id },
      data: { commissionAmount: commAmt }
    });

    console.log(`Updated Unit ${unit.unitNumber}: Commission set to ${commPct}% ($${commAmt})`);
  }
}
main().catch(console.error).finally(() => process.exit(0));
