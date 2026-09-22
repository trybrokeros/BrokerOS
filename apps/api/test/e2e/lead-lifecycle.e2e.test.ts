import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LeadsManagementService } from '../../src/leads/core/leads-management.service.js';
import { SiteVisitsService } from '../../src/leads/site-visits/site-visits.service.js';
import { BookingCreationService } from '../../src/leads/bookings/booking-creation.service.js';
import { BookingStatusService } from '../../src/leads/bookings/booking-status.service.js';
import { LeadStatus } from '@brokeros/prisma';

describe('API E2E: Lead Lifecycle State Machine', () => {
  let leadsManagementService: LeadsManagementService;
  let siteVisitsService: SiteVisitsService;
  let bookingCreationService: BookingCreationService;
  let bookingStatusService: BookingStatusService;
  let mockPrisma: any;
  let mockNotifications: any;

  beforeEach(() => {
    mockNotifications = {
      createNotification: vi.fn().mockResolvedValue({ id: 'notif-1' }),
      checkDailyTaskCompletion: vi.fn().mockResolvedValue(true),
    };

    mockPrisma = {
      lead: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
      leadSource: {
        findFirst: vi.fn(),
      },
      user: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
      project: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
      },
      projectAssignment: {
        findMany: vi.fn(),
      },
      siteVisit: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      customer: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      unit: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      unitStatusHistory: {
        create: vi.fn(),
      },
      booking: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      note: {
        create: vi.fn(),
      },
      brokerageRecord: {
        create: vi.fn(),
      },
      role: {
        findFirst: vi.fn(),
      },
      $transaction: vi.fn(async (callback: (tx: any) => Promise<any>) => callback(mockPrisma)),
    };

    leadsManagementService = new LeadsManagementService(mockPrisma, mockNotifications);
    siteVisitsService = new SiteVisitsService(mockPrisma, mockNotifications);
    bookingCreationService = new BookingCreationService(mockPrisma, mockNotifications);
    bookingStatusService = new BookingStatusService(mockPrisma, mockNotifications);
  });

  it('Step 1: Creates new lead with status NEW', async () => {
    mockPrisma.leadSource.findFirst.mockResolvedValue({ id: 'src-web', name: 'Website' });
    mockPrisma.lead.create.mockResolvedValue({
      id: 'lead-100',
      firstName: 'Aarav',
      lastName: 'Sharma',
      phone: '+919876543210',
      email: 'aarav@example.com',
      status: LeadStatus.NEW,
      score: 50,
      assignedUserId: 'mgr-1',
    });

    const lead = await leadsManagementService.create(
      {
        firstName: 'Aarav',
        lastName: 'Sharma',
        phone: '+919876543210',
        email: 'aarav@example.com',
        source: 'Website',
      },
      'mgr-1',
    );

    expect(lead.status).toBe(LeadStatus.NEW);
    expect(lead.firstName).toBe('Aarav');
    expect(mockPrisma.lead.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: LeadStatus.NEW,
          firstName: 'Aarav',
          phone: '+919876543210',
        }),
      }),
    );
  });

  it('Step 2: Assigns lead to a Sales Executive and notifies assigned user', async () => {
    const leadId = 'lead-100';
    const targetSalesExecId = 'exec-200';

    mockPrisma.lead.updateMany.mockResolvedValue({ count: 1 });

    const assignResult = await leadsManagementService.assignLeads(
      [leadId],
      'mgr-1',
      targetSalesExecId,
      false,
    );

    expect(assignResult.success).toBe(true);
    expect(assignResult.assignedCount).toBe(1);
    expect(mockPrisma.lead.updateMany).toHaveBeenCalledWith({
      where: { id: { in: [leadId] } },
      data: { assignedUserId: targetSalesExecId },
    });
    expect(mockNotifications.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: targetSalesExecId,
        type: 'LEAD_ASSIGNED',
      }),
    );
  });

  it('Step 3: Schedules site visit and moves lead status to SITE_VISIT / SCHEDULED', async () => {
    const leadId = 'lead-100';
    const projectId = 'proj-1';
    const salesExecId = 'exec-200';

    mockPrisma.lead.findUnique.mockResolvedValue({
      id: leadId,
      status: LeadStatus.NEW,
    });
    mockPrisma.projectAssignment.findMany.mockResolvedValue([
      { userId: salesExecId, projectId },
    ]);
    mockPrisma.siteVisit.findFirst.mockResolvedValue(null);
    mockPrisma.siteVisit.create.mockResolvedValue({
      id: 'sv-500',
      leadId,
      projectId,
      salesExecId,
      status: 'SCHEDULED',
      scheduledDate: new Date('2026-10-01T10:00:00Z'),
      project: { id: projectId, name: 'Project Alpha' },
    });
    mockPrisma.lead.update.mockResolvedValue({
      id: leadId,
      status: 'SITE_VISIT',
      subStatus: 'SCHEDULED',
      assignedUserId: salesExecId,
    });

    const sv = await siteVisitsService.createSiteVisit(leadId, {
      projectId,
      userId: 'mgr-1',
      scheduledDate: '2026-10-01T10:00:00Z',
      meetingNotes: 'Client interested in 3BHK high-floor unit',
    });

    expect(sv.status).toBe('SCHEDULED');
    expect(mockPrisma.lead.update).toHaveBeenCalledWith({
      where: { id: leadId },
      data: {
        status: 'SITE_VISIT_SCHEDULED',
        assignedUserId: salesExecId,
      },
    });
  });

  it('Step 4: Arrives at site visit with GPS coordinates verification', async () => {
    const siteVisitId = 'sv-500';
    const mockCoordinates = { latitude: 19.0760, longitude: 72.8777 };

    mockPrisma.siteVisit.update.mockResolvedValue({
      id: siteVisitId,
      status: 'SCHEDULED',
      arrivedAt: new Date(),
      arriveLatitude: mockCoordinates.latitude,
      arriveLongitude: mockCoordinates.longitude,
    });

    const arrived = await siteVisitsService.arriveAtSiteVisit(siteVisitId, mockCoordinates);

    expect(arrived.arriveLatitude).toBe(19.0760);
    expect(arrived.arriveLongitude).toBe(72.8777);
    expect(mockPrisma.siteVisit.update).toHaveBeenCalledWith({
      where: { id: siteVisitId },
      data: expect.objectContaining({
        arriveLatitude: 19.0760,
        arriveLongitude: 72.8777,
      }),
    });
  });

  it('Step 5: Creates booking, spawns customer profile, and reserves unit', async () => {
    const leadId = 'lead-100';
    const unitId = 'unit-301';

    mockPrisma.lead.findUnique.mockResolvedValue({
      id: leadId,
      firstName: 'Aarav',
      lastName: 'Sharma',
      phone: '+919876543210',
      email: 'aarav@example.com',
      brokerId: null,
    });
    mockPrisma.customer.findUnique.mockResolvedValue(null);
    mockPrisma.customer.create.mockResolvedValue({
      id: 'cust-1',
      leadId,
      firstName: 'Aarav',
      lastName: 'Sharma',
      phone: '+919876543210',
    });
    mockPrisma.unit.findUnique.mockResolvedValue({
      id: unitId,
      status: 'AVAILABLE',
      unitNumber: 'A-301',
      floor: { tower: { projectId: 'proj-1' } },
    });
    mockPrisma.unit.update.mockResolvedValue({
      id: unitId,
      status: 'RESERVED',
    });
    mockPrisma.booking.create.mockResolvedValue({
      id: 'booking-999',
      customerId: 'cust-1',
      unitId,
      status: 'PENDING',
      agreedPrice: 15000000,
    });
    mockPrisma.lead.update.mockResolvedValue({
      id: leadId,
      status: 'BOOKING',
    });

    const bookingResult = await bookingCreationService.createBooking(leadId, {
      unitId,
      agreedPrice: 15000000,
      userId: 'exec-200',
    });

    expect(bookingResult.id).toBe('booking-999');
    expect(mockPrisma.customer.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          leadId,
          firstName: 'Aarav',
          phone: '+919876543210',
        }),
      }),
    );
    expect(mockPrisma.unit.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: unitId },
        data: expect.objectContaining({ status: 'RESERVED' }),
      }),
    );
  });

  it('Step 6: Confirms booking and transitions unit to SOLD and lead to DONE', async () => {
    const bookingId = 'booking-999';
    const customerId = 'cust-1';
    const leadId = 'lead-100';

    mockPrisma.booking.findUnique.mockResolvedValue({
      id: bookingId,
      customerId,
      status: 'PENDING',
      source: 'DIRECT',
      assignedPostSalesId: 'post-sales-1',
      unit: {
        id: 'unit-301',
        floor: { tower: { project: { isCpProject: false } } },
      },
    });
    mockPrisma.booking.update.mockResolvedValue({
      id: bookingId,
      status: 'CONFIRMED',
    });
    mockPrisma.customer.findUnique.mockResolvedValue({
      id: customerId,
      leadId,
    });
    mockPrisma.lead.findUnique.mockResolvedValue({
      id: leadId,
      brokerId: null,
    });
    mockPrisma.lead.update.mockResolvedValue({
      id: leadId,
      status: 'BOOKING',
      subStatus: 'DONE',
    });

    const confirmedBooking = await bookingStatusService.markBookingDone(bookingId);

    expect(confirmedBooking.status).toBe('CONFIRMED');
    expect(mockPrisma.lead.update).toHaveBeenCalledWith({
      where: { id: leadId },
      data: { status: 'BOOKING', subStatus: 'DONE' },
    });
  });
});
