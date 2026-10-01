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

import { BookingService } from './booking.service.js';
import { BookingQueryService } from './booking-query.service.js';
import { BookingCreationService } from './booking-creation.service.js';
import { BookingStatusService } from './booking-status.service.js';
import { BookingDocumentsService } from './booking-documents.service.js';
import { BookingPostSalesService } from './booking-post-sales.service.js';
import { CreateBookingDto, UpdateBookingDto } from './dto/booking.dto.js';

describe('BookingService', () => {
  let service: BookingService;
  let bookingCreation: BookingCreationService;
  let bookingQuery: BookingQueryService;
  let bookingStatus: BookingStatusService;
  let bookingDocuments: BookingDocumentsService;
  let bookingPostSales: BookingPostSalesService;

  const mockQuery = { getBooking: jest.fn(), getAllBookings: jest.fn() };
  const mockCreation = { createBooking: jest.fn(), updateBooking: jest.fn() };
  const mockStatus = { markBookingDone: jest.fn(), cancelBooking: jest.fn() };
  const mockDocuments = {
    uploadDocument: jest.fn(),
    getDocumentFile: jest.fn(),
  };
  const mockPostSales = {
    saveLoanCase: jest.fn(),
    saveAgreement: jest.fn(),
    saveHandover: jest.fn(),
    uploadPostSalesFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        { provide: BookingQueryService, useValue: mockQuery },
        { provide: BookingCreationService, useValue: mockCreation },
        { provide: BookingStatusService, useValue: mockStatus },
        { provide: BookingDocumentsService, useValue: mockDocuments },
        { provide: BookingPostSalesService, useValue: mockPostSales },
      ],
    }).compile();

    service = module.get(BookingService);
    bookingCreation = module.get(BookingCreationService);
    bookingQuery = module.get(BookingQueryService);
    bookingStatus = module.get(BookingStatusService);
    bookingDocuments = module.get(BookingDocumentsService);
    bookingPostSales = module.get(BookingPostSalesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should delegate getBooking and getAllBookings to query', async () => {
    mockQuery.getBooking.mockResolvedValue({ id: 'b-1' });
    mockQuery.getAllBookings.mockResolvedValue([{ id: 'b-1' }]);

    expect(await service.getBooking('l-1')).toEqual({ id: 'b-1' });
    expect(bookingQuery.getBooking).toHaveBeenCalledWith('l-1');

    expect(await service.getAllBookings('u-1', 'r-1')).toEqual([{ id: 'b-1' }]);
    expect(bookingQuery.getAllBookings).toHaveBeenCalledWith('u-1', 'r-1');
  });

  it('should delegate createBooking and updateBooking to creation', async () => {
    mockCreation.createBooking.mockResolvedValue({ id: 'b-1' });
    mockCreation.updateBooking.mockResolvedValue({ id: 'b-1' });

    const createDto = { unitId: 'u-1', totalAmount: 1000 } as any;
    expect(await service.createBooking('l-1', createDto)).toEqual({
      id: 'b-1',
    });
    expect(bookingCreation.createBooking).toHaveBeenCalledWith(
      'l-1',
      createDto,
    );

    const updateDto = { notes: 'Updated' } as any;
    expect(await service.updateBooking('b-1', updateDto)).toEqual({
      id: 'b-1',
    });
    expect(bookingCreation.updateBooking).toHaveBeenCalledWith(
      'b-1',
      updateDto,
    );
  });

  it('should delegate markBookingDone and cancelBooking to status', async () => {
    mockStatus.markBookingDone.mockResolvedValue({
      id: 'b-1',
      status: 'CONFIRMED',
    });
    mockStatus.cancelBooking.mockResolvedValue({
      id: 'b-1',
      status: 'CANCELLED',
    });

    expect(await service.markBookingDone('b-1')).toEqual({
      id: 'b-1',
      status: 'CONFIRMED',
    });
    expect(bookingStatus.markBookingDone).toHaveBeenCalledWith('b-1');

    expect(await service.cancelBooking('b-1', 'Reason')).toEqual({
      id: 'b-1',
      status: 'CANCELLED',
    });
    expect(bookingStatus.cancelBooking).toHaveBeenCalledWith('b-1', 'Reason');
  });

  it('should delegate documents operations', async () => {
    const file = { originalname: 'doc.pdf' } as Express.Multer.File;
    mockDocuments.uploadDocument.mockResolvedValue({ id: 'd-1' });
    mockDocuments.getDocumentFile.mockResolvedValue({ id: 'd-1' });

    expect(await service.uploadDocument('b-1', 'ID', file, 'desc')).toEqual({
      id: 'd-1',
    });
    expect(bookingDocuments.uploadDocument).toHaveBeenCalledWith(
      'b-1',
      'ID',
      file,
      'desc',
    );

    expect(await service.getDocumentFile('d-1')).toEqual({ id: 'd-1' });
    expect(bookingDocuments.getDocumentFile).toHaveBeenCalledWith('d-1');
  });

  it('should delegate post-sales operations', async () => {
    mockPostSales.saveLoanCase.mockResolvedValue({ id: 'lc-1' });
    mockPostSales.saveAgreement.mockResolvedValue({ id: 'ag-1' });
    mockPostSales.saveHandover.mockResolvedValue({ id: 'ho-1' });
    mockPostSales.uploadPostSalesFile.mockResolvedValue('url');

    expect(await service.saveLoanCase('b-1', { a: 1 })).toEqual({ id: 'lc-1' });
    expect(bookingPostSales.saveLoanCase).toHaveBeenCalledWith('b-1', { a: 1 });

    expect(await service.saveAgreement('b-1', { b: 2 })).toEqual({
      id: 'ag-1',
    });
    expect(bookingPostSales.saveAgreement).toHaveBeenCalledWith('b-1', {
      b: 2,
    });

    expect(await service.saveHandover('b-1', { c: 3 })).toEqual({ id: 'ho-1' });
    expect(bookingPostSales.saveHandover).toHaveBeenCalledWith('b-1', { c: 3 });

    const file = {} as Express.Multer.File;
    expect(
      await service.uploadPostSalesFile('b-1', 'loan', 'sanction', file),
    ).toBe('url');
    expect(bookingPostSales.uploadPostSalesFile).toHaveBeenCalledWith(
      'b-1',
      'loan',
      'sanction',
      file,
    );
  });
});
