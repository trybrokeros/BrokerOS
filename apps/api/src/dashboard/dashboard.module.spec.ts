import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleModule } from '@nestjs/schedule';

jest.mock('@brokeros/prisma', () => ({
  PrismaClient: class {},
  prismaClient: {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
}));
jest.mock('expo-server-sdk', () => ({ Expo: class {} }));
jest.mock('@brokeros/storage', () => ({ uploadFileToBlob: jest.fn() }));
jest.mock('../lib/storage/storage.service.js', () => ({
  StorageService: jest.fn().mockImplementation(() => ({})),
}));

import { DashboardModule } from './dashboard.module.js';

describe('DashboardModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ScheduleModule.forRoot(), DashboardModule],
    })
      .overrideProvider('PrismaService')
      .useValue({})
      .compile();
  });

  afterEach(async () => {
    if (module) await module.close();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
    const dashboardModule = module.get<DashboardModule>(DashboardModule);
    expect(dashboardModule).toBeDefined();
  });
});
