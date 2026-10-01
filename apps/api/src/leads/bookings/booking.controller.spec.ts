import { Test, TestingModule } from '@nestjs/testing';

jest.mock('@brokeros/prisma', () => ({ PrismaClient: class {} }));
jest.mock('expo-server-sdk', () => ({ Expo: class {} }));
jest.mock('@brokeros/storage', () => ({ uploadFileToBlob: jest.fn() }));
jest.mock('../../lib/storage/storage.service.js', () => ({
  StorageService: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('../../lib/database/prisma.service.js', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('../../notifications/notifications.service.js');

import { BookingController } from './booking.controller.js';
import { BookingService } from './booking.service.js';

describe('BookingController', () => {
  let controller: BookingController;
  let service: BookingService;

  const mockBookingService = {
    getBooking: jest.fn(),
    createBooking: jest.fn(),
    updateBooking: jest.fn(),
    markBookingDone: jest.fn(),
    cancelBooking: jest.fn(),
    uploadDocument: jest.fn(),
    getDocumentFile: jest.fn(),
    saveLoanCase: jest.fn(),
    saveAgreement: jest.fn(),
    saveHandover: jest.fn(),
    uploadPostSalesFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [{ provide: BookingService, useValue: mockBookingService }],
    }).compile();

    controller = module.get<BookingController>(BookingController);
    service = module.get<BookingService>(BookingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get booking for a lead', async () => {
    const expected = { id: 'b-1' };
    mockBookingService.getBooking.mockResolvedValue(expected);

    const res = await controller.getBooking('l-1');
    expect(service.getBooking).toHaveBeenCalledWith('l-1');
    expect(res).toEqual(expected);
  });

  it('should create booking', async () => {
    const data = { unitId: 'u-1', totalAmount: 5000000 };
    const expected = { id: 'b-1', ...data };
    mockBookingService.createBooking.mockResolvedValue(expected);

    const res = await controller.createBooking('l-1', data as any);
    expect(service.createBooking).toHaveBeenCalledWith('l-1', data);
    expect(res).toEqual(expected);
  });

  it('should mark booking done', async () => {
    const expected = { id: 'b-1', status: 'CONFIRMED' };
    mockBookingService.markBookingDone.mockResolvedValue(expected);

    const res = await controller.markBookingDone('l-1', { bookingId: 'b-1' });
    expect(service.markBookingDone).toHaveBeenCalledWith('b-1');
    expect(res).toEqual(expected);
  });

  it('should cancel booking', async () => {
    const expected = { id: 'b-1', status: 'CANCELLED' };
    mockBookingService.cancelBooking.mockResolvedValue(expected);

    const res = await controller.cancelBooking('l-1', {
      bookingId: 'b-1',
      reason: 'Customer changed mind',
    });
    expect(service.cancelBooking).toHaveBeenCalledWith(
      'b-1',
      'Customer changed mind',
    );
    expect(res).toEqual(expected);
  });

  it('should save loan case', async () => {
    const body = { bookingId: 'b-1', data: { bankName: 'SBI' } };
    const expected = { id: 'lc-1', bankName: 'SBI' };
    mockBookingService.saveLoanCase.mockResolvedValue(expected);

    const res = await controller.saveLoanCase(body);
    expect(service.saveLoanCase).toHaveBeenCalledWith('b-1', body.data);
    expect(res).toEqual(expected);
  });

  it('should save agreement', async () => {
    const body = { bookingId: 'b-1', data: { agreementStatus: 'SIGNED' } };
    const expected = { id: 'ag-1', agreementStatus: 'SIGNED' };
    mockBookingService.saveAgreement.mockResolvedValue(expected);

    const res = await controller.saveAgreement(body);
    expect(service.saveAgreement).toHaveBeenCalledWith('b-1', body.data);
    expect(res).toEqual(expected);
  });

  it('should save handover', async () => {
    const body = { bookingId: 'b-1', data: { keysHandedOver: true } };
    const expected = { id: 'ho-1', keysHandedOver: true };
    mockBookingService.saveHandover.mockResolvedValue(expected);

    const res = await controller.saveHandover(body);
    expect(service.saveHandover).toHaveBeenCalledWith('b-1', body.data);
    expect(res).toEqual(expected);
  });
});
