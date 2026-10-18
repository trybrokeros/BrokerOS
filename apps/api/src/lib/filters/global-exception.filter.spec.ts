import { GlobalExceptionFilter } from './global-exception.filter.js';
import { HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common';

describe('GlobalExceptionFilter (A15 Debug Mode Off in Production)', () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockHost: ArgumentsHost;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockRequest = {
      method: 'POST',
      url: '/api/leads/test',
    };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as any;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('preserves HttpException status and message in all environments', () => {
    process.env.NODE_ENV = 'production';
    const exception = new BadRequestException('Validation failed on email field');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation failed on email field',
      }),
    );
  });

  it('masks internal server error and stack trace when in production mode', () => {
    process.env.NODE_ENV = 'production';
    const rawError = new Error('PrismaClientKnownRequestError: Table leads.secret_col does not exist at /src/db.ts:42');

    filter.catch(rawError, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: 'Internal Server Error',
      }),
    );
    // Verifies sensitive internal database and file path details are NOT exposed
    const responsePayload = mockResponse.json.mock.calls[0][0];
    expect(JSON.stringify(responsePayload)).not.toContain('secret_col');
    expect(JSON.stringify(responsePayload)).not.toContain('/src/db.ts');
  });

  it('includes error details when in non-production mode for developer diagnosis', () => {
    process.env.NODE_ENV = 'development';
    const rawError = new Error('Custom developer debug message');

    filter.catch(rawError, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Custom developer debug message',
      }),
    );
  });
});
