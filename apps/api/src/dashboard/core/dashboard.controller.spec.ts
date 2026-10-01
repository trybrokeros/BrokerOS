import { Test, TestingModule } from '@nestjs/testing';
jest.mock('@brokeros/prisma', () => ({ PrismaClient: class {} }));
jest.mock('expo-server-sdk', () => ({ Expo: class {} }));
jest.mock('@thallesp/nestjs-better-auth', () => ({
  AuthGuard: class {},
  Public: () => () => {},
}));

import {
  DashboardController,
  DashboardManagerController,
  SalesManagerDashboardController,
  SalesExecDashboardController,
} from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';
import { EmployeesService } from '../employees/employees.service.js';
import { PreSalesAnalyticsService } from '../pre-sales/pre-sales-analytics.service.js';
import { PreSalesDashboardService } from '../pre-sales/pre-sales-dashboard.service.js';
import { SalesManagerDashboardService } from '../sales-manager/sales-manager-dashboard.service.js';
import { SalesManagerAnalyticsService } from '../sales-manager/sales-manager-analytics.service.js';
import { SalesExecDashboardService } from '../sales-exec/sales-exec-dashboard.service.js';
import { SalesExecAnalyticsService } from '../sales-exec/sales-exec-analytics.service.js';

describe('Dashboard Controllers', () => {
  let dashboardController: DashboardController;
  let managerController: DashboardManagerController;
  let mockDashboardService: {
    getPreSalesDashboard: jest.Mock;
    getPreSalesManagerDashboard: jest.Mock;
    getPreSalesManagerAnalytics: jest.Mock;
    getManagerLeaderboard: jest.Mock;
    getLeaderboard: jest.Mock;
    confirmFollowUp: jest.Mock;
  };
  let mockEmployeesService: {
    getMyTask: jest.Mock;
  };
  let mockPreSalesAnalytics: {
    getPreSalesAnalytics: jest.Mock;
  };
  let mockPreSalesDashboard: {
    getDashboard: jest.Mock;
    getAnnouncements: jest.Mock;
    createAnnouncement: jest.Mock;
    updateAnnouncement: jest.Mock;
    deleteAnnouncement: jest.Mock;
    getDepartmentTasks: jest.Mock;
    createDepartmentTask: jest.Mock;
    updateDepartmentTask: jest.Mock;
    deleteDepartmentTask: jest.Mock;
    getLeaderboard: jest.Mock;
  };

  beforeEach(async () => {
    mockDashboardService = {
      getPreSalesDashboard: jest.fn().mockResolvedValue({ stats: {} }),
      getPreSalesManagerDashboard: jest.fn().mockResolvedValue({ stats: {} }),
      getPreSalesManagerAnalytics: jest
        .fn()
        .mockResolvedValue({ analytics: {} }),
      getManagerLeaderboard: jest.fn().mockResolvedValue([]),
      getLeaderboard: jest.fn().mockResolvedValue([]),
      confirmFollowUp: jest.fn().mockResolvedValue({ success: true }),
    };
    mockEmployeesService = {
      getMyTask: jest.fn().mockResolvedValue({ target: 50 }),
    };
    mockPreSalesAnalytics = {
      getPreSalesAnalytics: jest.fn().mockResolvedValue({ metrics: {} }),
    };
    mockPreSalesDashboard = {
      getDashboard: jest.fn().mockResolvedValue({ stats: {} }),
      getAnnouncements: jest.fn().mockResolvedValue([]),
      createAnnouncement: jest.fn().mockResolvedValue({ id: 'a-1' }),
      updateAnnouncement: jest.fn().mockResolvedValue({ id: 'a-1' }),
      deleteAnnouncement: jest.fn().mockResolvedValue({ success: true }),
      getDepartmentTasks: jest.fn().mockResolvedValue([]),
      createDepartmentTask: jest.fn().mockResolvedValue({ id: 't-1' }),
      updateDepartmentTask: jest.fn().mockResolvedValue({ id: 't-1' }),
      deleteDepartmentTask: jest.fn().mockResolvedValue({ success: true }),
      getLeaderboard: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController, DashboardManagerController],
      providers: [
        { provide: DashboardService, useValue: mockDashboardService },
        { provide: EmployeesService, useValue: mockEmployeesService },
        { provide: PreSalesAnalyticsService, useValue: mockPreSalesAnalytics },
        { provide: PreSalesDashboardService, useValue: mockPreSalesDashboard },
      ],
    }).compile();

    dashboardController = module.get<DashboardController>(DashboardController);
    managerController = module.get<DashboardManagerController>(
      DashboardManagerController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('DashboardController (Pre-Sales Agent)', () => {
    it('should get pre-sales dashboard', async () => {
      const req = { user: { id: 'u-1' } };
      const res = await dashboardController.getDashboard(req);
      expect(mockDashboardService.getPreSalesDashboard).toHaveBeenCalledWith(
        'u-1',
      );
      expect(res).toEqual({ stats: {} });
    });

    it('should get pre-sales analytics', async () => {
      const req = { user: { id: 'u-1' } };
      const res = await dashboardController.getAnalytics(req, 'MONTHLY');
      expect(mockPreSalesAnalytics.getPreSalesAnalytics).toHaveBeenCalledWith(
        'u-1',
        'MONTHLY',
      );
      expect(res).toEqual({ metrics: {} });
    });

    it('should get leaderboard', async () => {
      const req = { user: { id: 'u-1' } };
      const res = await dashboardController.getLeaderboard(req);
      expect(mockDashboardService.getLeaderboard).toHaveBeenCalledWith('u-1');
      expect(res).toEqual([]);
    });

    it('should confirm follow-up', async () => {
      const req = { user: { id: 'u-1' } };
      const res = await dashboardController.confirmFollowUp('fu-1', req);
      expect(mockDashboardService.confirmFollowUp).toHaveBeenCalledWith(
        'fu-1',
        'u-1',
      );
      expect(res).toEqual({ success: true });
    });

    it('should get my task', async () => {
      const req = { user: { id: 'u-1' } };
      const res = await dashboardController.getMyTask(req);
      expect(mockEmployeesService.getMyTask).toHaveBeenCalledWith('u-1');
      expect(res).toEqual({ target: 50 });
    });
  });

  describe('DashboardManagerController (Pre-Sales Manager)', () => {
    it('should get manager dashboard', async () => {
      const req = { user: { id: 'm-1' } };
      mockDashboardService.getPreSalesManagerDashboard = jest
        .fn()
        .mockResolvedValue({ stats: {} });
      const res = await managerController.getManagerDashboard(req);
      expect(
        mockDashboardService.getPreSalesManagerDashboard,
      ).toHaveBeenCalledWith('m-1');
      expect(res).toEqual({ stats: {} });
    });

    it('should get manager analytics', async () => {
      const req = { user: { id: 'm-1' } };
      mockDashboardService.getPreSalesManagerAnalytics = jest
        .fn()
        .mockResolvedValue({ analytics: {} });
      const res = await managerController.getManagerAnalytics(req, 'WEEKLY');
      expect(
        mockDashboardService.getPreSalesManagerAnalytics,
      ).toHaveBeenCalledWith('m-1', 'WEEKLY');
      expect(res).toEqual({ analytics: {} });
    });

    it('should get manager leaderboard', async () => {
      const req = { user: { id: 'm-1' } };
      mockDashboardService.getManagerLeaderboard = jest
        .fn()
        .mockResolvedValue([]);
      const res = await managerController.getManagerLeaderboard(req);
      expect(mockDashboardService.getManagerLeaderboard).toHaveBeenCalledWith(
        'm-1',
      );
      expect(res).toEqual([]);
    });
  });
});
