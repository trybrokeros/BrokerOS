import { prismaClient as prisma } from '@brokeros/prisma';
import { TranscriptionService } from '../../apps/api/src/leads/call-records/transcription.service.js';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
process.loadEnvFile();

async function run() {

  const ts = new TranscriptionService();
  await ts.onModuleInit();

  // Find recent recordings that have an empty string transcript
  const records = await prisma.callRecord.findMany({
    where: {
      aiTranscript: ""
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5
  });

  console.log(`Found ${records.length} recent records with empty transcript.`);

  for (const record of records) {
    if (!record.recordingUrl) continue;

    console.log(`\nRe-processing record ${record.id}: ${record.recordingUrl}`);

    try {
      const res = await fetch(record.recordingUrl, {
        headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` }
      });

      const buffer = Buffer.from(await res.arrayBuffer());
      const tempPath = path.join(os.tmpdir(), `retry-call-${record.id}.mp3`);
      fs.writeFileSync(tempPath, buffer);

      console.log('Downloaded. Transcribing...');
      const transcript = await ts.transcribeAudio(tempPath);

      console.log('Result Transcript:', transcript);

      if (transcript) {
        await prisma.callRecord.update({
          where: { id: record.id },
          data: { aiTranscript: transcript }
        });
        console.log('Database updated!');
      }
    } catch (err) {
      console.error('Error reprocessing:', err);
    }
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());

