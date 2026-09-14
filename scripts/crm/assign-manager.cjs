import { prismaClient as prisma } from '../../apps/api/src/lib/database/prisma-client.js';

async function main() {
  const manager = await prisma.user.findFirst({ where: { name: 'Sales manager User 1' } });
  if (!manager) return console.log('Manager not found');

  const tower = await prisma.tower.findFirst();
  if (!tower) return console.log('Tower not found');

  // Check if already assigned
  const existing = await prisma.towerAssignment.findFirst({
    where: { userId: manager.id, towerId: tower.id, role: 'SOURCING_MANAGER' }
  });

  if (!existing) {
    await prisma.towerAssignment.create({
      data: { userId: manager.id, towerId: tower.id, role: 'SOURCING_MANAGER' }
    });
    console.log('Assigned!');
  } else {
    console.log('Already assigned!');
  }
}

main();
