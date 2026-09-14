import { prismaClient as prisma } from '@brokeros/prisma';

async function main() {
  const assignments = await prisma.projectAssignment.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
          role: {
            select: { code: true }
          }
        }
      },
      project: {
        select: { name: true }
      }
    }
  });

  const salesExecs = assignments.filter(a => a.user.role?.code === 'SALES_EXECUTIVE');

  if (salesExecs.length === 0) {
    console.log("No projects assigned to Sales Executives.");
  } else {
    for (const a of salesExecs) {
      console.log(`Sales Executive: ${a.user.name} (${a.user.email}) -> Project: ${a.project.name} (Active: ${a.isActive})`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
