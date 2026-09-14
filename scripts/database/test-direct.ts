import { TranscriptionService } from '../../apps/api/src/leads/call-records/transcription.service.js';
import * as path from 'path';

process.loadEnvFile();

async function run() {
  console.log('Initializing TranscriptionService...');
  const ts = new TranscriptionService();
  await ts.onModuleInit();

  const filePath = path.join(process.cwd(), 'test-43s.mp3');
  console.log(`Transcribing file: ${filePath}`);

  try {
    const transcript = await ts.transcribeAudio(filePath);
    console.log('\n--- TRANSCRIPTION RESULT ---');
    console.log(transcript);
    console.log('----------------------------\n');
  } catch (err) {
    console.error('Error during transcription:', err);
  }
}

run();

