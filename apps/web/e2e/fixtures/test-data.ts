export const TEST_USERS = {
  PRE_SALES_MANAGER: {
    email: 'presalesmanager@demo.com',
    password: 'Demo@1234',
    roleName: 'Pre-Sales Manager',
    dashboardPath: '/dashboard/pre-sales-manager',
    roleCode: 'PRE_SALES_MANAGER',
  },
  SALES_EXECUTIVE: {
    email: 'salesexec1@demo.com',
    password: 'Demo@1234',
    roleName: 'Sales Executive',
    dashboardPath: '/dashboard/sales-executive',
    roleCode: 'SALES_EXECUTIVE',
  },
  SALES_MANAGER: {
    email: 'salesmanager1@demo.com',
    password: 'Demo@1234',
    roleName: 'Sales Manager',
    dashboardPath: '/dashboard/sales-manager',
    roleCode: 'SALES_MANAGER',
  },
  SOURCING_MANAGER: {
    email: 'sourcingmanager1@demo.com',
    password: 'Demo@1234',
    roleName: 'Sourcing Manager',
    dashboardPath: '/dashboard/sourcing-manager',
    roleCode: 'SOURCING_MANAGER',
  },
  ADMIN: {
    email: 'admin@demo.com',
    password: 'Demo@1234',
    roleName: 'Admin',
    dashboardPath: '/dashboard/admin',
    roleCode: 'ADMIN',
  },
} as const;

export const TEST_LEAD = {
  firstName: 'Aarav',
  lastName: 'Sharma',
  phone: '+919876543210',
  email: 'aarav.sharma@example.com',
  source: 'Website',
  budget: '15000000',
};

export const TEST_CAMPAIGN = {
  voiceTitle: 'Skyline Festival Outbound Call',
  smsTitle: 'Flash Discount Weekend SMS',
  emailTitle: 'Exclusive Penthouse Preview Invitation',
  smsMessage: 'Special offer! Visit Grand Horizon this Saturday for exclusive 5% booking discount. Reply YES for VIP pass.',
};
