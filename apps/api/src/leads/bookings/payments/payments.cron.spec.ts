import { Test, TestingModule } from '@nestjs/testing';

jest.mock('@brokeros/prisma', () => ({
  PrismaClient: class {},
}));
jest.mock('../../../lib/database/prisma.service.js', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({})),
}));

import { PaymentsCron } from './payments.cron.js';
import { PrismaService } from '../../../lib/database/prisma.service.js';

describe('PaymentsCron', () => {
  let cron: PaymentsCron;
  let prisma: PrismaService;

  const mockPrisma = {
    paymentSchedule: {
      findMany: jest.fn(),
    },
    followUp: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsCron,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    cron = module.get<PaymentsCron>(PaymentsCron);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(cron).toBeDefined();
  });

  it('should create follow-ups for upcoming payments (T-3 days) and overdue payments (T+1 day)', async () => {
    const upcomingPayments = [
      {
        id: 's-1',
        milestoneName: 'Installment 1',
        remainingAmount: 50000,
        dueDate: new Date(),
        booking: {
          bookingNumber: 'B-001',
          customer: {
            lead: { id: 'l-1', assignedUserId: 'u-1' },
          },
        },
      },
    ];

    const overduePayments = [
      {
        id: 's-2',
        milestoneName: 'Installment 2',
        remainingAmount: 30000,
        dueDate: new Date(),
        booking: {
          bookingNumber: 'B-002',
          customer: {
            lead: { id: 'l-2', assignedUserId: 'u-2' },
          },
        },
      },
    ];

    mockPrisma.paymentSchedule.findMany
      .mockResolvedValueOnce(upcomingPayments)
      .mockResolvedValueOnce(overduePayments);

    mockPrisma.followUp.create.mockResolvedValue({ id: 'fu-1' });

    await cron.handleDailyPaymentChecks();

    expect(mockPrisma.paymentSchedule.findMany).toHaveBeenCalledTimes(2);
    expect(mockPrisma.followUp.create).toHaveBeenCalledTimes(2);
  });

  it('should skip payment reminder if lead has no assigned user', async () => {
    const paymentsWithoutAssignedUser = [
      {
        id: 's-1',
        milestoneName: 'Installment 1',
        remainingAmount: 50000,
        dueDate: new Date(),
        booking: {
          bookingNumber: 'B-001',
          customer: {
            lead: { id: 'l-1', assignedUserId: null },
          },
        },
      },
    ];

    mockPrisma.paymentSchedule.findMany
      .mockResolvedValueOnce(paymentsWithoutAssignedUser)
      .mockResolvedValueOnce([]);

    await cron.handleDailyPaymentChecks();

    expect(mockPrisma.followUp.create).not.toHaveBeenCalled();
  });
});
