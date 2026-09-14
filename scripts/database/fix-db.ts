import { prismaClient as prisma } from '@brokeros/prisma';

async function main() {
  const sms = await prisma.user.findMany({ where: { role: { code: 'SALES_MANAGER' } } });
  console.log('All Sales Managers:', sms.map(sm => ({ name: sm.name, email: sm.email, username: sm.username, id: sm.id })));

  const sm1 = sms.find(sm => sm.username === 'salesmanager_1' || sm.email?.includes('1'));

  if (sm1) {
    const res = await prisma.user.updateMany({
      where: { role: { code: 'SALES_EXECUTIVE' } },
      data: { managerId: sm1.id }
    });
    console.log(`Reassigned ${res.count} Sales Executives to ${sm1.name} (${sm1.username})`);

    // Also reassign all project assignments that had the OLD sales manager to this one
    // So the Sales Manager sees the inventory correctly
    const oldManager = sms.find(sm => sm.username === 'salesmanager_3' || sm.email?.includes('3'));
    if (oldManager) {
      const projs = await prisma.projectAssignment.findMany({ where: { userId: oldManager.id } });
      for (const p of projs) {
        await prisma.projectAssignment.upsert({
          where: { projectId_userId: { projectId: p.projectId, userId: sm1.id } },
          create: { projectId: p.projectId, userId: sm1.id, role: 'SALES_MANAGER' },
          update: {}
        });
      }
      console.log(`Reassigned projects from ${oldManager.username} to ${sm1.username}`);
    }
  }
}
main().finally(() => prisma.$disconnect());
