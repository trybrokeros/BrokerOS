import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import Groq from 'groq-sdk';
import { AvailableProjectDto } from './dto/call-record.dto.js';

@Injectable()
export class TranscriptionService implements OnModuleInit {
  private readonly logger = new Logger(TranscriptionService.name);

  async onModuleInit() {
    this.logger.log('Transcription service initialized.');
    const groqApiKey = process.env.GROQ_API_KEY;
    if (
      !groqApiKey ||
      groqApiKey === 'your-groq-api-key-here' ||
      groqApiKey === 'your_api_key_here'
    ) {
      this.logger.warn(
        'Groq API Key is not configured. Transcription and summarization will fail.',
      );
    } else {
      this.logger.log('Groq API Key configured successfully.');
    }
  }

  async transcribeAudio(filePath: string): Promise<string> {
    this.logger.log(`Starting transcription for file: ${filePath}`);

    const groqApiKey = process.env.GROQ_API_KEY;
    if (
      !groqApiKey ||
      groqApiKey === 'your-groq-api-key-here' ||
      groqApiKey === 'your_api_key_here'
    ) {
      const errorMsg =
        'Groq API Key is missing or invalid. Cannot transcribe audio.';
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    this.logger.log(`Using Groq API for transcription...`);
    const groq = new Groq({ apiKey: groqApiKey });

    try {
      const transcription = await groq.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: 'whisper-large-v3',
        prompt:
          'This is a real estate CRM call. The speaker might use Hindi or Marathi words written in English letters, for example: aur bhai kiya haal hain, main real estate se baat kar raha hoon. Please transcribe the native language using English characters (Romanized Hindi/Marathi) or English directly.',
      });
      this.logger.log(`Groq Transcription completed for ${filePath}`);
      return transcription.text.trim();
    } catch (err: any) {
      this.logger.error(`Groq API Error: ${err.message}`);
      throw err;
    }
  }

  async summarizeCall(
    transcript: string,
    leadStatus?: string,
    availableProjects: AvailableProjectDto[] = [],
  ): Promise<
    | {
        summary: string;
        nextStepSuggestion: string;
        extractedBudget?: number | null;
        extractedProjectId?: string | null;
        extractedLocation?: string | null;
        extractedRequirements?: string | null;
        scheduleFollowUp?: boolean;
        followUpIsoDate?: string | null;
        followUpTitle?: string | null;
        followUpRemarks?: string | null;
      }
    | string
  > {
    try {
      this.logger.log(`Starting summarization for transcript...`);

      const groqApiKey = process.env.GROQ_API_KEY;
      if (!groqApiKey || groqApiKey === 'your_api_key_here') {
        this.logger.warn(
          'Groq API Key is missing or invalid. Skipping summarization.',
        );
        return 'Groq API Key not configured. Please add it to .env to enable AI summaries.';
      }

      const groq = new Groq({ apiKey: groqApiKey });

      const prompt = `
You are a professional Real Estate Assistant. Based on the following call transcript, you need to extract the following information.
Current Date & Time for reference: ${new Date().toISOString()}

1. "summary": A short, concise summary (2-3 sentences) focusing on the main intent, lead's interest, and action items.
2. "nextStepSuggestion": A single, highly actionable sentence suggesting what the broker should do next with this lead. Be specific.
3. "extractedBudget": The maximum budget mentioned by the lead as a raw number (e.g. if they say 50L or 50 lakhs, return 5000000. If 1.5 CR, return 15000000). Return null if not mentioned.
4. "extractedProjectId": We offer the following projects: ${availableProjects.map((p) => `"${p.name}" (ID: ${p.id})`).join(', ')}. If the lead explicitly expresses interest in one of these projects, return its EXACT ID string. Otherwise, return null.
5. "extractedLocation": The preferred location or area the lead is looking to buy in (e.g., "Kharghar", "Andheri"). Return null if not mentioned.
6. "extractedRequirements": A brief string of their requirements (e.g., "2BHK with parking", "Looking for ready to move"). Return null if not mentioned.
7. "scheduleFollowUp": boolean. Set to true UNLESS the lead explicitly says they are not interested, asks not to be called again, or if it's a wrong number. In those negative cases, set to false.
8. "followUpIsoDate": ISO 8601 Date string for the follow-up. Calculate this based on the transcript and the Current Date & Time. Rule: If the lead specifically asks to be called on a certain date or time (e.g. "next week", "next month"), respect their request and calculate the date accordingly. Otherwise, default to scheduling it within the next 1 to 3 days based on how interested they sound. IMPORTANT: Schedule the follow-up during normal daytime working hours (10:00 AM to 6:00 PM local time). Do NOT schedule on Sundays; if the calculated date falls on a Sunday, move it to Monday.
9. "followUpTitle": A short 3-4 word title for the follow-up (e.g., "Call regarding budget", "Follow up on location").
10. "followUpRemarks": A detailed description of exactly why this follow-up is needed based on the conversation.

${leadStatus ? `The current status of this lead is: ${leadStatus}. Consider this when suggesting the next step.` : ''}

Transcript:
"${transcript}"

Output your response ONLY as a JSON object with this exact format:
{
  "summary": "...",
  "nextStepSuggestion": "...",
  "extractedBudget": number or null,
  "extractedProjectId": "string or null",
  "extractedLocation": "string or null",
  "extractedRequirements": "string or null",
  "scheduleFollowUp": boolean,
  "followUpIsoDate": "string or null",
  "followUpTitle": "string or null",
  "followUpRemarks": "string or null"
}
      `.trim();

      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'openai/gpt-oss-120b',
        response_format: { type: 'json_object' },
      });

      const responseText =
        completion.choices[0]?.message?.content?.trim() || '{}';
      const parsed = JSON.parse(responseText);

      this.logger.log(`Summarization completed successfully.`);
      return {
        summary: parsed.summary || 'Summary unavailable.',
        nextStepSuggestion:
          parsed.nextStepSuggestion || 'No suggestion available.',
        extractedBudget:
          typeof parsed.extractedBudget === 'number'
            ? parsed.extractedBudget
            : null,
        extractedProjectId:
          typeof parsed.extractedProjectId === 'string'
            ? parsed.extractedProjectId
            : null,
        extractedLocation:
          typeof parsed.extractedLocation === 'string'
            ? parsed.extractedLocation
            : null,
        extractedRequirements:
          typeof parsed.extractedRequirements === 'string'
            ? parsed.extractedRequirements
            : null,
        scheduleFollowUp: !!parsed.scheduleFollowUp,
        followUpIsoDate:
          typeof parsed.followUpIsoDate === 'string'
            ? parsed.followUpIsoDate
            : null,
        followUpTitle:
          typeof parsed.followUpTitle === 'string'
            ? parsed.followUpTitle
            : null,
        followUpRemarks:
          typeof parsed.followUpRemarks === 'string'
            ? parsed.followUpRemarks
            : null,
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to summarize transcript: ${error.message}`,
        error.stack,
      );
      return 'Failed to generate summary. Please check API logs.';
    }
  }

  async generateLeadScore(
    transcript: string,
  ): Promise<{ score: number; category: string } | null> {
    try {
      this.logger.log(`Starting AI Scoring for transcript...`);

      const groqApiKey = process.env.GROQ_API_KEY;
      if (!groqApiKey || groqApiKey === 'your_api_key_here') {
        this.logger.warn('Groq API Key is missing. Skipping AI Scoring.');
        return null;
      }

      const groq = new Groq({ apiKey: groqApiKey });
      const prompt = `
You are an expert Real Estate Lead Scorer. Evaluate the following call transcript and output a JSON object exactly like this: {"score": number, "category": "string"}

CATEGORIES AND SCORING RUBRIC:
1. "BUSY": Score 0. Use if the person didn't pick up, hung up immediately, or asked to call back later before any real conversation happened.
2. "NOT_INTERESTED": Score 10-30. Use if they said wrong number, already bought a house, or explicitly said do not call.
3. "WARM": Score 40-70. Use if they listened to the pitch, asked basic questions, or asked for details on WhatsApp to review.
4. "HOT": Score 80-100. Use if they shared their budget, location preferences, or agreed to schedule a site visit.

Transcript:
"${transcript}"

Reply ONLY with the valid JSON object.
      `.trim();

      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'openai/gpt-oss-120b',
        response_format: { type: 'json_object' },
      });

      const responseText =
        completion.choices[0]?.message?.content?.trim() || '{}';
      const parsed = JSON.parse(responseText);

      this.logger.log(`AI Scoring completed: ${JSON.stringify(parsed)}`);
      return {
        score: typeof parsed.score === 'number' ? parsed.score : 0,
        category: parsed.category || 'UNKNOWN',
      };
    } catch (error: any) {
      this.logger.error(`Failed to score lead: ${error.message}`, error.stack);
      return null;
    }
  }

  async generateAutoStatusAndNote(
    currentStatus: string,
    callSummaries: string[],
    entityType: 'LEAD' | 'BROKER' = 'LEAD',
  ): Promise<{ suggestedStatus: string; transitionNote: string } | null> {
    try {
      this.logger.log(
        `Starting AI Auto Status transition for ${entityType}...`,
      );

      const groqApiKey = process.env.GROQ_API_KEY;
      if (!groqApiKey || groqApiKey === 'your_api_key_here') {
        this.logger.warn(
          `Groq API Key is missing. Skipping AI Auto Status for ${entityType}.`,
        );
        return null;
      }

      const groq = new Groq({ apiKey: groqApiKey });

      let prompt = '';

      if (entityType === 'BROKER') {
        prompt = `
You are an expert Real Estate CRM Sourcing Manager Assistant. Your job is to analyze the recent call summaries of a channel partner (broker) and determine their NEXT valid status, and write a professional note summarizing why the status is changing based on these calls.

Current Status: ${currentStatus}
Available Broker Statuses (in order): NEW -> CONTACTED -> VISIT -> DEAL.
Rules:
1. You can ONLY move the status forward. Do not move backward.
2. If the current status is already DEAL, or if the calls do not justify moving forward, suggest keeping the current status.
3. Write a concise, professional transition note summarizing the interactions that justify this status.

Recent Call Summaries:
${callSummaries.join('\n\n')}

Output your response ONLY as a JSON object with this exact format:
{
  "suggestedStatus": "string (must be NEW, CONTACTED, VISIT, or DEAL)",
  "transitionNote": "string (summary note)"
}
        `.trim();
      } else {
        prompt = `
You are an expert Real Estate CRM Assistant. Your job is to analyze the recent call summaries of a lead and determine their NEXT valid status, and write a professional note summarizing why the status is changing based on these calls.

Current Status: ${currentStatus}
Available Pre-Sales Statuses (in order): NEW -> CONTACTED -> INTERESTED -> QUALIFIED.
Rules:
1. You can ONLY move the status forward. Do not move backward.
2. If the current status is already QUALIFIED, or if the calls do not justify moving forward, suggest keeping the current status.
3. Write a concise, professional transition note summarizing the interactions that justify this status.

Recent Call Summaries:
${callSummaries.join('\n\n')}

Output your response ONLY as a JSON object with this exact format:
{
  "suggestedStatus": "string (must be NEW, CONTACTED, INTERESTED, or QUALIFIED)",
  "transitionNote": "string (summary note)"
}
        `.trim();
      }

      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'openai/gpt-oss-120b',
        response_format: { type: 'json_object' },
      });

      const responseText =
        completion.choices[0]?.message?.content?.trim() || '{}';
      const parsed = JSON.parse(responseText);

      this.logger.log(`AI Auto Status completed: ${JSON.stringify(parsed)}`);
      return {
        suggestedStatus: parsed.suggestedStatus || currentStatus,
        transitionNote:
          parsed.transitionNote || 'Status transitioned based on recent calls.',
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to generate auto status and note: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }
}
