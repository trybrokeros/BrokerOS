import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard.js';
import { prismaClient } from '../lib/database/prisma-client.js';

jest.mock('../lib/database/prisma-client.js', () => ({
  prismaClient: {
    role: {
      findUnique: jest.fn(),
    },
  },
}));

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if no roles are required', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should return false if no user is present in request', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({}),
      }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(context);
    expect(result).toBe(false);
  });

  it('should return false if user role is not found in db', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { roleId: 'some-role-id' },
        }),
      }),
    } as unknown as ExecutionContext;

    (prismaClient.role.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await guard.canActivate(context);
    expect(result).toBe(false);
  });

  it('should return true if user role code is included in required roles', async () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['ADMIN', 'MANAGER']);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { roleId: 'role-id' },
        }),
      }),
    } as unknown as ExecutionContext;

    (prismaClient.role.findUnique as jest.Mock).mockResolvedValue({
      code: 'ADMIN',
    });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should return false if user role code is not included in required roles', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['MANAGER']);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { roleId: 'role-id' },
        }),
      }),
    } as unknown as ExecutionContext;

    (prismaClient.role.findUnique as jest.Mock).mockResolvedValue({
      code: 'USER',
    });

    const result = await guard.canActivate(context);
    expect(result).toBe(false);
  });

  it('should return true if user role code is provided directly on user object', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['SALES_MANAGER']);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { role: 'SALES_MANAGER' },
        }),
      }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should allow ADMIN even if required role is different', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['PRE_SALES']);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { role: 'ADMIN' },
        }),
      }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });
});
