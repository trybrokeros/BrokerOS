import { prismaClient as prisma } from '@brokeros/prisma';

async function main() {
  const integrations = await prisma.marketingIntegration.findMany();
  console.log('Total Marketing Integrations in DB:', integrations.length);
  for (const item of integrations) {
    console.log({
      id: item.id,
      name: item.name,
      provider: item.provider,
      fromEmail: item.fromEmail,
      fromName: item.fromName,
      isDefault: item.isDefault,
      isActive: item.isActive,
      apiKeyLength: item.apiKey ? item.apiKey.length : 0,
      apiKeyPrefix: item.apiKey ? item.apiKey.substring(0, 7) : 'NONE',
    });
  }
}

main().finally(() => prisma.$disconnect());
