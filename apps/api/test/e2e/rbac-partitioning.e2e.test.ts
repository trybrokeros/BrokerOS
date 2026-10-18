import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InventoryProjectsService } from '../../src/inventory/projects/inventory-projects.service.js';
import { BrokerCommissionsService } from '../../src/brokers/broker-commissions.service.js';

describe('API E2E: RBAC & Business Line Partitioning (isCpProject)', () => {
  let inventoryService: InventoryProjectsService;
  let commissionsService: BrokerCommissionsService;
  let mockPrisma: any;
  let mockNotifications: any;

  const mockCpProject = {
    id: 'proj-cp-1',
    name: 'Skyline CP Heights',
    isCpProject: true,
    builder: { id: 'builder-1', name: 'Skyline Developers' },
    _count: { towers: 2 },
  };

  const mockBrokerageProject = {
    id: 'proj-brok-1',
    name: 'Luxury Internal Residences',
    isCpProject: false,
    builder: { id: 'builder-2', name: 'Internal Properties' },
    _count: { towers: 4 },
  };

  beforeEach(() => {
    mockNotifications = {
      createNotification: vi.fn().mockResolvedValue({ id: 'notif-1' }),
    };

    mockPrisma = {
      user: {
        findUnique: vi.fn(),
      },
      project: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
      projectAssignment: {
        findMany: vi.fn(),
      },
      towerAssignment: {
        findMany: vi.fn(),
      },
      brokerageRecord: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };

    inventoryService = new InventoryProjectsService(
      mockPrisma,
      mockNotifications,
    );
    commissionsService = new BrokerCommissionsService(mockPrisma);
  });

  describe('Inventory Project Partitioning', () => {
    it('enforces Sourcing Manager receives ONLY CP projects (isCpProject = true) by default', async () => {
      // Mock SOURCING_MANAGER user
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-sm-1',
        name: 'Sourcing Manager 1',
        role: { code: 'SOURCING_MANAGER', name: 'Sourcing Manager' },
      });

      // User has assigned projects (one CP, one incorrectly attached brokerage)
      mockPrisma.projectAssignment.findMany.mockResolvedValue([
        { project: mockCpProject },
        { project: mockBrokerageProject },
      ]);
      mockPrisma.towerAssignment.findMany.mockResolvedValue([]);

      const result = await inventoryService.getProjects({}, 'user-sm-1');

      // Invariant check: MUST filter out all brokerage-only projects
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('proj-cp-1');
      expect(result[0].isCpProject).toBe(true);
      expect(result.some((p: any) => p.isCpProject === false)).toBe(false);
    });

    it('enforces Channel Partner receives ONLY CP projects (isCpProject = true)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-cp-1',
        name: 'External Channel Partner',
        role: { code: 'CHANNEL_PARTNER', name: 'Channel Partner' },
      });

      mockPrisma.projectAssignment.findMany.mockResolvedValue([
        { project: mockCpProject },
      ]);
      mockPrisma.towerAssignment.findMany.mockResolvedValue([]);

      const result = await inventoryService.getProjects({}, 'user-cp-1');

      expect(result).toHaveLength(1);
      expect(result[0].isCpProject).toBe(true);
    });

    it('allows Admin to query Brokerage projects when requested', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-admin-1',
        name: 'Super Admin',
        role: { code: 'ADMIN', name: 'Administrator' },
      });

      mockPrisma.project.findMany.mockResolvedValue([mockBrokerageProject]);

      const result = await inventoryService.getProjects(
        { isCpProject: 'false' as any },
        'user-admin-1',
      );

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        where: { isCpProject: false },
        include: { builder: true, _count: { select: { towers: true } } },
      });
      expect(result[0].isCpProject).toBe(false);
    });

    it('allows Admin to query CP projects when requested', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-admin-1',
        name: 'Super Admin',
        role: { code: 'ADMIN', name: 'Administrator' },
      });

      mockPrisma.project.findMany.mockResolvedValue([mockCpProject]);

      const result = await inventoryService.getProjects(
        { isCpProject: 'true' as any },
        'user-admin-1',
      );

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        where: { isCpProject: true },
        include: { builder: true, _count: { select: { towers: true } } },
      });
      expect(result[0].isCpProject).toBe(true);
    });

    it('throws NotFoundException if the querying user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        inventoryService.getProjects({}, 'non-existent-user'),
      ).rejects.toThrow('User not found');
    });
  });

  describe('Broker Commissions Boundary Isolation', () => {
    it('scopes commissions for Sourcing Manager to only their recruited brokers', async () => {
      const smUserId = 'user-sm-1';
      mockPrisma.user.findUnique.mockResolvedValue({
        id: smUserId,
        role: { code: 'SOURCING_MANAGER' },
      });

      mockPrisma.brokerageRecord.findMany.mockResolvedValue([
        {
          id: 'rec-1',
          broker: {
            id: 'broker-1',
            name: 'Elite Realty',
            phone: '+919876543210',
          },
          netPayable: 150000,
          status: 'UNPAID',
        },
      ]);

      const records = await commissionsService.getCommissions(smUserId);

      expect(mockPrisma.brokerageRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            broker: { sourcingManagerId: smUserId },
          },
        }),
      );
      expect(records).toHaveLength(1);
      expect(records[0].netPayable).toBe(150000);
    });

    it('successfully completes and marks commission PAID with approval audit info', async () => {
      const recordId = 'rec-1';
      const approverId = 'user-finance-1';

      mockPrisma.brokerageRecord.findUnique.mockResolvedValue({
        id: recordId,
        netPayable: 200000,
        status: 'PENDING',
        paymentReference: 'REF-TX-9988',
      });

      mockPrisma.brokerageRecord.update.mockResolvedValue({
        id: recordId,
        status: 'PAID',
        paidAmount: 200000,
        paymentReference: 'REF-TX-9988',
        approvedById: approverId,
      });

      const updated = await commissionsService.completeCommission(
        recordId,
        approverId,
      );

      expect(mockPrisma.brokerageRecord.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: recordId },
          data: expect.objectContaining({
            status: 'PAID',
            paidAmount: 200000,
            approvedById: approverId,
          }),
        }),
      );
      expect(updated.status).toBe('PAID');
    });

    it('rejects completing commission if record ID does not exist', async () => {
      mockPrisma.brokerageRecord.findUnique.mockResolvedValue(null);

      await expect(
        commissionsService.completeCommission('non-existent-rec', 'user-1'),
      ).rejects.toThrow('Commission record not found');
    });
  });

  describe('A10: Least-Privilege Role Scoping & RolesGuard Enforcement', () => {
    it('verifies BusinessManagerDashboardController is protected with executive roles', async () => {
      const { Reflector } = await import('@nestjs/core');
      const { ROLES_KEY } = await import('../../src/auth/roles.decorator.js');
      const { BusinessManagerDashboardController } = await import(
        '../../src/dashboard/business-manager/business-manager-dashboard.controller.js'
      );

      const reflector = new Reflector();
      const roles = reflector.get<string[]>(
        ROLES_KEY,
        BusinessManagerDashboardController,
      );

      expect(roles).toBeDefined();
      expect(roles).toEqual(['ADMIN', 'DIRECTOR', 'BUSINESS_MANAGER']);
    }, 25000);

    it('verifies SalesManagerDashboardController is restricted to manager and director roles', async () => {
      const { Reflector } = await import('@nestjs/core');
      const { ROLES_KEY } = await import('../../src/auth/roles.decorator.js');
      const { SalesManagerDashboardController } = await import(
        '../../src/dashboard/core/dashboard.controller.js'
      );

      const reflector = new Reflector();
      const roles = reflector.get<string[]>(
        ROLES_KEY,
        SalesManagerDashboardController,
      );

      expect(roles).toBeDefined();
      expect(roles).toEqual([
        'ADMIN',
        'DIRECTOR',
        'BUSINESS_MANAGER',
        'SALES_MANAGER',
      ]);
    }, 60000);

    it('verifies RolesGuard blocks unauthorized role access and permits authorized role access', async () => {
      const { Reflector } = await import('@nestjs/core');
      const { RolesGuard } = await import('../../src/auth/roles.guard.js');
      const { SalesManagerDashboardController } = await import(
        '../../src/dashboard/core/dashboard.controller.js'
      );

      const reflector = new Reflector();
      const guard = new RolesGuard(reflector);

      // Context simulating SALES_EXECUTIVE trying to access sales manager endpoint
      const unauthorizedContext = {
        getHandler: () => SalesManagerDashboardController.prototype.getDashboard,
        getClass: () => SalesManagerDashboardController,
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 'exec-1', role: 'SALES_EXECUTIVE' },
          }),
        }),
      } as any;

      const denied = await guard.canActivate(unauthorizedContext);
      expect(denied).toBe(false);

      // Context simulating SALES_MANAGER accessing sales manager endpoint
      const managerContext = {
        getHandler: () => SalesManagerDashboardController.prototype.getDashboard,
        getClass: () => SalesManagerDashboardController,
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 'mgr-1', role: 'SALES_MANAGER' },
          }),
        }),
      } as any;

      const allowed = await guard.canActivate(managerContext);
      expect(allowed).toBe(true);

      // Context simulating ADMIN supervisory access
      const adminContext = {
        getHandler: () => SalesManagerDashboardController.prototype.getDashboard,
        getClass: () => SalesManagerDashboardController,
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 'admin-1', role: 'ADMIN' },
          }),
        }),
      } as any;

      const adminAllowed = await guard.canActivate(adminContext);
      expect(adminAllowed).toBe(true);
    }, 25000);

    it('verifies CrmTelephonyController connect carrier mutation is restricted to ADMIN and DIRECTOR', async () => {
      const { Reflector } = await import('@nestjs/core');
      const { ROLES_KEY } = await import('../../src/auth/roles.decorator.js');
      const { CrmTelephonyController } = await import(
        '../../src/crm-telephony/crm-telephony.controller.js'
      );

      const reflector = new Reflector();
      const roles = reflector.get<string[]>(
        ROLES_KEY,
        CrmTelephonyController.prototype.connect,
      );

      expect(roles).toBeDefined();
      expect(roles).toEqual(['ADMIN', 'DIRECTOR']);
    }, 25000);

    it('verifies PaymentsController mutations are restricted to finance, post-sales, and management', async () => {
      const { Reflector } = await import('@nestjs/core');
      const { ROLES_KEY } = await import('../../src/auth/roles.decorator.js');
      const { PaymentsController } = await import(
        '../../src/payments/payments.controller.js'
      );

      const reflector = new Reflector();
      const payRoles = reflector.get<string[]>(
        ROLES_KEY,
        PaymentsController.prototype.markAsPaid,
      );

      expect(payRoles).toBeDefined();
      expect(payRoles).toContain('FINANCE');
      expect(payRoles).toContain('POST_SALES_MANAGER');
      expect(payRoles).not.toContain('PRE_SALES');
      expect(payRoles).not.toContain('SALES_EXECUTIVE');
    }, 25000);

    it('verifies BookingController cancellation is restricted to management and authorized partners', async () => {
      const { Reflector } = await import('@nestjs/core');
      const { ROLES_KEY } = await import('../../src/auth/roles.decorator.js');
      const { BookingController } = await import(
        '../../src/leads/lead-booking.controller.js'
      );

      const reflector = new Reflector();
      const cancelRoles = reflector.get<string[]>(
        ROLES_KEY,
        BookingController.prototype.cancelBooking,
      );

      expect(cancelRoles).toBeDefined();
      expect(cancelRoles).toContain('SALES_MANAGER');
      expect(cancelRoles).toContain('ADMIN');
      expect(cancelRoles).toContain('CHANNEL_PARTNER');
      expect(cancelRoles).not.toContain('SALES_EXECUTIVE');
    }, 25000);

    it('verifies ProjectsController allows CHANNEL_PARTNER to create projects and assign field teams', async () => {
      const { Reflector } = await import('@nestjs/core');
      const { ROLES_KEY } = await import('../../src/auth/roles.decorator.js');
      const { ProjectsController } = await import(
        '../../src/inventory/projects/projects.controller.js'
      );

      const reflector = new Reflector();
      const createRoles = reflector.get<string[]>(
        ROLES_KEY,
        ProjectsController.prototype.createProject,
      );
      const assignRoles = reflector.get<string[]>(
        ROLES_KEY,
        ProjectsController.prototype.assignProject,
      );
      const assignTowerRoles = reflector.get<string[]>(
        ROLES_KEY,
        ProjectsController.prototype.assignTower,
      );

      expect(createRoles).toContain('CHANNEL_PARTNER');
      expect(assignRoles).toContain('CHANNEL_PARTNER');
      expect(assignTowerRoles).toContain('CHANNEL_PARTNER');
    }, 25000);

    it('verifies VoiceIntegrationsController is restricted to admin, director, and marketing', async () => {
      const { Reflector } = await import('@nestjs/core');
      const { ROLES_KEY } = await import('../../src/auth/roles.decorator.js');
      const { VoiceIntegrationsController } = await import(
        '../../src/marketing/voice/controllers/voice-integrations.controller.js'
      );

      const reflector = new Reflector();
      const voiceRoles = reflector.get<string[]>(
        ROLES_KEY,
        VoiceIntegrationsController,
      );

      expect(voiceRoles).toBeDefined();
      expect(voiceRoles).toEqual([
        'ADMIN',
        'DIRECTOR',
        'MARKETING',
        'BUSINESS_MANAGER',
      ]);
    }, 25000);
  });
});
