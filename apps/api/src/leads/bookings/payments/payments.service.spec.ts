import { Test, TestingModule } from '@nestjs/testing';

jest.mock('@brokeros/prisma', () => ({
  PrismaClient: class {},
}));
jest.mock('@vercel/blob', () => ({
  put: jest.fn().mockResolvedValue({ url: 'http://example.com/receipt.pdf' }),
}));
jest.mock('../../../lib/database/prisma.service.js', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({})),
}));

import { PaymentsService } from './payments.service.js';
import { PrismaService } from '../../../lib/database/prisma.service.js';
import { NotFoundException } from '@nestjs/common';
import { CreateScheduleDto } from './dto/payment.dto.js';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: PrismaService;

  const mockPrisma = {
    booking: { findUnique: jest.fn() },
    paymentSchedule: {
      createMany: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: { findFirst: jest.fn() },
    paymentTransaction: { create: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSchedule', () => {
    it('should throw NotFoundException if booking does not exist', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(null);
      await expect(
        service.createSchedule('b-nonexistent', {
          netAmount: 1000,
          startDate: '2026-01-01',
        } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create schedule with fixed installments count (Mode 1)', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({ id: 'b-1' });
      mockPrisma.paymentSchedule.createMany.mockResolvedValue({ count: 3 });
      mockPrisma.paymentSchedule.findMany.mockResolvedValue([
        { id: 's-1' },
        { id: 's-2' },
        { id: 's-3' },
      ]);

      const dto: CreateScheduleDto = {
        netAmount: 1000,
        startDate: '2026-01-01',
        installmentsCount: 3,
        frequency: 'MONTHLY',
      };

      const res = await service.createSchedule('b-1', dto);
      expect(mockPrisma.paymentSchedule.createMany).toHaveBeenCalled();
      expect(res).toHaveLength(3);
    });

    it('should create schedule with percentage per month (Mode 2)', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({ id: 'b-1' });
      mockPrisma.paymentSchedule.createMany.mockResolvedValue({ count: 5 });
      mockPrisma.paymentSchedule.findMany.mockResolvedValue([{ id: 's-1' }]);

      const dto: CreateScheduleDto = {
        netAmount: 100000,
        startDate: '2026-01-01',
        percentagePerMonth: 25,
      };

      const res = await service.createSchedule('b-1', dto);
      expect(mockPrisma.paymentSchedule.createMany).toHaveBeenCalled();
      expect(res).toHaveLength(1);
    });
  });

  describe('getPendingPayments & getSchedulesByBooking', () => {
    it('should get pending payments with optional manager filter', async () => {
      mockPrisma.paymentSchedule.findMany.mockResolvedValue([{ id: 's-1' }]);

      const res = await service.getPendingPayments('mgr-1');
      expect(mockPrisma.paymentSchedule.findMany).toHaveBeenCalled();
      expect(res).toEqual([{ id: 's-1' }]);
    });

    it('should get schedules by booking ID', async () => {
      mockPrisma.paymentSchedule.findMany.mockResolvedValue([{ id: 's-1' }]);

      const res = await service.getSchedulesByBooking('b-1');
      expect(mockPrisma.paymentSchedule.findMany).toHaveBeenCalledWith({
        where: { bookingId: 'b-1' },
        orderBy: { sequenceOrder: 'asc' },
        include: { transactions: true },
      });
      expect(res).toEqual([{ id: 's-1' }]);
    });
  });

  describe('markAsPaid', () => {
    it('should throw NotFoundException if schedule does not exist', async () => {
      mockPrisma.paymentSchedule.findUnique.mockResolvedValue(null);
      await expect(service.markAsPaid('nonexistent', 500)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should record payment transaction and mark schedule as PAID when fully paid', async () => {
      mockPrisma.paymentSchedule.findUnique.mockResolvedValue({
        id: 's-1',
        bookingId: 'b-1',
        remainingAmount: 500,
      });
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'u-admin' });
      mockPrisma.paymentTransaction.create.mockResolvedValue({
        id: 'tx-1',
        amount: 500,
      });
      mockPrisma.paymentSchedule.update.mockResolvedValue({
        id: 's-1',
        status: 'PAID',
        remainingAmount: 0,
      });

      const file = {
        buffer: Buffer.from(''),
        originalname: 'receipt.pdf',
      } as Express.Multer.File;
      const res = await service.markAsPaid('s-1', 500, 'Paid in full', file);

      expect(mockPrisma.paymentTransaction.create).toHaveBeenCalled();
      expect(mockPrisma.paymentSchedule.update).toHaveBeenCalledWith({
        where: { id: 's-1' },
        data: { status: 'PAID', remainingAmount: 0 },
      });
      expect(res.updatedSchedule.status).toBe('PAID');
    });

    it('should mark schedule as PARTIAL when partially paid', async () => {
      mockPrisma.paymentSchedule.findUnique.mockResolvedValue({
        id: 's-1',
        bookingId: 'b-1',
        remainingAmount: 500,
      });
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'u-admin' });
      mockPrisma.paymentTransaction.create.mockResolvedValue({
        id: 'tx-1',
        amount: 200,
      });
      mockPrisma.paymentSchedule.update.mockResolvedValue({
        id: 's-1',
        status: 'PARTIAL',
        remainingAmount: 300,
      });

      const res = await service.markAsPaid('s-1', 200);

      expect(mockPrisma.paymentSchedule.update).toHaveBeenCalledWith({
        where: { id: 's-1' },
        data: { status: 'PARTIAL', remainingAmount: 300 },
      });
      expect(res.updatedSchedule.status).toBe('PARTIAL');
    });
  });
});
