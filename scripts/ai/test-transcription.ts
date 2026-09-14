import { prismaClient as prisma } from '@brokeros/prisma';
import { TranscriptionService } from '../../apps/api/src/leads/call-records/transcription.service.js';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
process.loadEnvFile();

const transcriptionService = new TranscriptionService();

async function runTest() {
  console.log('Starting transcription test...');
  await transcriptionService.onModuleInit(); // Load the model

  try {
    const lead = await prisma.lead.findFirst({
      where: {
        firstName: 'Tarun',
        lastName: 'Bhatia'
      }
    });

    if (!lead) {
      console.log('Lead Tarun Bhatia not found.');
      return;
    }

    console.log(`Found Lead: ${lead.firstName} ${lead.lastName} (ID: ${lead.id})`);

    const callRecords = await prisma.callRecord.findMany({
      where: {
        leadId: lead.id,
        recordingUrl: { not: null },
      },
      orderBy: { startedAt: 'desc' },
      take: 2
    });

    if (callRecords.length === 0) {
      console.log('No call recordings found for this lead.');
      return;
    }

    console.log(`Found ${callRecords.length} call records to process.`);

    for (const record of callRecords) {
      console.log(`Processing CallRecord: ${record.id}`);

      if (!record.recordingUrl) continue;

      let buffer: Buffer;

      if (record.recordingUrl.includes('vercel-storage.com')) {
        console.log('Downloading from Vercel Blob...');
        const res = await fetch(record.recordingUrl, {
          headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` }
        });

        if (!res.ok) {
          console.error(`Failed to download blob: ${res.statusText}`);
          continue;
        }

        const arrayBuffer = await res.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } else {
        console.log('Not a Vercel Blob URL, skipping...');
        continue;
      }

      const tempFilePath = path.join(os.tmpdir(), `test-record-${record.id}.mp3`);
      fs.writeFileSync(tempFilePath, buffer);
      console.log(`Saved temp file to: ${tempFilePath}`);

      console.log('Running whisper transcription...');

      const finalTranscript = await transcriptionService.transcribeAudio(tempFilePath);

      console.log('--- TRANSCRIPT ---');
      console.log(finalTranscript);
      console.log('------------------');

      await prisma.callRecord.update({
        where: { id: record.id },
        data: { aiTranscript: finalTranscript }
      });
      console.log('Updated database successfully!');

      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }

    console.log('Test completed successfully!');
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();

