import { Test, TestingModule } from '@nestjs/testing';

jest.mock('@brokeros/prisma', () => ({
  PrismaClient: class {},
}));
jest.mock('../../../lib/database/prisma.service.js', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({})),
}));

import { PaymentsController } from './payments.controller.js';
import { PaymentsService } from './payments.service.js';
import { BadRequestException } from '@nestjs/common';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let service: PaymentsService;

  const mockPaymentsService = {
    createSchedule: jest.fn(),
    getPendingPayments: jest.fn(),
    getSchedulesByBooking: jest.fn(),
    markAsPaid: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [{ provide: PaymentsService, useValue: mockPaymentsService }],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
    service = module.get<PaymentsService>(PaymentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createSchedule', () => {
    it('should throw BadRequestException if neither installmentsCount nor percentagePerMonth is provided', async () => {
      await expect(
        controller.createSchedule('b-1', {
          netAmount: 1000,
          startDate: '2026-01-01',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should call service.createSchedule when valid body is passed', async () => {
      const body = {
        netAmount: 1000,
        startDate: '2026-01-01',
        installmentsCount: 3,
      };
      const expected = [{ id: 's-1' }];
      mockPaymentsService.createSchedule.mockResolvedValue(expected);

      const res = await controller.createSchedule('b-1', body);
      expect(service.createSchedule).toHaveBeenCalledWith('b-1', body);
      expect(res).toEqual(expected);
    });
  });

  describe('getPendingPayments', () => {
    it('should get pending payments', async () => {
      const expected = [{ id: 's-1' }];
      mockPaymentsService.getPendingPayments.mockResolvedValue(expected);

      const res = await controller.getPendingPayments('mgr-1');
      expect(service.getPendingPayments).toHaveBeenCalledWith('mgr-1');
      expect(res).toEqual(expected);
    });
  });

  describe('getSchedulesByBooking', () => {
    it('should get schedules by booking', async () => {
      const expected = [{ id: 's-1' }];
      mockPaymentsService.getSchedulesByBooking.mockResolvedValue(expected);

      const res = await controller.getSchedulesByBooking('b-1');
      expect(service.getSchedulesByBooking).toHaveBeenCalledWith('b-1');
      expect(res).toEqual(expected);
    });
  });

  describe('markAsPaid', () => {
    it('should throw BadRequestException if amountPaid is missing or invalid', async () => {
      await expect(
        controller.markAsPaid('s-1', {} as any, undefined as any),
      ).rejects.toThrow(BadRequestException);

      await expect(
        controller.markAsPaid(
          's-1',
          { amountPaid: 'invalid' } as any,
          undefined as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should call service.markAsPaid when amount is valid', async () => {
      const body = { amountPaid: '500', remarks: 'Check payment' };
      const file = { originalname: 'receipt.pdf' } as Express.Multer.File;
      const expected = { updatedSchedule: { id: 's-1', status: 'PAID' } };
      mockPaymentsService.markAsPaid.mockResolvedValue(expected);

      const res = await controller.markAsPaid('s-1', body, file);
      expect(service.markAsPaid).toHaveBeenCalledWith(
        's-1',
        500,
        'Check payment',
        file,
      );
      expect(res).toEqual(expected);
    });
  });
});
