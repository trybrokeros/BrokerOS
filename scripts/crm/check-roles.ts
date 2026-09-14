import { prismaClient as prisma } from '@brokeros/prisma';

async function main() {
  const roles = await prisma.role.findMany();
  console.log('Roles:', roles.map(r => r.code));

  const cmUsers = await prisma.user.findMany({
    where: { role: { code: { contains: 'CLOSING' } } },
    include: { role: true }
  });
  console.log('Closing Managers:', cmUsers.map(u => ({ id: u.id, role: u.role?.code })));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
