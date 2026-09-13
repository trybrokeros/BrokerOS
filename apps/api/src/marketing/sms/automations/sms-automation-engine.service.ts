// ============================================================================
// BrokerOS — SMS Automation & Flow Execution Engine
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../lib/database/prisma.service.js';
import { SmsIntegrationsService } from '../services/sms-integrations.service.js';
import { SmsAiService } from '../ai/sms-ai.service.js';
import { SmsAudienceService } from '../services/sms-audience.service.js';
import { calculateSmsSegments } from '@brokeros/constants';
import type { SendSmsOptions, SmsProviderCredentials } from '@brokeros/types';

export interface InboundSmsContext {
  inboundId?: string;
  fromPhone: string;
  toPhone: string;
  body: string;
  headers?: Record<string, any>;
  provider: string;
  providerMsgId?: string;
  recipient?: any; // SmsRecipient with campaign, project, and lead
  forceFlowId?: string;
  isSimulation?: boolean;
}

@Injectable()
export class SmsAutomationEngineService {
  private readonly logger = new Logger(SmsAutomationEngineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly integrationsService: SmsIntegrationsService,
    private readonly aiService: SmsAiService,
    private readonly audienceService: SmsAudienceService,
  ) { }

  /**
   * Main entry point when an inbound SMS reply is received or simulated.
   */
  async processInboundReply(context: InboundSmsContext): Promise<{
    matchedFlowId?: string;
    flowName?: string;
    triggerMatched?: boolean;
    triggerReason?: string;
    actionsExecuted: string[];
    outboundReply?: string;
    renderedBody?: string;
  }> {
    const actionsExecuted: string[] = [];

    try {
      const recipient = context.recipient || {
        id: 'synthetic_sms_recipient',
        phone: context.fromPhone,
        name: 'Valued Client',
        assignedSenderPhone: context.toPhone,
        assignedProvider: context.provider === 'SIMULATOR' ? 'TWILIO' : (context.provider || 'TWILIO'),
        campaign: {
          title: 'Skyline Crest Residences',
          fromSender: context.toPhone,
          project: {
            name: 'Skyline Crest Residences',
            city: 'Mumbai',
            address: 'Worli Sea Face',
            startingPrice: '₹2.50 Cr',
            brochureUrl: 'https://brokeros.io',
          },
        },
        lead: {
          firstName: 'Prospect',
          lastName: '',
          phone: context.fromPhone,
          status: 'NEW',
          temperature: 'WARM',
        },
      };

      const campaignId = recipient?.campaignId;
      const inboundTextLower = context.body.trim().toLowerCase();

      let targetFlow: any = null;

      if (context.forceFlowId) {
        targetFlow = await this.prisma.smsFlow.findUnique({
          where: { id: context.forceFlowId },
          include: {
            nodes: {
              orderBy: { createdAt: 'asc' },
            },
          },
        });
        if (!targetFlow) {
          return {
            actionsExecuted: [`Flow ID ${context.forceFlowId} not found`],
            triggerMatched: false,
          };
        }
      } else {
        const activeFlows = await this.prisma.smsFlow.findMany({
          where: { status: 'active' },
          include: {
            nodes: {
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { updatedAt: 'desc' },
        });

        // 1. Check campaign-scoped flows first
        if (campaignId) {
          targetFlow = activeFlows.find(
            (f) => !f.isGlobal && f.campaignIds && f.campaignIds.includes(campaignId),
          );
        }

        // 2. Fallback to global flows
        if (!targetFlow) {
          targetFlow = activeFlows.find((f) => f.isGlobal);
        }
      }

      if (!targetFlow) {
        return {
          actionsExecuted: ['No active SMS flow matched this inbound message'],
          triggerMatched: false,
        };
      }

      // Evaluate trigger conditions
      const triggerType = targetFlow.triggerType || 'keyword_match';
      const triggerConfig = (targetFlow.triggerConfig || {}) as any;
      let triggerMatched = false;
      let triggerReason = '';

      if (context.forceFlowId) {
        triggerMatched = true;
        triggerReason = 'Simulated manual flow trigger';
      } else if (triggerType === 'any_reply') {
        triggerMatched = true;
        triggerReason = 'Trigger on Any Inbound Reply';
      } else if (triggerType === 'campaign_reply') {
        if (campaignId && targetFlow.campaignIds && targetFlow.campaignIds.includes(campaignId)) {
          triggerMatched = true;
          triggerReason = `Trigger on reply to campaign #${campaignId}`;
        } else if (targetFlow.isGlobal) {
          triggerMatched = true;
          triggerReason = 'Trigger on any campaign reply (global)';
        }
      } else {
        // Keyword match
        const rawKeywords = triggerConfig.keywords;
        const kwList: string[] = Array.isArray(rawKeywords)
          ? rawKeywords
          : typeof rawKeywords === 'string'
            ? rawKeywords.split(',').map((k: string) => k.trim().toLowerCase())
            : ['visit', 'price', 'brochure', 'details', 'interested'];

        const matchMode = triggerConfig.matchMode || 'contains';

        if (matchMode === 'exact') {
          triggerMatched = kwList.includes(inboundTextLower);
          triggerReason = triggerMatched
            ? `Exact keyword match for: ${inboundTextLower}`
            : 'No exact keyword matched';
        } else {
          const matchedKw = kwList.find((kw) => kw && inboundTextLower.includes(kw));
          if (matchedKw) {
            triggerMatched = true;
            triggerReason = `Contains keyword: "${matchedKw}"`;
          } else {
            triggerReason = `None of keywords [${kwList.join(', ')}] found in message`;
          }
        }
      }

      if (!triggerMatched) {
        return {
          matchedFlowId: targetFlow.id,
          flowName: targetFlow.name,
          triggerMatched: false,
          triggerReason,
          actionsExecuted: [`Trigger not matched: ${triggerReason}`],
        };
      }

      this.logger.log(
        `Triggering SMS Flow "${targetFlow.name}" (${targetFlow.id}) for recipient ${context.fromPhone}`,
      );

      // Seed Flow Run record
      let flowRunId: string | null = null;
      if (!context.isSimulation && targetFlow.id) {
        try {
          const flowRun = await this.prisma.smsFlowRun.create({
            data: {
              flowId: targetFlow.id,
              recipientId: context.recipient?.id || null,
              campaignId: campaignId || null,
              leadId: context.recipient?.leadId || null,
              status: 'active',
              inboundPhone: context.fromPhone,
              inboundBody: context.body,
            },
          });
          flowRunId = flowRun.id;
        } catch (err: any) {
          this.logger.warn(`Could not seed flow run record: ${err.message}`);
        }
      }

      // Build Node Graph
      const rawNodes: any[] = targetFlow.nodes || [];
      const nodeMap = new Map<string, any>(rawNodes.map((n) => [n.nodeKey, n]));

      const nonStartNodes = rawNodes.filter((n) => n.nodeType !== 'start');
      const startNode = rawNodes.find((n) => n.nodeType === 'start');

      let currentNode: any = null;
      if (startNode && startNode.config?.next_node_key && nodeMap.has(startNode.config.next_node_key)) {
        currentNode = nodeMap.get(startNode.config.next_node_key);
      } else if (nonStartNodes.length > 0) {
        currentNode = nonStartNodes[0];
      } else if (rawNodes.length > 0) {
        currentNode = rawNodes[0];
      }

      let outboundReplyText = '';
      let stepsCount = 0;
      const MAX_STEPS = 25;
      const executedKeys = new Set<string>();

      while (currentNode && stepsCount < MAX_STEPS) {
        stepsCount++;
        executedKeys.add(currentNode.nodeKey);

        const config = (currentNode.config || {}) as any;
        const nodeType = currentNode.nodeType;

        const currentLinearIndex = nonStartNodes.findIndex((n) => n.nodeKey === currentNode.nodeKey);
        const nextLinearNode =
          currentLinearIndex >= 0 && currentLinearIndex < nonStartNodes.length - 1
            ? nonStartNodes[currentLinearIndex + 1]
            : null;

        let nextNodeToExecute: any = null;

        switch (nodeType) {
          // ── Action: Send SMS Reply ──
          case 'send_sms':
          case 'send_sms_reply': {
            const textBody = this.interpolateText(
              config.message || config.textContent || config.textBody || 'Thank you for your message.',
              recipient,
            );

            if (!context.isSimulation) {
              await this.dispatchOutboundReply({
                recipient,
                message: textBody,
              });
              actionsExecuted.push(`Sent SMS reply: "${textBody.slice(0, 40)}..."`);
            } else {
              actionsExecuted.push(`Send SMS Reply: "${textBody.slice(0, 40)}..."`);
            }

            outboundReplyText = textBody;

            nextNodeToExecute =
              config.next_node_key && nodeMap.has(config.next_node_key)
                ? nodeMap.get(config.next_node_key)
                : nextLinearNode;
            break;
          }

          // ── Action: AI Agent Autoreply (Groq openai/gpt-oss-120b) ──
          case 'ai_agent':
          case 'ai_reply': {
            const stopIfHumanActive = config.stopIfHumanActive !== false;
            if (!context.isSimulation && stopIfHumanActive && recipient?.lead?.assignedUserId) {
              actionsExecuted.push('AI reply skipped (lead is managed by human sales exec)');
              nextNodeToExecute =
                config.next_node_key && nodeMap.has(config.next_node_key)
                  ? nodeMap.get(config.next_node_key)
                  : nextLinearNode;
              break;
            }

            const maxTurns = Number(config.maxTurns) || 3;
            if (!context.isSimulation && recipient?.phone) {
              const previousAiMsgs = await this.prisma.smsMessage.count({
                where: {
                  OR: [
                    { toPhone: recipient.phone, senderType: 'bot' },
                    { toPhone: recipient.phone, senderName: { contains: 'AI' } },
                  ],
                },
              }).catch(() => 0);

              if (previousAiMsgs >= maxTurns) {
                this.logger.log(`AI Concierge reached max turns (${previousAiMsgs}/${maxTurns}) for ${recipient.phone}. Escalating prospect.`);
                if (recipient.id && !recipient.leadId) {
                  await this.audienceService.promoteCsvRecipientToLead(recipient.id).catch(() => { });
                } else if (recipient.leadId) {
                  await this.prisma.lead.update({
                    where: { id: recipient.leadId },
                    data: { status: 'QUALIFIED', subStatus: 'PENDING', assignedUserId: null },
                  }).catch(() => { });
                }
                actionsExecuted.push(`AI Concierge reached max turns limit (${maxTurns}) → prospect escalated to Pre-Sales queue`);
                nextNodeToExecute =
                  config.next_node_key && nodeMap.has(config.next_node_key)
                    ? nodeMap.get(config.next_node_key)
                    : nextLinearNode;
                break;
              }
            }

            let aiReplyText = '';
            try {
              const aiRes = await this.aiService.generateAutoreply({
                leadName: recipient.name || recipient.lead?.firstName || 'Valued Client',
                inboundBody: context.body,
                originalCampaignTitle: recipient.campaign?.title,
                project: recipient.campaign?.project,
                customInstructions: config.instructions,
              });
              aiReplyText = aiRes.text;
            } catch {
              aiReplyText = `Hi! Thanks for contacting us regarding ${recipient.campaign?.project?.name || 'our luxury residences'}. Our relationship manager will call you shortly.`;
            }

            if (!context.isSimulation) {
              await this.dispatchOutboundReply({
                recipient,
                message: aiReplyText,
              });
              actionsExecuted.push(`AI Concierge (Groq) sent SMS: "${aiReplyText.slice(0, 40)}..."`);
            } else {
              actionsExecuted.push(`AI Concierge generated SMS: "${aiReplyText.slice(0, 40)}..."`);
            }

            outboundReplyText = aiReplyText;

            nextNodeToExecute =
              config.next_node_key && nodeMap.has(config.next_node_key)
                ? nodeMap.get(config.next_node_key)
                : nextLinearNode;
            break;
          }

          // ── Action: Condition / Branching (WhatsApp Parity) ──
          case 'condition':
          case 'if_else': {
            const criteriaType = config.criteriaType || 'keywords';
            let conditionMet = false;

            if (criteriaType === 'budget') {
              const minBudget = Number(config.minBudget) || 0;
              const leadBudget = Number(recipient?.lead?.budget) || 0;
              conditionMet = leadBudget >= minBudget;
            } else if (criteriaType === 'tag') {
              const targetTag = (config.tag || config.tagName || '').trim().toLowerCase();
              const leadTags: string[] = (recipient?.lead?.tags || []).map((t: any) =>
                (typeof t === 'string' ? t : t?.name || '').toLowerCase()
              );
              conditionMet = !!targetTag && leadTags.includes(targetTag);
            } else {
              const rawKeywords = config.keywords;
              const kwList: string[] = Array.isArray(rawKeywords)
                ? rawKeywords
                : typeof rawKeywords === 'string'
                  ? rawKeywords.split(',').map((k: string) => k.trim().toLowerCase())
                  : [];

              conditionMet = kwList.length === 0 || kwList.some((kw) => kw && inboundTextLower.includes(kw));
            }

            const branches = config.branches || (currentNode as any).branches;
            const branchKey = conditionMet ? 'yes' : 'no';
            const branchSteps: any[] = branches?.[branchKey] || [];

            if (branchSteps.length > 0) {
              actionsExecuted.push(
                `Condition evaluated to ${conditionMet ? 'TRUE' : 'FALSE'} -> Executing ${branchKey.toUpperCase()} branch (${branchSteps.length} step${branchSteps.length === 1 ? '' : 's'})`,
              );

              for (const bStep of branchSteps) {
                const bType = bStep.nodeType;
                const bConfig = bStep.config || {};

                if (bType === 'send_sms' || bType === 'send_sms_reply') {
                  const msg = this.interpolateText(
                    bConfig.message || bConfig.textContent || 'Thank you for your message.',
                    recipient,
                  );
                  if (!context.isSimulation) {
                    await this.dispatchOutboundReply({ recipient, message: msg });
                    actionsExecuted.push(`[${branchKey.toUpperCase()}] Sent SMS: "${msg.slice(0, 35)}..."`);
                  } else {
                    actionsExecuted.push(`[${branchKey.toUpperCase()}] Send SMS: "${msg.slice(0, 35)}..."`);
                  }
                  outboundReplyText = msg;
                } else if (bType === 'ai_agent' || bType === 'ai_reply') {
                  let aiMsg = '';
                  try {
                    const aiRes = await this.aiService.generateAutoreply({
                      leadName: recipient.name || recipient.lead?.firstName,
                      inboundBody: context.body,
                      originalCampaignTitle: recipient.campaign?.title,
                      project: recipient.campaign?.project,
                    });
                    aiMsg = aiRes.text;
                  } catch {
                    aiMsg = 'Thank you for reaching out! We will connect with you shortly.';
                  }
                  if (!context.isSimulation) {
                    await this.dispatchOutboundReply({ recipient, message: aiMsg });
                    actionsExecuted.push(`[${branchKey.toUpperCase()}] AI Concierge sent SMS: "${aiMsg.slice(0, 35)}..."`);
                  } else {
                    actionsExecuted.push(`[${branchKey.toUpperCase()}] AI Concierge generated SMS: "${aiMsg.slice(0, 35)}..."`);
                  }
                  outboundReplyText = aiMsg;
                } else if (bType === 'update_lead_status') {
                  actionsExecuted.push(`[${branchKey.toUpperCase()}] Updated CRM status to ${bConfig.status || 'INTERESTED'}`);
                } else if (bType === 'add_tag') {
                  const bTag = (bConfig.tag || 'SMS_ENGAGED').trim();
                  if (!context.isSimulation && bTag) {
                    await this.prisma.smsTag.upsert({
                      where: { name: bTag },
                      create: { name: bTag, color: '#3B82F6' },
                      update: {},
                    }).catch(() => { });
                  }
                  actionsExecuted.push(`[${branchKey.toUpperCase()}] Applied tag "${bTag}"`);
                }
              }
            } else {
              actionsExecuted.push(`Condition evaluated to ${conditionMet ? 'TRUE' : 'FALSE'} (no branch steps configured)`);
            }

            nextNodeToExecute = conditionMet
              ? (config.yes_next_key && nodeMap.has(config.yes_next_key) ? nodeMap.get(config.yes_next_key) : nextLinearNode)
              : (config.no_next_key && nodeMap.has(config.no_next_key) ? nodeMap.get(config.no_next_key) : nextLinearNode);
            break;
          }

          // ── Action: Update CRM Status ──
          case 'update_lead_status': {
            const newStatus = config.status || 'INTERESTED';
            if (!context.isSimulation && recipient?.leadId) {
              await this.prisma.lead.update({
                where: { id: recipient.leadId },
                data: { status: newStatus as any },
              }).catch(() => { });
            }
            actionsExecuted.push(`Updated CRM status to ${newStatus}`);
            nextNodeToExecute =
              config.next_node_key && nodeMap.has(config.next_node_key)
                ? nodeMap.get(config.next_node_key)
                : nextLinearNode;
            break;
          }

          // ── Action: Add Tag ──
          case 'add_tag': {
            const tagName = (config.tag || 'SMS_REPLIED').trim();
            if (!context.isSimulation && tagName) {
              await this.prisma.smsTag.upsert({
                where: { name: tagName },
                create: { name: tagName, color: '#3B82F6' },
                update: {},
              }).catch(() => { });
            }
            actionsExecuted.push(`Applied CRM tag "${tagName}"`);
            nextNodeToExecute =
              config.next_node_key && nodeMap.has(config.next_node_key)
                ? nodeMap.get(config.next_node_key)
                : nextLinearNode;
            break;
          }

          // ── Action: Handoff to Pre-Sales Queue ──
          case 'handoff_presales': {
            if (!context.isSimulation) {
              if (recipient.id && !recipient.leadId) {
                await this.audienceService.promoteCsvRecipientToLead(recipient.id);
              } else if (recipient.leadId) {
                await this.prisma.lead.update({
                  where: { id: recipient.leadId },
                  data: {
                    status: 'QUALIFIED',
                    subStatus: 'PENDING',
                    assignedUserId: null,
                  },
                }).catch(() => { });
              }
            }
            actionsExecuted.push('Escalated prospect to Pre-Sales Manager triage queue');
            nextNodeToExecute =
              config.next_node_key && nodeMap.has(config.next_node_key)
                ? nodeMap.get(config.next_node_key)
                : nextLinearNode;
            break;
          }

          case 'end':
          default:
            nextNodeToExecute = null;
            break;
        }

        if (!nextNodeToExecute || executedKeys.has(nextNodeToExecute.nodeKey)) {
          break;
        }
        currentNode = nextNodeToExecute;
      }

      if (flowRunId) {
        await this.prisma.smsFlowRun.update({
          where: { id: flowRunId },
          data: {
            status: 'completed',
            outboundReply: outboundReplyText || null,
            endedAt: new Date(),
          },
        }).catch(() => { });
      }

      return {
        matchedFlowId: targetFlow.id,
        flowName: targetFlow.name,
        triggerMatched: true,
        triggerReason,
        actionsExecuted,
        outboundReply: outboundReplyText,
        renderedBody: outboundReplyText,
      };
    } catch (err: any) {
      this.logger.error(`Error executing SMS Flow: ${err.message}`);
      return {
        actionsExecuted: [`Flow Error: ${err.message}`],
        triggerMatched: false,
      };
    }
  }

  private interpolateText(template: string, recipient: any): string {
    if (!template) return '';
    const lead = recipient?.lead || {};
    const campaign = recipient?.campaign || {};
    const project = campaign?.project || {};

    const nameParts = (recipient?.name || lead?.firstName || 'Client').trim().split(' ');
    const firstName = lead?.firstName || nameParts[0] || 'Client';
    const fullName = recipient?.name || `${lead?.firstName || ''} ${lead?.lastName || ''}`.trim() || firstName;

    return template
      .replace(/{{lead\.firstName}}/gi, firstName)
      .replace(/{{lead\.fullName}}/gi, fullName)
      .replace(/{{lead\.phone}}/gi, recipient?.phone || '')
      .replace(/{{project\.name}}/gi, project?.name || campaign?.title || 'Luxury Residences')
      .replace(/{{project\.startingPrice}}/gi, project?.startingPrice || '₹1.50 Cr')
      .replace(/{{project\.location}}/gi, project?.address || project?.city || 'Prime Location')
      .replace(/{{agent\.name}}/gi, 'Property Consultant')
      .replace(/{{agent\.phone}}/gi, '+91 98000 00000')
      .replace(/{{shortUrl}}/gi, project?.brochureUrl || 'https://brokeros.io');
  }

  /**
   * Dispatch outbound auto-reply strictly preserving Thread Continuity
   */
  private async dispatchOutboundReply(args: {
    recipient: any;
    message: string;
  }): Promise<void> {
    const { recipient, message } = args;
    let provider = recipient?.assignedProvider;
    let fromPhone = recipient?.assignedSenderPhone;

    // Dynamically resolve provider and verified sender number if not set on recipient
    if (!provider || !fromPhone) {
      const activeIntegration = await this.prisma.smsIntegration.findFirst({
        where: { isActive: true },
        include: { senderNumbers: { where: { isVerified: true }, orderBy: { createdAt: 'asc' } } },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      });

      if (activeIntegration) {
        provider = provider || activeIntegration.provider;
        fromPhone = fromPhone || activeIntegration.senderNumbers[0]?.phoneNumber || activeIntegration.senderNumbers[0]?.senderId || activeIntegration.fromSender;
      }
    }

    if (!fromPhone || !provider) {
      this.logger.error(`Cannot dispatch outbound SMS reply: No verified sender number configured for recipient ${recipient?.phone || 'unknown'}`);
      return;
    }

    let credentials: SmsProviderCredentials | undefined;
    const integration = await this.prisma.smsIntegration.findFirst({
      where: { provider: provider as any, isActive: true },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    if (integration) {
      credentials = {
        accountSid: integration.accountSid || undefined,
        authToken: integration.authToken || undefined,
        messagingServiceSid: integration.messagingServiceSid || undefined,
        apiKey: integration.apiKey || undefined,
        apiSecret: integration.apiSecret || undefined,
        servicePlanId: integration.servicePlanId || undefined,
        awsAccessKeyId: integration.awsAccessKeyId || undefined,
        awsSecretKey: integration.awsSecretKey || undefined,
        awsRegion: integration.awsRegion || undefined,
        dltEntityId: integration.dltEntityId || undefined,
        baseUrl: integration.baseUrl || undefined,
        authId: integration.authId || undefined,
        fromNumber: fromPhone,
        senderId: fromPhone,
      };
    }

    const adapter = this.integrationsService.getAdapter(provider);
    const options: SendSmsOptions = {
      from: fromPhone,
      to: [{ phone: recipient.phone, name: recipient.name }],
      message,
    };

    await adapter.sendBatch(options, credentials);
  }
}
