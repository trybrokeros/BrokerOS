import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('GlobalExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Skip non-HTTP contexts (e.g. WebSockets handled by socket gateways)
    if (!response || typeof response.status !== 'function') {
      return;
    }

    const isProduction = process.env.NODE_ENV === 'production';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';
    let error: any = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        message = (res as any).message || message;
        error = (res as any).error || error;
      }
    } else {
      // Non-HttpException: unhandled runtime error or database error
      const err = exception as any;
      this.logger.error(
        `Unhandled Exception on ${request?.method || 'UNKNOWN'} ${request?.url || ''}: ${err?.message || err}`,
        err?.stack,
      );

      if (!isProduction) {
        message = err?.message || 'Internal server error';
        error = err?.name || 'Error';
      }
    }

    // In production, mask 500 error messages to prevent leaking stack traces or table internals
    if (isProduction && status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      message = 'Internal server error';
      error = 'Internal Server Error';
    }

    response.status(status).json({
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request?.url || '',
    });
  }
}
