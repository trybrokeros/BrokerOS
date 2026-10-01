import { Test, TestingModule } from '@nestjs/testing';

jest.mock('@brokeros/prisma', () => ({ PrismaClient: class {} }));
jest.mock('expo-server-sdk', () => ({ Expo: class {} }));
jest.mock('@brokeros/storage', () => ({ uploadFileToBlob: jest.fn() }));
jest.mock('../../lib/storage/storage.service.js', () => ({
  StorageService: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('../../notifications/notifications.service.js');
jest.mock('../../lib/database/prisma.service.js', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({})),
}));

import { BookingsController } from './bookings.controller.js';
import { BookingService } from './booking.service.js';

describe('BookingsController', () => {
  let controller: BookingsController;
  let service: BookingService;

  const mockBookingService = {
    getAllBookings: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [{ provide: BookingService, useValue: mockBookingService }],
    }).compile();

    controller = module.get<BookingsController>(BookingsController);
    service = module.get<BookingService>(BookingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all bookings for user role', async () => {
    const expected = [{ id: 'b-1' }];
    mockBookingService.getAllBookings.mockResolvedValue(expected);

    const req = { user: { id: 'u-1', roleId: 'r-1' } };
    const res = await controller.getAllBookings(req);
    expect(service.getAllBookings).toHaveBeenCalledWith('u-1', 'r-1');
    expect(res).toEqual(expected);
  });
});
