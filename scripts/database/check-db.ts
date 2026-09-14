import { prismaClient as prisma } from '@brokeros/prisma';

async function main() {
  const sm = await prisma.user.findFirst({ where: { role: { code: 'SALES_MANAGER' } } });
  console.log('Sales Manager:', sm?.name, sm?.id);

  const employees = await prisma.user.findMany({ where: { managerId: sm?.id } });
  console.log('Employees assigned to SM:', employees.length, employees.map(e => e.name));

  const seRoles = await prisma.role.findFirst({ where: { code: 'SALES_EXECUTIVE' } });
  const allSEs = await prisma.user.findMany({ where: { roleId: seRoles?.id } });
  console.log('Total SEs in DB:', allSEs.length, allSEs.map(e => ({ name: e.name, managerId: e.managerId })));
}
main().finally(() => prisma.$disconnect());
