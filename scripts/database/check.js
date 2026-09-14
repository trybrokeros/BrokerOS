"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("./src/generated/prisma");
const prisma = new prisma_1.PrismaClient();
async function main() {
    const users = await prisma.user.findMany({ where: { role: { code: 'CLOSING_MANAGER' } } });
    for (const user of users) {
        const bookingsByClosing = await prisma.booking.count({ where: { closingManagerId: user.id } });
        const bookingsByCreator = await prisma.booking.count({ where: { createdById: user.id } });
        const leadsByAssign = await prisma.lead.count({ where: { assignedUserId: user.id } });
        const leadsByCreator = await prisma.lead.count({ where: { createdById: user.id } });
        const bpa = await prisma.brokerProjectAssignment.count({ where: { closingManagerId: user.id } });
        const pa = await prisma.projectAssignment.count({ where: { userId: user.id } });
        if (bookingsByClosing > 0 || bookingsByCreator > 0 || leadsByAssign > 0 || leadsByCreator > 0 || bpa > 0 || pa > 0) {
            console.log('User:', user.email);
            console.log(' bookingsByClosing:', bookingsByClosing, 'bookingsByCreator:', bookingsByCreator);
            console.log(' leadsByAssign:', leadsByAssign, 'leadsByCreator:', leadsByCreator);
            console.log(' brokerProjectAssignments:', bpa, 'projectAssignments:', pa);
        }
    }
}
main();
