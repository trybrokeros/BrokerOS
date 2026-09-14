import { prismaClient as prisma } from '@brokeros/prisma';

async function main() {
    const leadsWithBroker = await prisma.lead.count({ where: { brokerId: { not: null } } });
    console.log("Leads with brokerId not null: ", leadsWithBroker);

    // Followups for leads with brokers
    const followsForBrokerLeads = await prisma.followUp.count({
        where: {
            status: 'SCHEDULED',
            lead: { brokerId: { not: null } }
        }
    });
    console.log("Scheduled followups for leads with brokerId: ", followsForBrokerLeads);

    // Followups where brokerId is not null
    const followsOnBroker = await prisma.followUp.count({
        where: {
            status: 'SCHEDULED',
            brokerId: { not: null }
        }
    });
    console.log("Scheduled followups ON a broker: ", followsOnBroker);
}
main();
