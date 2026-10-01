import { Test, TestingModule } from '@nestjs/testing';

jest.mock('@brokeros/prisma', () => ({
  PrismaClient: class {},
}));
jest.mock('../../lib/database/prisma.service.js', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({})),
}));

import { CallStatusController } from './call-status.controller.js';
import { PrismaService } from '../../lib/database/prisma.service.js';

describe('CallStatusController', () => {
  let controller: CallStatusController;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CallStatusController],
      providers: [{ provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    controller = module.get<CallStatusController>(CallStatusController);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should update on-call status for authenticated user', async () => {
    mockPrisma.user.update.mockResolvedValue({ id: 'u-1', isOnCall: true });

    const req = { user: { id: 'u-1' } };
    const res = await controller.setCallStatus({ isOnCall: true }, req);

    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u-1' },
      data: { isOnCall: true },
    });
    expect(res).toEqual({ success: true, isOnCall: true });
  });

  it('should return failure if not authenticated', async () => {
    const req = { user: null };
    const res = await controller.setCallStatus({ isOnCall: true }, req);
    expect(res).toEqual({ success: false, message: 'Not authenticated' });
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });
});
