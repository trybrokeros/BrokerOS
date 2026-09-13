import { Injectable, Logger } from '@nestjs/common';
import { prismaClient } from '@brokeros/prisma';
import type { VoiceWebhookEvent } from '@brokeros/types';
import { mapVoiceSentimentToTemperature } from '@brokeros/constants';

@Injectable()
export class VoiceTrackingService {
  private readonly logger = new Logger(VoiceTrackingService.name);
  private readonly prisma = prismaClient;

  async processWebhookEvents(events: VoiceWebhookEvent[]): Promise<void> {
    for (const event of events) {
      try {
        const recipient = await this.prisma.voiceRecipient.findFirst({
          where: {
            OR: [
              { providerCallId: event.providerCallId },
              { phone: event.recipientPhone },
            ],
          },
          include: {
            lead: true,
          },
        });

        if (!recipient) {
          this.logger.warn(
            `No recipient matched for call event ${event.providerCallId} (${event.recipientPhone})`,
          );
          continue;
        }

        const isSuccess = event.disposition === 'COMPLETED';
        const extractedJson =
          event.extractedData || (recipient.extractedData as any) || undefined;
        const finalSentiment = event.sentiment || recipient.sentiment;
        const mappedTemperature = mapVoiceSentimentToTemperature(finalSentiment);
        const recording = event.recordingUrl || recipient.recordingUrl;
        const transcript = event.transcript || recipient.transcript;
        const summary = event.summary || recipient.summary;
        const duration = event.durationSec || recipient.callDurationSec || 0;

        await this.prisma.voiceRecipient.update({
          where: { id: recipient.id },
          data: {
            status: isSuccess ? 'DELIVERED' : 'FAILED',
            disposition: event.disposition,
            callDurationSec: duration,
            recordingUrl: recording,
            transcript: transcript,
            summary: summary,
            sentiment: finalSentiment,
            extractedData: extractedJson ? extractedJson : undefined,
            completedAt: new Date(),
          },
        });

        // Add to Call Audit Log
        await this.prisma.voiceCallLog.create({
          data: {
            campaignId: recipient.campaignId,
            recipientId: recipient.id,
            disposition: event.disposition,
            durationSec: duration,
            recordingUrl: recording,
            transcript: transcript,
            summary: summary,
            sentiment: finalSentiment,
            extractedData: extractedJson ? extractedJson : undefined,
            timestamp: event.timestamp || new Date(),
          },
        });

        // If linked to CRM Lead, synchronize Temperature, CallRecord, and Audit Note
        if (recipient.leadId) {
          await this.prisma.lead.update({
            where: { id: recipient.leadId },
            data: {
              ...(mappedTemperature ? { temperature: mappedTemperature } : {}),
              ...(mappedTemperature === 'HOT' ? { status: 'QUALIFIED' } : {}),
            },
          });

          let noteUserId =
            recipient.lead?.assignedUserId || recipient.lead?.createdById;
          if (!noteUserId) {
            const fallbackUser = await this.prisma.user.findFirst({
              where: { status: 'ACTIVE' },
              select: { id: true },
            });
            noteUserId = fallbackUser?.id;
          }

          if (noteUserId) {
            let noteContent = `[AI Voice Broadcast - ${event.disposition || 'CALL'}]\n`;
            noteContent += `• Temperature: ${mappedTemperature || 'UNCHANGED'} (Sentiment: ${finalSentiment || 'UNKNOWN'})\n`;
            noteContent += `• Call Duration: ${duration}s\n`;
            if (summary) {
              noteContent += `• AI Summary: ${summary}\n`;
            }
            if (recording) {
              noteContent += `• Call Recording: ${recording}\n`;
            }
            if (transcript) {
              const snippet =
                transcript.length > 500
                  ? transcript.slice(0, 500) + '...'
                  : transcript;
              noteContent += `• Transcript Excerpt:\n"${snippet}"`;
            }

            await this.prisma.note.create({
              data: {
                leadId: recipient.leadId,
                userId: noteUserId,
                content: noteContent,
                noteType: 'AI_VOICE_CALL',
              },
            });

            // Map disposition to CallStatus enum
            let callStatus:
              | 'CONNECTED'
              | 'NOT_ANSWERED'
              | 'BUSY'
              | 'FAILED'
              | 'VOICEMAIL' = 'CONNECTED';
            if (event.disposition === 'BUSY') callStatus = 'BUSY';
            else if (event.disposition === 'NO_ANSWER')
              callStatus = 'NOT_ANSWERED';
            else if (event.disposition === 'FAILED') callStatus = 'FAILED';
            else if (event.disposition === 'VOICEMAIL')
              callStatus = 'VOICEMAIL';

            await this.prisma.callRecord.create({
              data: {
                leadId: recipient.leadId,
                userId: noteUserId,
                phoneNumber: recipient.phone,
                direction: 'OUTBOUND',
                status: callStatus,
                duration: duration,
                startedAt: new Date(Date.now() - duration * 1000),
                endedAt: new Date(),
                recordingUrl: recording,
                aiTranscript: transcript,
                aiSummary: summary,
                aiSentiment: finalSentiment,
                aiExtractedData: extractedJson,
              },
            });
          }
        }
      } catch (err: any) {
        this.logger.error(
          `Error processing voice webhook event: ${err?.message}`,
        );
      }
    }
  }
}
