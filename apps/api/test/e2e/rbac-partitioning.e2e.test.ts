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

    inventoryService = new InventoryProjectsService(mockPrisma, mockNotifications);
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
          broker: { id: 'broker-1', name: 'Elite Realty', phone: '+919876543210' },
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

      const updated = await commissionsService.completeCommission(recordId, approverId);

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
});
