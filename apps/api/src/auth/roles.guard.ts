import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator.js';
import { prismaClient } from '../lib/database/prisma-client.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    let roleCode: string | undefined =
      typeof user.role === 'string' ? user.role : user.role?.code;

    if (!roleCode && user.roleId) {
      const role = await prismaClient.role.findUnique({
        where: { id: user.roleId },
      });
      roleCode = role?.code;
    }

    if (!roleCode && user.id) {
      const dbUser = await prismaClient.user.findUnique({
        where: { id: user.id },
        include: { role: true },
      });
      roleCode = dbUser?.role?.code;
    }

    if (!roleCode) {
      return false;
    }

    // System Admins and Directors have universal supervisory authorization
    if (roleCode === 'ADMIN' || roleCode === 'DIRECTOR') {
      return true;
    }

    return requiredRoles.includes(roleCode);
  }
}
