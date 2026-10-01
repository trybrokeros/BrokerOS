import { Test, TestingModule } from '@nestjs/testing';

jest.mock('@brokeros/prisma', () => ({
  NotificationType: {
    RECOGNITION: 'RECOGNITION',
    ACHIEVEMENT_MILESTONE: 'ACHIEVEMENT_MILESTONE',
  },
  PrismaClient: class {},
}));
jest.mock('expo-server-sdk', () => ({ Expo: class {} }));
jest.mock('../../notifications/notifications.service.js');
jest.mock('@vercel/blob', () => ({
  put: jest.fn().mockResolvedValue({ url: 'http://example.com/blob.pdf' }),
}));
jest.mock('@brokeros/storage', () => ({
  uploadFileToBlob: jest.fn().mockResolvedValue('http://example.com/blob.pdf'),
}));
jest.mock('../../lib/storage/storage.service.js', () => ({
  StorageService: jest.fn().mockImplementation(() => ({
    uploadFile: jest.fn().mockResolvedValue('http://example.com/blob.pdf'),
  })),
}));
jest.mock('../../lib/database/prisma.service.js', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('fs', () => ({ writeFileSync: jest.fn() }));

import { BookingPostSalesService } from './booking-post-sales.service.js';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { NotificationsService } from '../../notifications/notifications.service.js';
import { StorageService } from '../../lib/storage/storage.service.js';

describe('BookingPostSalesService', () => {
  let service: BookingPostSalesService;

  const mockPrisma = {
    loanCase: { upsert: jest.fn(), findUnique: jest.fn() },
    agreement: { upsert: jest.fn(), findUnique: jest.fn() },
    possessionHandover: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    booking: { findUnique: jest.fn() },
    unit: { findUnique: jest.fn(), update: jest.fn() },
    unitStatusHistory: { create: jest.fn() },
    inboundCommission: { findFirst: jest.fn(), create: jest.fn() },
    user: { findUnique: jest.fn() },
    notification: { findMany: jest.fn() },
  };
  const mockNotif = { createNotification: jest.fn() };
  const mockStorage = {
    uploadFile: jest.fn().mockResolvedValue('http://example.com/blob.pdf'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingPostSalesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotif },
        { provide: StorageService, useValue: mockStorage },
      ],
    }).compile();
    service = module.get(BookingPostSalesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should save loan case', async () => {
    const expected = { id: 'lc-1', bankName: 'HDFC' };
    mockPrisma.loanCase.upsert.mockResolvedValue(expected);

    const res = await service.saveLoanCase('b-1', { bankName: 'HDFC' });
    expect(mockPrisma.loanCase.upsert).toHaveBeenCalled();
    expect(res).toEqual(expected);
  });

  it('should save agreement', async () => {
    const expected = { id: 'ag-1', agreementStatus: 'SIGNED' };
    mockPrisma.agreement.upsert.mockResolvedValue(expected);

    const res = await service.saveAgreement('b-1', {
      agreementStatus: 'SIGNED',
    });
    expect(mockPrisma.agreement.upsert).toHaveBeenCalled();
    expect(res).toEqual(expected);
  });

  it('should save handover and process logic', async () => {
    mockPrisma.possessionHandover.upsert.mockResolvedValue({ id: 'h-1' });
    mockPrisma.booking.findUnique.mockResolvedValue({
      id: 'b-1',
      unitId: 'u-1',
      customer: { firstName: 'Test' },
    });
    mockPrisma.unit.findUnique.mockResolvedValue({
      id: 'u-1',
      commissionAmount: 100,
    });
    mockPrisma.inboundCommission.findFirst.mockResolvedValue(null);
    mockPrisma.user.findUnique.mockResolvedValue({
      role: { code: 'CLOSING_MANAGER' },
    });
    mockPrisma.possessionHandover.count.mockResolvedValue(10);
    mockPrisma.notification.findMany.mockResolvedValue([]);

    await service.saveHandover('b-1', {
      keysHandedOver: true,
      handoverById: 'u-1',
    });
    expect(mockPrisma.unit.update).toHaveBeenCalled();
    expect(mockPrisma.inboundCommission.create).toHaveBeenCalled();
    expect(mockNotif.createNotification).toHaveBeenCalled();
  });

  it('should upload post-sales file', async () => {
    const file = {
      buffer: Buffer.from(''),
      originalname: 'doc.pdf',
      mimetype: 'application/pdf',
    } as Express.Multer.File;
    const res = await service.uploadPostSalesFile(
      'b-1',
      'loan',
      'sanctionLetter',
      file,
    );
    expect(mockStorage.uploadFile).toHaveBeenCalled();
    expect(res).toEqual({ url: 'http://example.com/blob.pdf' });
  });
});
