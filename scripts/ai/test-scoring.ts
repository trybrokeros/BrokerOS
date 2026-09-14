import { prismaClient as prisma } from '@brokeros/prisma';
import { TranscriptionService } from '../../apps/api/src/leads/call-records/transcription.service.js';

const transcriptionService = new TranscriptionService();

async function run() {
  console.log("Starting AI Lead Scoring Test script...");

  // Find the most recent call record that has a transcript with actual content
  const recentCall = await prisma.callRecord.findFirst({
    where: {
      aiTranscript: { not: null }
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      lead: true
    }
  });

  if (!recentCall || !recentCall.aiTranscript || recentCall.aiTranscript.length <= 10) {
    console.log("No valid recent call record with a transcript found.");
    process.exit(0);
  }

  console.log(`\nFound Recent CallRecord: ${recentCall.id}`);
  console.log(`Lead: ${recentCall.lead?.firstName} ${recentCall.lead?.lastName}`);
  console.log(`Current Lead Score: ${recentCall.lead?.score}`);
  console.log(`\nTranscript Preview:\n"${recentCall.aiTranscript.substring(0, 150)}..."\n`);

  try {
    console.log(`Generating AI Lead Score using Llama 3.3...`);
    const aiScoreData = await transcriptionService.generateLeadScore(recentCall.aiTranscript);

    if (aiScoreData) {
      console.log(`\n✅ Scoring completed successfully!`);
      console.log(`Calculated Score: ${aiScoreData.score}`);
      console.log(`Assigned Category: ${aiScoreData.category}`);

      // Update the Lead in database
      await prisma.lead.update({
        where: { id: recentCall.leadId! },
        data: { score: aiScoreData.score }
      });
      console.log(`\n✅ Successfully updated Lead in the database with the new score.`);
    } else {
      console.log(`\n⚠️ Scoring failed or returned null.`);
    }
  } catch (error) {
    console.error(`\n❌ Error during scoring test:`, error);
  }

  console.log("\nTest completed!");
  process.exit(0);
}

run();

