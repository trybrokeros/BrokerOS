import { Test, TestingModule } from '@nestjs/testing';

jest.mock('@brokeros/prisma', () => ({
  PrismaClient: class {},
}));
jest.mock('expo-server-sdk', () => ({ Expo: class {} }));
jest.mock('p-queue', () => {
  return jest.fn().mockImplementation(() => ({
    add: jest.fn(),
  }));
});
jest.mock('../../notifications/notifications.service.js');
jest.mock('../../lib/database/prisma.service.js', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({})),
}));

import { CallRecordsController } from './call-records.controller.js';
import { CallRecordsService } from './call-records.service.js';

describe('CallRecordsController', () => {
  let controller: CallRecordsController;
  let service: CallRecordsService;

  const mockCallRecordsService = {
    uploadCallRecord: jest.fn(),
    getCallRecord: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CallRecordsController],
      providers: [
        { provide: CallRecordsService, useValue: mockCallRecordsService },
      ],
    }).compile();

    controller = module.get<CallRecordsController>(CallRecordsController);
    service = module.get<CallRecordsService>(CallRecordsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should upload call record', async () => {
    const file = { originalname: 'rec.mp3', size: 1000 } as Express.Multer.File;
    const body = { phoneNumber: '1234567890' };
    const expected = { success: true, recordId: 'cr-1' };
    mockCallRecordsService.uploadCallRecord.mockResolvedValue(expected);

    const result = await controller.uploadCallRecord(file, body as any);
    expect(service.uploadCallRecord).toHaveBeenCalledWith(file, body);
    expect(result).toEqual(expected);
  });

  it('should return 404 when audio record is not found', async () => {
    mockCallRecordsService.getCallRecord.mockResolvedValue(null);
    const mockRes: any = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await controller.getCallRecordAudio('cr-nonexistent', mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.send).toHaveBeenCalledWith('Audio not found');
  });
});
