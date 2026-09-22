import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationsGateway } from '../../src/notifications/notifications.gateway.js';

describe('API E2E: Realtime WebSocket Gateway (Notifications & Events)', () => {
  let gateway: NotificationsGateway;
  let mockServer: any;

  beforeEach(() => {
    gateway = new NotificationsGateway();
    mockServer = {
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
    };
    gateway.server = mockServer;
  });

  describe('Connection & Authentication Handshake', () => {
    it('disconnects client when neither auth token nor session cookie is provided', () => {
      const mockSocket: any = {
        id: 'socket-unauth-1',
        handshake: {
          auth: {},
          headers: {},
          query: {},
        },
        disconnect: vi.fn(),
      };

      gateway.handleConnection(mockSocket);

      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it('accepts connection and maps user sockets when authenticated via better-auth session cookie', () => {
      const userId = 'user-sales-101';
      const mockSocket: any = {
        id: 'socket-auth-101',
        handshake: {
          auth: {},
          headers: {
            cookie: 'better-auth.session_token=test_session_xyz;',
          },
          query: {
            userId,
          },
        },
        disconnect: vi.fn(),
      };

      gateway.handleConnection(mockSocket);

      expect(mockSocket.disconnect).not.toHaveBeenCalled();

      // Dispatch targeted notification to user
      const notification = {
        title: 'New Lead Assigned',
        body: 'Lead Aarav Sharma has been assigned to you',
        type: 'LEAD_ASSIGNED',
      };

      gateway.sendNotificationToUser(userId, notification as any);

      // Invariant: MUST emit to the user's specific active socket
      expect(mockServer.to).toHaveBeenCalledWith('socket-auth-101');
      expect(mockServer.emit).toHaveBeenCalledWith('new_notification', notification);
    });

    it('cleans up socket mapping on client disconnect', () => {
      const userId = 'user-sales-101';
      const mockSocket: any = {
        id: 'socket-auth-101',
        handshake: {
          auth: {},
          headers: {
            cookie: 'better-auth.session_token=test_session_xyz;',
          },
          query: {
            userId,
          },
        },
        disconnect: vi.fn(),
      };

      gateway.handleConnection(mockSocket);
      gateway.handleDisconnect(mockSocket);

      // Attempting to send notification after disconnect should not emit
      mockServer.to.mockClear();
      gateway.sendNotificationToUser(userId, { title: 'Test' } as any);

      expect(mockServer.to).not.toHaveBeenCalled();
    });
  });
});
