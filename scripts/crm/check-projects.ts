import { prismaClient as prisma } from '@brokeros/prisma';


async function main() {
  const projects = await prisma.project.findMany({
    include: {
      towers: {
        include: {
          floors: {
            include: {
              units: {
                where: { status: { in: ['RESERVED', 'SOLD'] } },
              },
            },
          },
        },
      },
    },
  });

  console.log("Total projects found:", projects.length);
  projects.forEach(p => {
    let count = 0;
    p.towers.forEach(t => t.floors.forEach(f => f.units.forEach(u => count++)));
    console.log(`Project ${p.name} has ${count} units in RESERVED/SOLD status`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
