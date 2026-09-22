import { test as base, Page, BrowserContext } from '@playwright/test';
import { TEST_USERS } from './test-data';

type AuthFixtures = {
  loginAsUser: (userKey: keyof typeof TEST_USERS) => Promise<void>;
  authenticatedPage: Page;
};

const ALL_ROLES = [
  { id: 'role-pre-sales-manager', name: 'Pre-Sales Manager', code: 'PRE_SALES_MANAGER' },
  { id: 'role-sales-executive', name: 'Sales Executive', code: 'SALES_EXECUTIVE' },
  { id: 'role-sales-manager', name: 'Sales Manager', code: 'SALES_MANAGER' },
  { id: 'role-sourcing-manager', name: 'Sourcing Manager', code: 'SOURCING_MANAGER' },
  { id: 'role-admin', name: 'Admin', code: 'ADMIN' },
  { id: 'role-marketing', name: 'Marketing', code: 'MARKETING' },
];

const MOCK_LEAD_DETAIL = {
  id: 'lead-1',
  firstName: 'Aarav',
  lastName: 'Sharma',
  name: 'Aarav Sharma',
  phone: '+919876543210',
  email: 'aarav.sharma@example.com',
  status: 'NEW',
  score: 85,
  temperature: 'HOT',
  budget: '15000000',
  project: 'Grand Horizon Towers',
  projectName: 'Grand Horizon Towers',
  createdAt: '2026-09-01T00:00:00.000Z',
  assignedUser: { id: 'usr-1', name: 'Sales Executive' },
  notes: [],
  schedules: [],
  callLogs: [],
};

const MOCK_LEADS_LIST = [
  MOCK_LEAD_DETAIL,
  {
    id: 'lead-2',
    firstName: 'Priya',
    lastName: 'Patel',
    name: 'Priya Patel',
    phone: '+919876543211',
    email: 'priya.patel@example.com',
    status: 'CONTACTED',
    score: 72,
    temperature: 'WARM',
    budget: '20000000',
    project: 'Grand Horizon Towers',
    projectName: 'Grand Horizon Towers',
    createdAt: '2026-09-02T00:00:00.000Z',
    assignedUser: { id: 'usr-1', name: 'Sales Executive' },
    notes: [],
    schedules: [],
    callLogs: [],
  },
];

export async function setupMockRoutes(page: Page, context: BrowserContext, userKey: keyof typeof TEST_USERS) {
  const user = TEST_USERS[userKey];
  const roleCode = (user as any).roleCode || userKey;
  const roleId = 'role-' + roleCode.toLowerCase().replace(/_/g, '-');

  // Set session cookie to satisfy Next.js middleware
  await context.addCookies([
    {
      name: 'better-auth.session_token',
      value: 'mock-token-for-e2e',
      domain: 'localhost',
      path: '/',
    },
  ]);

  const handleApiRequest = async (route: any) => {
    const url = route.request().url();

    // 1. Roles list endpoint
    if (url.includes('roles')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(ALL_ROLES),
      });
    }

    // 2. Better Auth get-session endpoint
    if (url.includes('get-session')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'mock-user-id',
            name: user.roleName,
            email: user.email,
            roleId,
            role: roleCode,
          },
          session: {
            id: 'mock-session-id',
            userId: 'mock-user-id',
            expiresAt: '2035-01-01T00:00:00.000Z',
          },
        }),
      });
    }

    // 3. Better Auth sign-in endpoint
    if (url.includes('sign-in')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            user: {
              id: 'mock-user-id',
              name: user.roleName,
              email: user.email,
              roleId,
              role: roleCode,
            },
          },
        }),
      });
    }

    // 4. Single lead detail vs Leads list
    if (url.includes('/api/leads/lead-') || url.includes('/leads/lead-')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_LEAD_DETAIL),
      });
    }

    if (url.includes('/api/leads') || url.includes('/leads')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_LEADS_LIST),
      });
    }

    // 5. Projects & Inventory endpoint
    if (url.includes('projects') || url.includes('inventory')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'proj-1',
            name: 'Grand Horizon Towers',
            builder: 'Apex Developers',
            code: 'GHT',
            isCpProject: false,
            towers: [
              { id: 'tow-1', name: 'Tower A', unitsCount: 50 },
              { id: 'tow-2', name: 'Tower B', unitsCount: 50 },
            ],
            units: 100,
          },
          {
            id: 'proj-2',
            name: 'Skyline CP Greens',
            builder: 'Skyline Realty',
            code: 'SCP',
            isCpProject: true,
            towers: [
              { id: 'tow-3', name: 'Tower C', unitsCount: 60 },
            ],
            units: 60,
          },
        ]),
      });
    }

    // 6. Commissions & Brokers endpoint
    if (url.includes('commissions') || url.includes('settlements') || url.includes('brokers')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'comm-1',
            status: 'PENDING',
            netPayable: '150000',
            paidAmount: '0',
            broker: { id: 'brk-1', name: 'Prime Channel Partners' },
            booking: {
              unit: {
                floor: {
                  tower: {
                    project: { name: 'Skyline CP Greens' },
                  },
                },
              },
            },
          },
        ]),
      });
    }

    // 7. General fallback
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  };

  // Intercept both proxy and direct routes
  await page.route('**/api/proxy/**', handleApiRequest);
  await page.route('**/roles', handleApiRequest);
  await page.route('**/api/auth/**', handleApiRequest);
}

export const test = base.extend<AuthFixtures>({
  loginAsUser: async ({ page, context }, use) => {
    const login = async (userKey: keyof typeof TEST_USERS) => {
      await setupMockRoutes(page, context, userKey);
    };

    await use(login);
  },

  authenticatedPage: async ({ page, context }, use) => {
    await setupMockRoutes(page, context, 'PRE_SALES_MANAGER');
    await use(page);
  },
});

export { expect } from '@playwright/test';
