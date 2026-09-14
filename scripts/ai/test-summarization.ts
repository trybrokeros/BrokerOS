import { prismaClient as prisma } from '@brokeros/prisma';
import { TranscriptionService } from '../../apps/api/src/leads/call-records/transcription.service.js';
process.loadEnvFile();
const transcriptionService = new TranscriptionService();

async function run() {
  console.log("Starting AI Summarization backfill script...");

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

  if (!recentCall) {
    console.log("No valid recent call record found.");
    process.exit(0);
  }

  const callRecords = [recentCall];

  console.log(`Found ${callRecords.length} records that need summarization.`);

  for (const record of callRecords) {
    console.log(`\nProcessing CallRecord: ${record.id} (Lead: ${record.lead?.firstName} ${record.lead?.lastName})`);

    if (record.aiTranscript && record.aiTranscript.length > 10) {
      try {
        console.log(`Generating summary and extracting info using Groq Llama 3.3...`);
        const availableProjects = await prisma.project.findMany({
          where: { isActive: true },
          select: { id: true, name: true }
        });

        const summaryResult = await transcriptionService.summarizeCall(record.aiTranscript, record.lead?.status, availableProjects);

        let summaryText = '';
        if (typeof summaryResult === 'string') {
          summaryText = summaryResult;
        } else if (summaryResult) {
          summaryText = summaryResult.summary;

          const updateData: any = {};
          if (summaryResult.nextStepSuggestion) updateData.aiNextStepSuggestion = summaryResult.nextStepSuggestion;

          if (record.lead) {
            if (!record.lead.budget && summaryResult.extractedBudget) updateData.budget = summaryResult.extractedBudget;
            if (!record.lead.interestedProjectId && summaryResult.extractedProjectId) updateData.interestedProjectId = summaryResult.extractedProjectId;
            if (!record.lead.preferredLocation && summaryResult.extractedLocation) updateData.preferredLocation = summaryResult.extractedLocation;
            if (!record.lead.requirements && summaryResult.extractedRequirements) updateData.requirements = summaryResult.extractedRequirements;
          }

          if (Object.keys(updateData).length > 0) {
            await prisma.lead.update({
              where: { id: record.leadId! },
              data: updateData
            });
            console.log(`✅ Successfully updated Lead Info:`);
            console.log(JSON.stringify(updateData, null, 2));
          } else {
            console.log(`⚠️ No fields were updated. (Maybe they are already filled?)`);
            console.log('AI Extraction returned: ', {
              extractedBudget: summaryResult.extractedBudget,
              extractedProjectId: summaryResult.extractedProjectId,
              extractedLocation: summaryResult.extractedLocation,
              extractedRequirements: summaryResult.extractedRequirements,
            });
          }
        }

        if (summaryText) {
          await prisma.callRecord.update({
            where: { id: record.id },
            data: { aiSummary: summaryText }
          });
          console.log(`✅ Successfully updated CallRecord with AI summary.`);
          console.log(`Summary Preview: ${summaryText.substring(0, 50)}...`);
        } else {
          console.log(`⚠️ Summary was empty or failed.`);
        }
      } catch (error) {
        console.error(`❌ Error summarizing record ${record.id}:`, error);
      }
    } else {
      console.log(`Transcript too short, skipping.`);
    }
  }

  console.log("\nAll done!");
  process.exit(0);
}

run();

