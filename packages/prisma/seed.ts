import { prismaClient as prisma } from './src/index.js';
import { auth } from '../../apps/api/src/lib/auth.js';

// ============================================================
// SYSTEMATIC DEMO SEED — BrokerOS
// ============================================================
//
// Creates a clean, realistic, end-to-end demo environment:
//
// 👥 Users (24 total) — All password: Demo@1234
//    Brokerage: Pre-Sales Manager, 3× Pre-Sales, Sales Manager,
//               3× Sales Exec, Post-Sales Manager, 3× Post-Sales,
//               Finance, Business Manager, Director, Admin, Marketing
//    CP World:  Channel Partner, 3× Sourcing Manager, 3× Closing Manager
//
// 🏗️  Projects & Inventory
//    Brokerage (isCpProject=false): Single project "Luxury Villas" (slug: luxury-villas)
//               Assigned to Sales Manager & ALL 3 Sales Execs.
//               Full inventory (Tower A & B) with floors and units.
//    CP Exclusive (isCpProject=true): Single project "Grand Horizon CP" (slug: grand-horizon-cp)
//               Assigned to Sourcing & Closing Managers with external Brokers.
//
// 📋 Pre-Sales Leads (20 total — early funnel only)
//    Pre-Sales 1: 8  |  Pre-Sales 2: 6  |  Pre-Sales 3: 6
//    Statuses: Strictly NEW, CONTACTED, INTERESTED (no site visits scheduled)
//    Each lead includes realistic Notes, FollowUps, and ActivityTimeline events.
//
// 🏢 Sales Executive Leads (20 total — active project pipeline)
//    Sales Exec 1: 10 leads (2 scheduled visit, 3 completed visit, 2 negotiation, 3 booking)
//    Sales Exec 2: 6 leads  (1 scheduled visit, 2 completed visit, 2 negotiation, 1 booking)
//    Sales Exec 3: 4 leads  (1 scheduled visit, 2 completed visit, 0 negotiation, 1 booking)
//    Total = 20 leads, exactly 5 bookings!
//
// 📦 Bookings & Inventory Linkage (5 total)
//    Exactly 5 units reserved/sold in Luxury Villas:
//    - 4 units marked RESERVED (for active booking/document/loan/agreement stages)
//    - 1 unit marked SOLD (for completed handover)
//    - Remaining units remain AVAILABLE
//    All 5 bookings assigned to Post-Sales 1 (postsales1@demo.com).
//    Pipeline stages:
//      1× BOOKING   (Confirmed, documentation pending)
//      1× DOCUMENT  (Aadhaar & PAN verified)
//      1× LOAN      (LoanCase applied at HDFC Bank)
//      1× AGREEMENT (Draft prepared with legal counsel)
//      1× HANDOVER  (Keys handed over, meter assigned, subStatus: DONE, status: HANDOVER_COMPLETED)
//
// 🤝 CP World
//    3 external Brokers (BRK-001 Pawan Realty, BRK-002 Skyline Brokers, BRK-003 Prime Associates)
//    Recruited by Sourcing Managers 1-3, closed by Closing Managers 1-3.
//    5 CP leads, 2 CP bookings with BrokerageRecords (2% commission).
// ============================================================

const DEMO_PASSWORD = 'Demo@1234';

// ── 1. ROLES ────────────────────────────────────────────────

const ROLES = [
  { name: 'Pre-sales', code: 'PRE_SALES' },
  { name: 'Pre-sales Manager', code: 'PRE_SALES_MANAGER' },
  { name: 'Sales Executive', code: 'SALES_EXECUTIVE' },
  { name: 'Sales Manager', code: 'SALES_MANAGER' },
  { name: 'Post-sales Manager', code: 'POST_SALES_MANAGER' },
  { name: 'Post-sales', code: 'POST_SALES' },
  { name: 'Finance', code: 'FINANCE' },
  { name: 'Business Manager', code: 'BUSINESS_MANAGER' },
  { name: 'Director', code: 'DIRECTOR' },
  { name: 'Admin', code: 'ADMIN' },
  { name: 'Marketing', code: 'MARKETING' },
  { name: 'Sourcing Manager', code: 'SOURCING_MANAGER' },
  { name: 'Closing Manager', code: 'CLOSING_MANAGER' },
  { name: 'Channel Partner', code: 'CHANNEL_PARTNER' },
];

// ── 2. DEMO USERS ───────────────────────────────────────────

const DEMO_USERS = [
  // ── Brokerage World ──
  { name: 'Pre-Sales Manager', email: 'presalesmanager@demo.com', username: 'presalesmanager', phone: '9800000001', roleCode: 'PRE_SALES_MANAGER' },
  { name: 'Pre-Sales Agent 1', email: 'presales1@demo.com', username: 'presales1', phone: '9800000002', roleCode: 'PRE_SALES' },
  { name: 'Pre-Sales Agent 2', email: 'presales2@demo.com', username: 'presales2', phone: '9800000003', roleCode: 'PRE_SALES' },
  { name: 'Pre-Sales Agent 3', email: 'presales3@demo.com', username: 'presales3', phone: '9800000004', roleCode: 'PRE_SALES' },
  { name: 'Sales Manager', email: 'salesmanager@demo.com', username: 'salesmanager', phone: '9800000005', roleCode: 'SALES_MANAGER' },
  { name: 'Sales Executive 1', email: 'salesexec1@demo.com', username: 'salesexec1', phone: '9800000006', roleCode: 'SALES_EXECUTIVE' },
  { name: 'Sales Executive 2', email: 'salesexec2@demo.com', username: 'salesexec2', phone: '9800000007', roleCode: 'SALES_EXECUTIVE' },
  { name: 'Sales Executive 3', email: 'salesexec3@demo.com', username: 'salesexec3', phone: '9800000008', roleCode: 'SALES_EXECUTIVE' },
  { name: 'Post-Sales Manager', email: 'postsalesmanager@demo.com', username: 'postsalesmanager', phone: '9800000009', roleCode: 'POST_SALES_MANAGER' },
  { name: 'Post Sales 1', email: 'postsales1@demo.com', username: 'postsales1', phone: '9800000021', roleCode: 'POST_SALES' },
  { name: 'Post Sales 2', email: 'postsales2@demo.com', username: 'postsales2', phone: '9800000022', roleCode: 'POST_SALES' },
  { name: 'Post Sales 3', email: 'postsales3@demo.com', username: 'postsales3', phone: '9800000023', roleCode: 'POST_SALES' },
  { name: 'Finance', email: 'finance@demo.com', username: 'finance', phone: '9800000010', roleCode: 'FINANCE' },
  { name: 'Business Manager', email: 'businessmanager@demo.com', username: 'businessmanager', phone: '9800000011', roleCode: 'BUSINESS_MANAGER' },
  { name: 'Director', email: 'director@demo.com', username: 'director', phone: '9800000012', roleCode: 'DIRECTOR' },
  { name: 'Admin', email: 'admin@demo.com', username: 'admin', phone: '9800000013', roleCode: 'ADMIN' },
  { name: 'Marketing Manager', email: 'marketing@demo.com', username: 'marketing', phone: '9800000024', roleCode: 'MARKETING' },
  // ── CP World ──
  { name: 'Channel Partner', email: 'cp1@demo.com', username: 'cp1', phone: '9800000014', roleCode: 'CHANNEL_PARTNER' },
  { name: 'Sourcing Manager 1', email: 'sourcingmanager1@demo.com', username: 'sourcingmanager1', phone: '9800000015', roleCode: 'SOURCING_MANAGER' },
  { name: 'Sourcing Manager 2', email: 'sourcingmanager2@demo.com', username: 'sourcingmanager2', phone: '9800000016', roleCode: 'SOURCING_MANAGER' },
  { name: 'Sourcing Manager 3', email: 'sourcingmanager3@demo.com', username: 'sourcingmanager3', phone: '9800000017', roleCode: 'SOURCING_MANAGER' },
  { name: 'Closing Manager 1', email: 'closingmanager1@demo.com', username: 'closingmanager1', phone: '9800000018', roleCode: 'CLOSING_MANAGER' },
  { name: 'Closing Manager 2', email: 'closingmanager2@demo.com', username: 'closingmanager2', phone: '9800000019', roleCode: 'CLOSING_MANAGER' },
  { name: 'Closing Manager 3', email: 'closingmanager3@demo.com', username: 'closingmanager3', phone: '9800000020', roleCode: 'CLOSING_MANAGER' },
];

// ── Helper: create or find user via BetterAuth ───────────────

async function upsertUser(userData: (typeof DEMO_USERS)[0], roleId: string) {
  let user = await prisma.user.findUnique({ where: { phoneNumber: userData.phone } });
  if (!user) {
    try {
      const response = await auth.api.signUpEmail({
        body: {
          email: userData.email,
          password: DEMO_PASSWORD,
          name: userData.name,
          username: userData.username,
          phoneNumber: userData.phone,
        },
      });
      if (response?.user) {
        user = await prisma.user.findUnique({ where: { id: response.user.id } });
      }
    } catch {
      user = await prisma.user.findUnique({ where: { email: userData.email } });
    }
  }
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { roleId, email: userData.email, username: userData.username },
    });
  }
  return user;
}

// ── Helper: build inventory for a project ───────────────────

async function buildInventory(projectId: string, towerCount = 2, floorCount = 5, unitsPerFloor = 4) {
  for (let t = 1; t <= towerCount; t++) {
    const towerName = `Tower ${t === 1 ? 'A' : 'B'}`;
    let tower = await prisma.tower.findFirst({ where: { projectId, name: towerName } });
    if (!tower) {
      tower = await prisma.tower.create({
        data: { projectId, name: towerName, totalFloors: floorCount, totalUnits: floorCount * unitsPerFloor },
      });
    }
    for (let f = 1; f <= floorCount; f++) {
      let floor = await prisma.floor.findUnique({
        where: { towerId_floorNumber: { towerId: tower.id, floorNumber: f } },
      });
      if (!floor) {
        floor = await prisma.floor.create({
          data: { towerId: tower.id, floorNumber: f, totalUnits: unitsPerFloor, name: `Floor ${f}` },
        });
      }
      for (let u = 1; u <= unitsPerFloor; u++) {
        const unitNumber = `${f}${u.toString().padStart(2, '0')}`;
        const exists = await prisma.unit.findUnique({
          where: { floorId_unitNumber: { floorId: floor.id, unitNumber } },
        });
        if (!exists) {
          const isGround = f === 1;
          const unitType = isGround ? 'SHOP' : u % 2 === 0 ? 'THREE_BHK' : 'TWO_BHK';
          await prisma.unit.create({
            data: {
              floorId: floor.id,
              unitNumber,
              type: unitType as any,
              status: 'AVAILABLE',
              carpetArea: isGround ? 500 : unitType === 'THREE_BHK' ? 1200 : 900,
              basePrice: isGround ? 2500000 : unitType === 'THREE_BHK' ? 5000000 : 3800000,
              facing: u % 2 === 0 ? 'East' : 'West',
            },
          });
        }
      }
    }
    console.log(`  ✓ Inventory built for ${towerName}`);
  }
}

// ── Helper: get specific unit by tower and unit number ───────

async function getUnitByNumber(projectId: string, towerName: string, unitNumber: string) {
  return prisma.unit.findFirst({
    where: {
      unitNumber,
      floor: {
        tower: {
          projectId,
          name: towerName,
        },
      },
    },
    include: {
      floor: {
        include: {
          tower: true,
        },
      },
    },
  });
}

// ── Helper: generate unique booking number ───────────────────

let bookingSequence = 0;
function nextBookingNumber(): string {
  bookingSequence++;
  return `BK-2026-${String(bookingSequence).padStart(4, '0')}`;
}

// ============================================================
// MAIN SEED FUNCTION
// ============================================================

async function main() {
  if (process.argv.includes('--if-empty')) {
    try {
      const existingUsers = await prisma.user.count();
      if (existingUsers > 0) {
        console.log(`\n🌱 Database already populated (${existingUsers} users found). Skipping demo seed (--if-empty).\n`);
        return;
      }
    } catch {
      // If table doesn't exist yet, proceed with initial seed
    }
  }

  console.log('\n🌱 Starting BrokerOS Demo Seed...\n');

  // ── STEP 1: Roles ──────────────────────────────────────────
  console.log('📌 Step 1: Creating roles...');
  const roleMap: Record<string, string> = {};
  for (const r of ROLES) {
    const role = await prisma.role.upsert({
      where: { code: r.code },
      update: { name: r.name },
      create: { name: r.name, code: r.code },
    });
    roleMap[r.code] = role.id;
    console.log(`  ✓ Role: ${r.name}`);
  }

  // ── STEP 2: Lead Sources ───────────────────────────────────
  console.log('\n📌 Step 2: Creating lead sources...');
  const sources = [
    { name: 'Facebook Ads', type: 'FACEBOOK_ADS' },
    { name: 'Google Ads', type: 'GOOGLE_ADS' },
    { name: 'Instagram', type: 'INSTAGRAM' },
    { name: 'Referral', type: 'REFERRAL' },
    { name: 'Direct Call', type: 'DIRECT_CALL' },
    { name: 'Walk-in', type: 'WALK_IN' },
  ];
  const sourceMap: Record<string, string> = {};
  for (const s of sources) {
    const src = await prisma.leadSource.upsert({
      where: { name: s.name },
      update: {},
      create: { name: s.name, type: s.type as any },
    });
    sourceMap[s.type] = src.id;
    console.log(`  ✓ Source: ${s.name}`);
  }

  // ── STEP 3: Builder ────────────────────────────────────────
  console.log('\n📌 Step 3: Creating builder...');
  let builder = await prisma.builder.findFirst({ where: { name: 'Demo Builder' } });
  if (!builder) {
    builder = await prisma.builder.create({
      data: { name: 'Demo Builder', companyName: 'Demo Builder Corp' },
    });
  }
  console.log(`  ✓ Builder: ${builder.name}`);

  // ── STEP 4: Projects & Inventory ──────────────────────────
  // User Requirement: ONLY ONE Brokerage project, where ALL 3 sales executives work!
  // Plus 1 CP project for Channel Partner operations.
  console.log('\n📌 Step 4: Creating projects and inventory...');

  const brokerageProject = await prisma.project.upsert({
    where: { slug: 'luxury-villas' },
    update: {
      name: 'Luxury Villas',
      builderId: builder.id,
      type: 'RESIDENTIAL',
      status: 'UNDER_CONSTRUCTION',
      isCpProject: false,
      city: 'Mumbai',
      state: 'Maharashtra',
    },
    create: {
      name: 'Luxury Villas',
      slug: 'luxury-villas',
      builderId: builder.id,
      type: 'RESIDENTIAL',
      status: 'UNDER_CONSTRUCTION',
      isCpProject: false,
      city: 'Mumbai',
      state: 'Maharashtra',
      address: 'Plot 42, Palm Beach Road, Sanpada, Navi Mumbai',
      amenities: ['Clubhouse', 'Swimming Pool', 'Gymnasium', 'Kids Play Area', '24x7 Security'],
    },
  });
  console.log(`  ✓ Primary Brokerage Project: ${brokerageProject.name} (isCpProject: false)`);
  await buildInventory(brokerageProject.id);

  // CP Exclusive project
  const cpProject = await prisma.project.upsert({
    where: { slug: 'grand-horizon-cp' },
    update: {
      name: 'Grand Horizon CP',
      builderId: builder.id,
      type: 'RESIDENTIAL',
      status: 'UNDER_CONSTRUCTION',
      isCpProject: true,
      city: 'Pune',
      state: 'Maharashtra',
    },
    create: {
      name: 'Grand Horizon CP',
      slug: 'grand-horizon-cp',
      builderId: builder.id,
      type: 'RESIDENTIAL',
      status: 'UNDER_CONSTRUCTION',
      isCpProject: true,
      city: 'Pune',
      state: 'Maharashtra',
      address: 'Kharadi IT Hub, Pune',
      amenities: ['Infinity Pool', 'Coworking Lounge', 'EV Charging', 'Tennis Court'],
    },
  });
  console.log(`  ✓ CP Project: ${cpProject.name} (isCpProject: true)`);
  await buildInventory(cpProject.id);

  // ── STEP 5: Users ──────────────────────────────────────────
  console.log('\n📌 Step 5: Creating demo users...');
  const userMap: Record<string, any> = {};
  for (const u of DEMO_USERS) {
    const user = await upsertUser(u, roleMap[u.roleCode]);
    if (user) {
      userMap[u.username] = user;
      console.log(`  ✓ User: ${u.name} (${u.email})`);
    } else {
      console.warn(`  ⚠ Failed to create user: ${u.email}`);
    }
  }

  // ── STEP 6: Manager Hierarchy ──────────────────────────────
  console.log('\n📌 Step 6: Setting manager hierarchy...');

  // Pre-Sales agents → Pre-Sales Manager
  const psm = userMap['presalesmanager'];
  for (const key of ['presales1', 'presales2', 'presales3']) {
    if (userMap[key] && psm) {
      await prisma.user.update({ where: { id: userMap[key].id }, data: { managerId: psm.id } });
    }
  }
  console.log('  ✓ Pre-Sales agents linked to Pre-Sales Manager');

  // Sales Execs → Sales Manager
  const sm = userMap['salesmanager'];
  for (const key of ['salesexec1', 'salesexec2', 'salesexec3']) {
    if (userMap[key] && sm) {
      await prisma.user.update({ where: { id: userMap[key].id }, data: { managerId: sm.id } });
    }
  }
  console.log('  ✓ Sales Executives linked to Sales Manager');

  // Post-Sales agents → Post-Sales Manager
  const posm = userMap['postsalesmanager'];
  for (const key of ['postsales1', 'postsales2', 'postsales3']) {
    if (userMap[key] && posm) {
      await prisma.user.update({ where: { id: userMap[key].id }, data: { managerId: posm.id } });
    }
  }
  console.log('  ✓ Post-Sales agents linked to Post-Sales Manager');

  // CP team → Channel Partner
  const cp = userMap['cp1'];
  for (const key of [
    'sourcingmanager1',
    'sourcingmanager2',
    'sourcingmanager3',
    'closingmanager1',
    'closingmanager2',
    'closingmanager3',
  ]) {
    if (userMap[key] && cp) {
      await prisma.user.update({ where: { id: userMap[key].id }, data: { managerId: cp.id } });
    }
  }
  console.log('  ✓ CP team linked to Channel Partner');

  // ── STEP 7: Project Assignments ────────────────────────────
  // User Requirement: Sales Manager assigns ALL THREE sales executives to this ONE project
  console.log('\n📌 Step 7: Assigning users to project...');

  if (sm) {
    await prisma.projectAssignment.upsert({
      where: { projectId_userId: { projectId: brokerageProject.id, userId: sm.id } },
      update: {},
      create: { projectId: brokerageProject.id, userId: sm.id, role: 'SALES_MANAGER' },
    });
  }

  for (const seKey of ['salesexec1', 'salesexec2', 'salesexec3']) {
    const user = userMap[seKey];
    if (user) {
      await prisma.projectAssignment.upsert({
        where: { projectId_userId: { projectId: brokerageProject.id, userId: user.id } },
        update: {},
        create: { projectId: brokerageProject.id, userId: user.id, role: 'SALES_EXECUTIVE' },
      });
    }
  }
  console.log('  ✓ Sales Manager and all 3 Sales Executives assigned to Luxury Villas');

  // Sourcing & Closing Managers → Grand Horizon CP
  for (const key of ['sourcingmanager1', 'sourcingmanager2', 'sourcingmanager3']) {
    const user = userMap[key];
    if (user) {
      await prisma.projectAssignment.upsert({
        where: { projectId_userId: { projectId: cpProject.id, userId: user.id } },
        update: {},
        create: { projectId: cpProject.id, userId: user.id, role: 'SOURCING_MANAGER' },
      });
    }
  }
  for (const key of ['closingmanager1', 'closingmanager2', 'closingmanager3']) {
    const user = userMap[key];
    if (user) {
      await prisma.projectAssignment.upsert({
        where: { projectId_userId: { projectId: cpProject.id, userId: user.id } },
        update: {},
        create: { projectId: cpProject.id, userId: user.id, role: 'CLOSING_MANAGER' },
      });
    }
  }
  console.log('  ✓ CP team assigned to Grand Horizon CP');

  // Clean existing leads for a fresh deterministic seed
  console.log('\n📌 Step 8: Preparing clean state for leads...');
  let leadPhoneCounter = 9700000000;
  const nextPhone = () => String(++leadPhoneCounter);

  // ── STEP 9: Pre-Sales Leads (20 Total) ──────────────────────
  // User Requirement:
  // - Exactly 20 leads
  // - Distributed across Pre-Sales 1 (8), Pre-Sales 2 (6), Pre-Sales 3 (6)
  // - Statuses: Strictly NEW, CONTACTED, INTERESTED (no site visit scheduled)
  // - Notes and timeline activities updated for all
  console.log('\n📌 Step 9: Creating 20 Pre-Sales leads with rich notes and activities...');

  interface PreSalesLeadSpec {
    firstName: string;
    lastName: string;
    status: 'NEW' | 'CONTACTED' | 'INTERESTED';
    temperature: 'COLD' | 'WARM' | 'HOT';
    sourceType: string;
    assignedKey: string;
    budget: number;
    preferredConfig: string;
    noteContent: string;
    timelineSummary: string;
  }

  const preSalesSpecs: PreSalesLeadSpec[] = [
    // Pre-Sales 1 (8 leads)
    {
      firstName: 'Rahul',
      lastName: 'Sharma',
      status: 'NEW',
      temperature: 'COLD',
      sourceType: 'FACEBOOK_ADS',
      assignedKey: 'presales1',
      budget: 4500000,
      preferredConfig: '2 BHK',
      noteContent: 'Lead generated from FB campaign "Navi Mumbai Homes". Awaiting first call attempt.',
      timelineSummary: 'Inbound lead received via Facebook Ads.',
    },
    {
      firstName: 'Priya',
      lastName: 'Patel',
      status: 'NEW',
      temperature: 'WARM',
      sourceType: 'GOOGLE_ADS',
      assignedKey: 'presales1',
      budget: 5200000,
      preferredConfig: '3 BHK',
      noteContent: 'Search query: luxury apartments near Palm Beach Road. High intent keyword click.',
      timelineSummary: 'Inbound lead received via Google Ads search campaign.',
    },
    {
      firstName: 'Amit',
      lastName: 'Kumar',
      status: 'CONTACTED',
      temperature: 'WARM',
      sourceType: 'INSTAGRAM',
      assignedKey: 'presales1',
      budget: 4000000,
      preferredConfig: '2 BHK',
      noteContent: 'Spoke with Amit. Works in IT, looking for ready-to-move or near-possession property within 40L.',
      timelineSummary: 'First call completed. Client requested e-brochure over WhatsApp.',
    },
    {
      firstName: 'Neha',
      lastName: 'Singh',
      status: 'CONTACTED',
      temperature: 'HOT',
      sourceType: 'FACEBOOK_ADS',
      assignedKey: 'presales1',
      budget: 4800000,
      preferredConfig: '2 BHK',
      noteContent: 'Customer has approved home loan pre-sanction letter from SBI. Very responsive and polite.',
      timelineSummary: 'Discussed budget and floor preferences. Follow-up scheduled.',
    },
    {
      firstName: 'Ravi',
      lastName: 'Verma',
      status: 'INTERESTED',
      temperature: 'HOT',
      sourceType: 'WALK_IN',
      assignedKey: 'presales1',
      budget: 5500000,
      preferredConfig: '3 BHK',
      noteContent: 'Looking specifically for higher floors (Floor 4 or 5) facing East. Ready to evaluate site visits next week.',
      timelineSummary: 'Detailed qualification call. Client requested cost sheet estimate.',
    },
    {
      firstName: 'Sunita',
      lastName: 'Gupta',
      status: 'INTERESTED',
      temperature: 'WARM',
      sourceType: 'DIRECT_CALL',
      assignedKey: 'presales1',
      budget: 4200000,
      preferredConfig: '2 BHK',
      noteContent: 'Client called our toll-free number. Family wants a peaceful locality with good school connectivity.',
      timelineSummary: 'Inbound call inquiry converted to interested lead.',
    },
    {
      firstName: 'Kiran',
      lastName: 'Mehta',
      status: 'CONTACTED',
      temperature: 'WARM',
      sourceType: 'REFERRAL',
      assignedKey: 'presales1',
      budget: 5000000,
      preferredConfig: '3 BHK',
      noteContent: 'Referred by existing resident. Inquired about clubhouse amenities and parking allotment.',
      timelineSummary: 'Call done. Shared amenity catalog and master layout plan.',
    },
    {
      firstName: 'Anjali',
      lastName: 'Desai',
      status: 'NEW',
      temperature: 'COLD',
      sourceType: 'GOOGLE_ADS',
      assignedKey: 'presales1',
      budget: 3800000,
      preferredConfig: '2 BHK',
      noteContent: 'Website inquiry form submitted with evening callback request.',
      timelineSummary: 'Lead captured online. Queued for evening outbound dialer.',
    },

    // Pre-Sales 2 (6 leads)
    {
      firstName: 'Arjun',
      lastName: 'Nair',
      status: 'NEW',
      temperature: 'COLD',
      sourceType: 'FACEBOOK_ADS',
      assignedKey: 'presales2',
      budget: 4200000,
      preferredConfig: '2 BHK',
      noteContent: 'Form submission with inquiry for 2 BHK pricing and possession dates.',
      timelineSummary: 'New lead imported into CRM.',
    },
    {
      firstName: 'Deepa',
      lastName: 'Pillai',
      status: 'CONTACTED',
      temperature: 'WARM',
      sourceType: 'GOOGLE_ADS',
      assignedKey: 'presales2',
      budget: 4600000,
      preferredConfig: '2 BHK',
      noteContent: 'Spoke to Deepa. Looking for investment property with rental yield in Navi Mumbai.',
      timelineSummary: 'Connected on call. Shared rental yield analysis document.',
    },
    {
      firstName: 'Rajesh',
      lastName: 'Malhotra',
      status: 'CONTACTED',
      temperature: 'HOT',
      sourceType: 'WALK_IN',
      assignedKey: 'presales2',
      budget: 5300000,
      preferredConfig: '3 BHK',
      noteContent: 'Client currently lives in rented apartment nearby. Wants spacious living room and balcony.',
      timelineSummary: 'Call completed. Client agreed to discuss with family this weekend.',
    },
    {
      firstName: 'Pooja',
      lastName: 'Agarwal',
      status: 'INTERESTED',
      temperature: 'HOT',
      sourceType: 'REFERRAL',
      assignedKey: 'presales2',
      budget: 5100000,
      preferredConfig: '3 BHK',
      noteContent: 'Very positive conversation. Likes the sample flat photos and layout design.',
      timelineSummary: 'Qualified lead. Client requested pricing breakdown with taxes.',
    },
    {
      firstName: 'Vikram',
      lastName: 'Saxena',
      status: 'NEW',
      temperature: 'COLD',
      sourceType: 'INSTAGRAM',
      assignedKey: 'presales2',
      budget: 3900000,
      preferredConfig: '2 BHK',
      noteContent: 'Lead generated via Instagram reel showing 2 BHK interior walkthrough.',
      timelineSummary: 'Inbound lead received via social ad.',
    },
    {
      firstName: 'Meera',
      lastName: 'Joshi',
      status: 'CONTACTED',
      temperature: 'WARM',
      sourceType: 'DIRECT_CALL',
      assignedKey: 'presales2',
      budget: 4400000,
      preferredConfig: '2 BHK',
      noteContent: 'Wants to check bank loan eligibility with nationalized banks before committing.',
      timelineSummary: 'Spoke with client. Connected with in-house loan desk for pre-check.',
    },

    // Pre-Sales 3 (6 leads)
    {
      firstName: 'Sonal',
      lastName: 'Trivedi',
      status: 'NEW',
      temperature: 'COLD',
      sourceType: 'FACEBOOK_ADS',
      assignedKey: 'presales3',
      budget: 4100000,
      preferredConfig: '2 BHK',
      noteContent: 'New lead from Navi Mumbai festival ad campaign. Uncontacted.',
      timelineSummary: 'Lead ingested from ad platform webhook.',
    },
    {
      firstName: 'Manish',
      lastName: 'Shah',
      status: 'CONTACTED',
      temperature: 'WARM',
      sourceType: 'DIRECT_CALL',
      assignedKey: 'presales3',
      budget: 4700000,
      preferredConfig: '2 BHK',
      noteContent: 'Customer requested evening follow-up. Interested in East facing units only.',
      timelineSummary: 'Call connected. Notes updated with orientation preference.',
    },
    {
      firstName: 'Kavita',
      lastName: 'Bose',
      status: 'INTERESTED',
      temperature: 'HOT',
      sourceType: 'GOOGLE_ADS',
      assignedKey: 'presales3',
      budget: 5400000,
      preferredConfig: '3 BHK',
      noteContent: 'Strong interest in Luxury Villas Tower A. Client comparing with competing builder in same area.',
      timelineSummary: 'Client shows strong buying intent. Competitive pricing discussion held.',
    },
    {
      firstName: 'Abhishek',
      lastName: 'Tiwari',
      status: 'CONTACTED',
      temperature: 'WARM',
      sourceType: 'FACEBOOK_ADS',
      assignedKey: 'presales3',
      budget: 4300000,
      preferredConfig: '2 BHK',
      noteContent: 'Customer asked about construction status and RERA registration date.',
      timelineSummary: 'Shared RERA certificate and construction update video link.',
    },
    {
      firstName: 'Swati',
      lastName: 'Mishra',
      status: 'NEW',
      temperature: 'COLD',
      sourceType: 'INSTAGRAM',
      assignedKey: 'presales3',
      budget: 3700000,
      preferredConfig: '2 BHK',
      noteContent: 'Instagram lead from carousel ad. Fresh inquiry.',
      timelineSummary: 'New lead assigned to Pre-Sales Agent 3.',
    },
    {
      firstName: 'Gaurav',
      lastName: 'Pandey',
      status: 'INTERESTED',
      temperature: 'HOT',
      sourceType: 'REFERRAL',
      assignedKey: 'presales3',
      budget: 5600000,
      preferredConfig: '3 BHK',
      noteContent: 'Doctor couple looking for 3 BHK with 2 dedicated car parking slots.',
      timelineSummary: 'Call completed. High budget prospect, marked HOT.',
    },
  ];

  let psCount = 0;
  for (const spec of preSalesSpecs) {
    const assignedUser = userMap[spec.assignedKey];
    const sourceId = sourceMap[spec.sourceType];
    const phone = nextPhone();

    const lead = await prisma.lead.create({
      data: {
        firstName: spec.firstName,
        lastName: spec.lastName,
        phone,
        email: `${spec.firstName.toLowerCase()}.${spec.lastName.toLowerCase()}@example.com`,
        status: spec.status,
        subStatus: 'PENDING',
        temperature: spec.temperature,
        score: spec.temperature === 'HOT' ? 80 : spec.temperature === 'WARM' ? 50 : 25,
        sourceId,
        interestedProjectId: brokerageProject.id,
        assignedUserId: assignedUser.id,
        budget: spec.budget,
        preferredConfig: spec.preferredConfig,
        customerSummary: `${spec.preferredConfig} requirement | Budget ₹${(spec.budget / 100000).toFixed(1)}L`,
        nextFollowUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
    });

    // Create Note
    await prisma.note.create({
      data: {
        leadId: lead.id,
        userId: assignedUser.id,
        content: spec.noteContent,
        noteType: 'PRE_SALES',
        statusAtTimeOfNote: spec.status,
      },
    });

    // Create ActivityTimeline
    await prisma.activityTimeline.create({
      data: {
        leadId: lead.id,
        userId: assignedUser.id,
        type: 'NOTE_ADDED',
        title: spec.timelineSummary,
        description: spec.noteContent,
      },
    });

    // Create Follow-up(s)
    if (['CONTACTED', 'INTERESTED'].includes(spec.status)) {
      // Completed call
      await prisma.followUp.create({
        data: {
          leadId: lead.id,
          userId: assignedUser.id,
          scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          status: 'COMPLETED',
          type: 'CALL',
          remarks: 'Introduction and requirement gathering call.',
          completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          completedRemarks: 'Client connected and shared requirements.',
        },
      });
    }

    // Scheduled upcoming follow-up
    await prisma.followUp.create({
      data: {
        leadId: lead.id,
        userId: assignedUser.id,
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        status: 'SCHEDULED',
        type: 'CALL',
        remarks: 'Follow up on project brochure and floor plan feedback.',
      },
    });

    psCount++;
  }
  console.log(`  ✓ Successfully created ${psCount} Pre-Sales leads with notes, follow-ups & timelines.`);

  // ── STEP 10: Sales Executive Leads (20 Total) ───────────────
  // User Requirement:
  // - Exactly 20 leads
  // - Distributed across:
  //   Sales Executive 1: 10 leads (2 scheduled visit, 3 completed visit, 2 negotiation, 3 booking)
  //   Sales Executive 2: 6 leads  (1 scheduled visit, 2 completed visit, 2 negotiation, 1 booking)
  //   Sales Executive 3: 4 leads  (1 scheduled visit, 2 completed visit, 0 negotiation, 1 booking)
  // - All assigned to the ONE project (Luxury Villas)
  // - Exactly 5 booking leads among them!
  console.log('\n📌 Step 10: Creating 20 Sales Executive leads (10 / 6 / 4 distribution)...');

  interface SalesLeadSpec {
    firstName: string;
    lastName: string;
    status: 'SITE_VISIT_SCHEDULED' | 'SITE_VISIT_COMPLETED' | 'NEGOTIATION' | 'BOOKING' | 'DOCUMENT' | 'LOAN' | 'AGREEMENT' | 'HANDOVER';
    temperature: 'WARM' | 'HOT';
    sourceType: string;
    assignedKey: string;
    budget: number;
    preferredConfig: string;
    isBooking?: boolean;
    postSalesStage?: 'BOOKING' | 'DOCUMENT' | 'LOAN' | 'AGREEMENT' | 'HANDOVER';
    bookedUnitNumber?: string;
    visitNotes?: string;
    negotiationDetails?: {
      askingPrice: number;
      offeredPrice: number;
      discountRequested: number;
      customerObjections: string;
      notes: string;
    };
  }

  const salesSpecs: SalesLeadSpec[] = [
    // ── Sales Executive 1 (10 leads) ──
    {
      firstName: 'Nidhi',
      lastName: 'Kapoor',
      status: 'SITE_VISIT_SCHEDULED',
      temperature: 'HOT',
      sourceType: 'FACEBOOK_ADS',
      assignedKey: 'salesexec1',
      budget: 5000000,
      preferredConfig: '3 BHK',
      visitNotes: 'Site visit scheduled for upcoming Saturday at 11:00 AM. Family will accompany.',
    },
    {
      firstName: 'Rohit',
      lastName: 'Bansal',
      status: 'SITE_VISIT_SCHEDULED',
      temperature: 'WARM',
      sourceType: 'GOOGLE_ADS',
      assignedKey: 'salesexec1',
      budget: 3800000,
      preferredConfig: '2 BHK',
      visitNotes: 'Site visit confirmed for Sunday at 3:00 PM. Interested in Tower A sample flat.',
    },
    {
      firstName: 'Tanya',
      lastName: 'Chawla',
      status: 'SITE_VISIT_COMPLETED',
      temperature: 'HOT',
      sourceType: 'REFERRAL',
      assignedKey: 'salesexec1',
      budget: 4200000,
      preferredConfig: '2 BHK',
      visitNotes: 'Client visited site yesterday with spouse. Very impressed with ventilation and construction quality.',
    },
    {
      firstName: 'Ganesh',
      lastName: 'Iyer',
      status: 'SITE_VISIT_COMPLETED',
      temperature: 'WARM',
      sourceType: 'DIRECT_CALL',
      assignedKey: 'salesexec1',
      budget: 5200000,
      preferredConfig: '3 BHK',
      visitNotes: 'Site visit completed. Customer is comparing with a competitive project in Seawoods.',
    },
    {
      firstName: 'Lakshmi',
      lastName: 'Reddy',
      status: 'SITE_VISIT_COMPLETED',
      temperature: 'HOT',
      sourceType: 'WALK_IN',
      assignedKey: 'salesexec1',
      budget: 4800000,
      preferredConfig: '2 BHK',
      visitNotes: 'Visited the site and saw unit 202. Likes the balcony view.',
    },
    {
      firstName: 'Siddharth',
      lastName: 'Rao',
      status: 'NEGOTIATION',
      temperature: 'HOT',
      sourceType: 'GOOGLE_ADS',
      assignedKey: 'salesexec1',
      budget: 5000000,
      preferredConfig: '3 BHK',
      negotiationDetails: {
        askingPrice: 5000000,
        offeredPrice: 4850000,
        discountRequested: 150000,
        customerObjections: 'Client wants free covered car parking included in base price.',
        notes: 'Buyer is ready to sign token cheque if management allows 3% discount or free car parking.',
      },
    },
    {
      firstName: 'Vandana',
      lastName: 'Shah',
      status: 'NEGOTIATION',
      temperature: 'HOT',
      sourceType: 'FACEBOOK_ADS',
      assignedKey: 'salesexec1',
      budget: 3900000,
      preferredConfig: '2 BHK',
      negotiationDetails: {
        askingPrice: 3900000,
        offeredPrice: 3800000,
        discountRequested: 100000,
        customerObjections: 'Client requested waiver of club membership fee.',
        notes: 'Met at site office. Sales Manager review pending for waiver approval.',
      },
    },
    // Bookings for SE 1 (3 bookings)
    {
      firstName: 'Manoj',
      lastName: 'Khanna',
      status: 'BOOKING',
      temperature: 'HOT',
      sourceType: 'FACEBOOK_ADS',
      assignedKey: 'salesexec1',
      budget: 3800000,
      preferredConfig: '2 BHK',
      isBooking: true,
      postSalesStage: 'BOOKING',
      bookedUnitNumber: '101', // Tower A Floor 1 Unit 101
    },
    {
      firstName: 'Ritika',
      lastName: 'Sood',
      status: 'DOCUMENT',
      temperature: 'HOT',
      sourceType: 'GOOGLE_ADS',
      assignedKey: 'salesexec1',
      budget: 5000000,
      preferredConfig: '3 BHK',
      isBooking: true,
      postSalesStage: 'DOCUMENT',
      bookedUnitNumber: '102', // Tower A Floor 1 Unit 102
    },
    {
      firstName: 'Sanjay',
      lastName: 'Luthra',
      status: 'LOAN',
      temperature: 'HOT',
      sourceType: 'REFERRAL',
      assignedKey: 'salesexec1',
      budget: 5000000,
      preferredConfig: '3 BHK',
      isBooking: true,
      postSalesStage: 'LOAN',
      bookedUnitNumber: '201', // Tower A Floor 2 Unit 201
    },

    // ── Sales Executive 2 (6 leads) ──
    {
      firstName: 'Sneha',
      lastName: 'Pillai',
      status: 'SITE_VISIT_SCHEDULED',
      temperature: 'WARM',
      sourceType: 'FACEBOOK_ADS',
      assignedKey: 'salesexec2',
      budget: 4100000,
      preferredConfig: '2 BHK',
      visitNotes: 'Site visit scheduled for Monday 4:00 PM. Requested taxi pickup from station.',
    },
    {
      firstName: 'Harish',
      lastName: 'Nanda',
      status: 'SITE_VISIT_COMPLETED',
      temperature: 'HOT',
      sourceType: 'WALK_IN',
      assignedKey: 'salesexec2',
      budget: 4600000,
      preferredConfig: '2 BHK',
      visitNotes: 'Walk-in visit completed. Client spent 45 minutes examining Tower A construction progress.',
    },
    {
      firstName: 'Aisha',
      lastName: 'Shaikh',
      status: 'SITE_VISIT_COMPLETED',
      temperature: 'HOT',
      sourceType: 'REFERRAL',
      assignedKey: 'salesexec2',
      budget: 4900000,
      preferredConfig: '3 BHK',
      visitNotes: 'Second site visit completed with parents. Family strongly approved floor plan.',
    },
    {
      firstName: 'Chirag',
      lastName: 'Dave',
      status: 'NEGOTIATION',
      temperature: 'HOT',
      sourceType: 'DIRECT_CALL',
      assignedKey: 'salesexec2',
      budget: 5100000,
      preferredConfig: '3 BHK',
      negotiationDetails: {
        askingPrice: 5100000,
        offeredPrice: 4950000,
        discountRequested: 150000,
        customerObjections: 'Price slightly above local market rate per sq ft.',
        notes: 'Offered special payment milestone scheme instead of flat discount. Client is evaluating.',
      },
    },
    {
      firstName: 'Ritu',
      lastName: 'Mishra',
      status: 'NEGOTIATION',
      temperature: 'HOT',
      sourceType: 'GOOGLE_ADS',
      assignedKey: 'salesexec2',
      budget: 3900000,
      preferredConfig: '2 BHK',
      negotiationDetails: {
        askingPrice: 3900000,
        offeredPrice: 3800000,
        discountRequested: 100000,
        customerObjections: 'Competitor offering modular kitchen package.',
        notes: 'Proposed semi-furnished kitchen cabinet offer to close by month end.',
      },
    },
    // Booking for SE 2 (1 booking)
    {
      firstName: 'Tarun',
      lastName: 'Malviya',
      status: 'AGREEMENT',
      temperature: 'HOT',
      sourceType: 'GOOGLE_ADS',
      assignedKey: 'salesexec2',
      budget: 3800000,
      preferredConfig: '2 BHK',
      isBooking: true,
      postSalesStage: 'AGREEMENT',
      bookedUnitNumber: '202', // Tower A Floor 2 Unit 202
    },

    // ── Sales Executive 3 (4 leads) ──
    {
      firstName: 'Chirag',
      lastName: 'Desai',
      status: 'SITE_VISIT_SCHEDULED',
      temperature: 'WARM',
      sourceType: 'FACEBOOK_ADS',
      assignedKey: 'salesexec3',
      budget: 4200000,
      preferredConfig: '2 BHK',
      visitNotes: 'Confirmed site visit for Saturday morning.',
    },
    {
      firstName: 'Pallavi',
      lastName: 'Joshi',
      status: 'SITE_VISIT_COMPLETED',
      temperature: 'HOT',
      sourceType: 'DIRECT_CALL',
      assignedKey: 'salesexec3',
      budget: 4800000,
      preferredConfig: '3 BHK',
      visitNotes: 'Site visit completed. Showed Tower A 3 BHK show flat. Client wants to proceed to booking stage.',
    },
    {
      firstName: 'Kunal',
      lastName: 'Mehta',
      status: 'SITE_VISIT_COMPLETED',
      temperature: 'WARM',
      sourceType: 'REFERRAL',
      assignedKey: 'salesexec3',
      budget: 4000000,
      preferredConfig: '2 BHK',
      visitNotes: 'Site visit completed with architect consultant. Technical specifications approved.',
    },
    // Booking for SE 3 (1 booking)
    {
      firstName: 'Vinod',
      lastName: 'Chopra',
      status: 'HANDOVER',
      temperature: 'HOT',
      sourceType: 'DIRECT_CALL',
      assignedKey: 'salesexec3',
      budget: 5000000,
      preferredConfig: '3 BHK',
      isBooking: true,
      postSalesStage: 'HANDOVER',
      bookedUnitNumber: '301', // Tower A Floor 3 Unit 301
    },
  ];

  const createdSalesLeads: { lead: any; spec: SalesLeadSpec }[] = [];
  const bookingsQueue: { lead: any; spec: SalesLeadSpec }[] = [];

  for (const spec of salesSpecs) {
    const assignedUser = userMap[spec.assignedKey];
    const sourceId = sourceMap[spec.sourceType];
    const phone = nextPhone();

    const lead = await prisma.lead.create({
      data: {
        firstName: spec.firstName,
        lastName: spec.lastName,
        phone,
        email: `${spec.firstName.toLowerCase()}.${spec.lastName.toLowerCase()}@saleslead.com`,
        status: spec.status as any,
        subStatus: spec.isBooking && spec.postSalesStage === 'HANDOVER' ? 'DONE' : 'PENDING',
        temperature: spec.temperature,
        score: spec.temperature === 'HOT' ? 85 : 60,
        sourceId,
        interestedProjectId: brokerageProject.id,
        assignedUserId: assignedUser.id,
        budget: spec.budget,
        preferredConfig: spec.preferredConfig,
        customerSummary: `${spec.preferredConfig} for Luxury Villas | Budget ₹${(spec.budget / 100000).toFixed(1)}L`,
      },
    });

    createdSalesLeads.push({ lead, spec });

    // Handle Site Visits for non-booking leads
    if (spec.status === 'SITE_VISIT_SCHEDULED') {
      await prisma.siteVisit.create({
        data: {
          leadId: lead.id,
          projectId: brokerageProject.id,
          salesExecId: assignedUser.id,
          createdById: assignedUser.id,
          scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          status: 'SCHEDULED',
          interestLevel: spec.temperature === 'HOT' ? 'HIGH' : 'MEDIUM',
          meetingNotes: spec.visitNotes,
        },
      });

      await prisma.note.create({
        data: {
          leadId: lead.id,
          userId: assignedUser.id,
          content: spec.visitNotes || 'Site visit scheduled.',
          noteType: 'SITE_VISIT',
          statusAtTimeOfNote: 'SITE_VISIT_SCHEDULED',
        },
      });

      await prisma.activityTimeline.create({
        data: {
          leadId: lead.id,
          userId: assignedUser.id,
          type: 'SITE_VISIT',
          title: 'Site Visit Scheduled',
          description: spec.visitNotes,
        },
      });
    } else if (spec.status === 'SITE_VISIT_COMPLETED') {
      await prisma.siteVisit.create({
        data: {
          leadId: lead.id,
          projectId: brokerageProject.id,
          salesExecId: assignedUser.id,
          createdById: assignedUser.id,
          scheduledDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          actualDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          status: 'COMPLETED',
          interestLevel: spec.temperature === 'HOT' ? 'HIGH' : 'MEDIUM',
          meetingNotes: spec.visitNotes,
          completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        },
      });

      await prisma.note.create({
        data: {
          leadId: lead.id,
          userId: assignedUser.id,
          content: spec.visitNotes || 'Site visit completed successfully.',
          noteType: 'SITE_VISIT',
          statusAtTimeOfNote: 'SITE_VISIT_COMPLETED',
        },
      });

      await prisma.activityTimeline.create({
        data: {
          leadId: lead.id,
          userId: assignedUser.id,
          type: 'SITE_VISIT',
          title: 'Site Visit Completed',
          description: spec.visitNotes,
        },
      });
    } else if (spec.status === 'NEGOTIATION' && spec.negotiationDetails) {
      // Completed visit prior to negotiation
      await prisma.siteVisit.create({
        data: {
          leadId: lead.id,
          projectId: brokerageProject.id,
          salesExecId: assignedUser.id,
          createdById: assignedUser.id,
          scheduledDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          actualDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          status: 'COMPLETED',
          interestLevel: 'HIGH',
          meetingNotes: 'Customer completed site visit and initiated price discussion.',
          completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      });

      // Negotiation record
      await prisma.negotiation.create({
        data: {
          leadId: lead.id,
          salesExecId: assignedUser.id,
          askingPrice: spec.negotiationDetails.askingPrice,
          offeredPrice: spec.negotiationDetails.offeredPrice,
          discountRequested: spec.negotiationDetails.discountRequested,
          discountType: 'FLAT',
          customerObjections: spec.negotiationDetails.customerObjections,
          negotiationNotes: spec.negotiationDetails.notes,
          nextActionPlan: 'Follow up with manager for discount sanction.',
          status: 'OPEN',
        },
      });

      await prisma.note.create({
        data: {
          leadId: lead.id,
          userId: assignedUser.id,
          content: `Negotiation: Asking ₹${(spec.negotiationDetails.askingPrice / 100000).toFixed(1)}L, Offered ₹${(spec.negotiationDetails.offeredPrice / 100000).toFixed(1)}L. ${spec.negotiationDetails.notes}`,
          noteType: 'NEGOTIATION',
          statusAtTimeOfNote: 'NEGOTIATION',
        },
      });

      await prisma.activityTimeline.create({
        data: {
          leadId: lead.id,
          userId: assignedUser.id,
          type: 'NEGOTIATION',
          title: 'Price Negotiation Opened',
          description: spec.negotiationDetails.notes,
        },
      });
    }

    if (spec.isBooking) {
      bookingsQueue.push({ lead, spec });
    }
  }
  console.log(`  ✓ Created ${createdSalesLeads.length} Sales Executive leads.`);

  // ── STEP 11: The 5 Bookings, Unit Reservation & Post-Sales ──
  // User Requirement:
  // - Exactly 5 bookings
  // - Link to inventory units explicitly:
  //   - Active bookings mark unit as RESERVED (reservedAt, reservedForId)
  //   - Completed handover marks unit as SOLD (soldAt)
  // - Assigned to Post-Sales 1 (postsales1@demo.com)
  // - Stages:
  //   1. Booking: confirmed booking, documents pending
  //   2. Document: documents verified
  //   3. Loan: loan applied with HDFC Bank
  //   4. Agreement: draft prepared with legal counsel
  //   5. Handover: Handover COMPLETED (not pending!), keys given, meter assigned, unit SOLD
  console.log('\n📌 Step 11: Setting up 5 Bookings with Unit Reservations & Post-Sales pipeline...');

  const postSalesAgent = userMap['postsales1'];

  for (const { lead, spec } of bookingsQueue) {
    const salesExec = userMap[spec.assignedKey];
    const unitNumber = spec.bookedUnitNumber || '101';
    const unit = await getUnitByNumber(brokerageProject.id, 'Tower A', unitNumber);

    if (!unit) {
      console.warn(`  ⚠ Unit ${unitNumber} not found in Tower A!`);
      continue;
    }

    const stage = spec.postSalesStage || 'BOOKING';
    const isHandover = stage === 'HANDOVER';

    // 1. Update Unit status
    if (isHandover) {
      await prisma.unit.update({
        where: { id: unit.id },
        data: {
          status: 'SOLD',
          soldAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          reservedAt: null,
          reservedForId: null,
        },
      });
    } else {
      await prisma.unit.update({
        where: { id: unit.id },
        data: {
          status: 'RESERVED',
          reservedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          reservedForId: salesExec.id,
        },
      });
    }

    // 2. Link Unit to Lead
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        interestedUnitId: unit.id,
        assignedUserId: postSalesAgent?.id || salesExec.id, // Transferred to Post-Sales Agent
        subStatus: isHandover ? 'DONE' : 'PENDING',
      },
    });

    // 3. Create Customer
    const customer = await prisma.customer.create({
      data: {
        leadId: lead.id,
        firstName: lead.firstName,
        lastName: lead.lastName ?? '',
        phone: lead.phone,
        email: lead.email,
        city: 'Mumbai',
        state: 'Maharashtra',
        occupation: 'Senior Professional',
        companyName: 'Tata Consultancy Services',
      },
    });

    // 4. Create Booking
    const agreedPrice = spec.budget;
    const tokenAmount = Math.round(agreedPrice * 0.05); // 5% token
    const bookingNum = nextBookingNumber();

    let bookingStatus: any = 'CONFIRMED';
    if (stage === 'DOCUMENT') bookingStatus = 'DOCUMENTATION_PENDING';
    else if (stage === 'LOAN') bookingStatus = 'LOAN_IN_PROGRESS';
    else if (stage === 'AGREEMENT') bookingStatus = 'AGREEMENT_PENDING';
    else if (stage === 'HANDOVER') bookingStatus = 'HANDOVER_COMPLETED';

    const booking = await prisma.booking.create({
      data: {
        bookingNumber: bookingNum,
        customerId: customer.id,
        unitId: unit.id,
        source: 'DIRECT',
        salesExecId: salesExec.id,
        assignedPostSalesId: postSalesAgent?.id,
        agreedPrice,
        tokenAmount,
        totalPayable: agreedPrice,
        status: bookingStatus,
        bookingDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
    });

    // 5. Stage-specific Post-Sales records
    if (stage === 'DOCUMENT' || stage === 'LOAN' || stage === 'AGREEMENT' || stage === 'HANDOVER') {
      // Aadhaar & PAN documents
      await prisma.customerDocument.create({
        data: {
          customerId: customer.id,
          bookingId: booking.id,
          type: 'AADHAAR',
          title: 'Customer Aadhaar Card',
          fileUrl: 'https://placeholder.blob.vercel-storage.com/aadhaar-doc.pdf',
          verificationStatus: 'VERIFIED',
          verifiedById: postSalesAgent?.id,
          verifiedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        },
      });
      await prisma.customerDocument.create({
        data: {
          customerId: customer.id,
          bookingId: booking.id,
          type: 'PAN',
          title: 'Customer PAN Card',
          fileUrl: 'https://placeholder.blob.vercel-storage.com/pan-doc.pdf',
          verificationStatus: 'VERIFIED',
          verifiedById: postSalesAgent?.id,
          verifiedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        },
      });
    }

    if (stage === 'LOAN' || stage === 'AGREEMENT' || stage === 'HANDOVER') {
      await prisma.loanCase.create({
        data: {
          bookingId: booking.id,
          status: stage === 'LOAN' ? 'APPLIED' : 'DISBURSED',
          bankName: 'HDFC Bank',
          loanAmount: Math.round(agreedPrice * 0.75),
          applicationDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
          approvalDate: stage !== 'LOAN' ? new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) : undefined,
          disbursementDate: isHandover ? new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) : undefined,
        },
      });
    }

    if (stage === 'AGREEMENT' || stage === 'HANDOVER') {
      await prisma.agreement.create({
        data: {
          bookingId: booking.id,
          status: isHandover ? 'REGISTERED' : 'DRAFT_PREPARED',
          agreementNumber: `AGR-${bookingNum}`,
          draftDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
          stampDutyPaid: isHandover,
          registrationDone: isHandover,
          lawyerName: 'Adv. S. Sharma',
        },
      });
    }

    if (isHandover) {
      // User specifically requested: "that handover is not pending. That handover should be done."
      await prisma.possessionHandover.create({
        data: {
          bookingId: booking.id,
          status: 'HANDED_OVER',
          expectedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          scheduledDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          actualDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          keysHandedOver: true,
          keyHandoverDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          handoverById: postSalesAgent?.id,
          snagResolved: true,
          electricityMeterNumber: 'EL-982103',
          waterMeterNumber: 'WM-44021',
          parkingSlotNumber: 'B1-P24',
          handoverNotes: 'Keys and possession kit handed over. Customer satisfied with handover inspection.',
        },
      });
    }

    // 6. Notes & Activity Timeline
    const stageNote =
      stage === 'BOOKING'
        ? `Booking confirmed for Unit ${unit.unitNumber} (Tower A). Token paid ₹${(tokenAmount / 100000).toFixed(1)}L. Awaiting KYC documents.`
        : stage === 'DOCUMENT'
          ? `Unit ${unit.unitNumber}: KYC documents (Aadhaar & PAN) received and verified. Prepared for home loan processing.`
          : stage === 'LOAN'
            ? `Unit ${unit.unitNumber}: Loan application filed with HDFC Bank for ₹${(Math.round(agreedPrice * 0.75) / 100000).toFixed(1)}L. Banker verification in progress.`
            : stage === 'AGREEMENT'
              ? `Unit ${unit.unitNumber}: Sale agreement draft prepared by legal counsel. Appointment scheduled for stamp duty registration.`
              : `Unit ${unit.unitNumber}: Handover completed! Keys, parking slot B1-P24, and electricity meters handed over. Unit marked SOLD.`;

    await prisma.note.create({
      data: {
        leadId: lead.id,
        bookingId: booking.id,
        userId: postSalesAgent?.id || salesExec.id,
        content: stageNote,
        noteType: 'POST_SALES',
        statusAtTimeOfNote: spec.status as any,
      },
    });

    await prisma.activityTimeline.create({
      data: {
        leadId: lead.id,
        customerId: customer.id,
        userId: postSalesAgent?.id || salesExec.id,
        type: isHandover ? 'STATUS_CHANGE' : 'BOOKING',
        title: `Post-Sales Stage: ${stage}`,
        description: stageNote,
      },
    });

    // 7. Follow-up for Post-Sales
    if (postSalesAgent) {
      await prisma.followUp.create({
        data: {
          leadId: lead.id,
          customerId: customer.id,
          userId: postSalesAgent.id,
          scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          status: 'SCHEDULED',
          type: 'CALL',
          remarks: `Post-sales follow up for ${stage} milestone on Unit ${unit.unitNumber}.`,
        },
      });
    }

    console.log(
      `  ✓ Booking ${bookingNum}: ${lead.firstName} ${lead.lastName} → Unit ${unit.unitNumber} (${isHandover ? 'SOLD' : 'RESERVED'}) | Stage: ${stage}`
    );
  }

  // ── STEP 12: CP World (Brokers, Leads, Bookings) ───────────
  console.log('\n📌 Step 12: Setting up CP World (3 Brokers, 5 Leads, 2 Bookings)...');

  const sm1 = userMap['sourcingmanager1'];
  const sm2 = userMap['sourcingmanager2'];
  const sm3 = userMap['sourcingmanager3'];
  const cm1 = userMap['closingmanager1'];
  const cm2 = userMap['closingmanager2'];
  const cm3 = userMap['closingmanager3'];

  const brokerToClosingManager: Record<string, any> = {
    'BRK-001': cm1,
    'BRK-002': cm2,
    'BRK-003': cm3,
  };

  const brokerData = [
    { code: 'BRK-001', name: 'Pawan Realty', company: 'Pawan Realty Pvt Ltd', phone: '9600000001', status: 'DEAL', sourcingManager: sm1 },
    { code: 'BRK-002', name: 'Skyline Brokers', company: 'Skyline Brokers LLP', phone: '9600000002', status: 'DEAL', sourcingManager: sm2 },
    { code: 'BRK-003', name: 'Prime Associates', company: 'Prime Associates', phone: '9600000003', status: 'VISIT', sourcingManager: sm3 },
  ];

  const brokerMap: Record<string, any> = {};
  for (const b of brokerData) {
    const existing = await prisma.broker.findUnique({ where: { brokerCode: b.code } });
    if (existing) {
      brokerMap[b.code] = existing;
    } else {
      const broker = await prisma.broker.create({
        data: {
          brokerCode: b.code,
          name: b.name,
          companyName: b.company,
          phone: b.phone,
          status: b.status as any,
          sourcingManagerId: b.sourcingManager?.id,
          city: 'Pune',
          state: 'Maharashtra',
          serviceAreas: ['Pune', 'Kharadi', 'Hinjewadi'],
          experience: 6,
        },
      });
      brokerMap[b.code] = broker;
    }
    console.log(`  ✓ Broker: ${b.name} (${b.code}) recruited by ${b.sourcingManager?.name}`);
  }

  // Assign brokers to Grand Horizon CP project
  for (const [code, broker] of Object.entries(brokerMap)) {
    const assignedCm = brokerToClosingManager[code];
    await prisma.brokerProjectAssignment.upsert({
      where: { brokerId_projectId: { brokerId: broker.id, projectId: cpProject.id } },
      update: {},
      create: {
        brokerId: broker.id,
        projectId: cpProject.id,
        brokeragePercent: 2.0,
        closingManagerId: assignedCm?.id,
        isLocked: code === 'BRK-001' || code === 'BRK-002',
      },
    });
  }
  console.log('  ✓ Brokers assigned to Grand Horizon CP with 2% commission agreement');

  // CP Leads
  const cpLeadsData = [
    { firstName: 'Rajan', lastName: 'Sethi', brokerCode: 'BRK-001', status: 'NEW', temperature: 'HOT', budget: 5500000, preferredConfig: '2 BHK' },
    { firstName: 'Smita', lastName: 'Kulkarni', brokerCode: 'BRK-001', status: 'BOOKING', temperature: 'HOT', budget: 6200000, preferredConfig: '3 BHK', unitNumber: '101' },
    { firstName: 'Nilesh', lastName: 'Patil', brokerCode: 'BRK-002', status: 'LOAN', temperature: 'HOT', budget: 6500000, preferredConfig: '3 BHK', unitNumber: '102' },
    { firstName: 'Madhuri', lastName: 'Rane', brokerCode: 'BRK-002', status: 'CONTACTED', temperature: 'WARM', budget: 4800000, preferredConfig: '2 BHK' },
    { firstName: 'Sachin', lastName: 'Wagle', brokerCode: 'BRK-003', status: 'NEW', temperature: 'WARM', budget: 5200000, preferredConfig: '2 BHK' },
  ];

  for (const spec of cpLeadsData) {
    const broker = brokerMap[spec.brokerCode];
    const assignedCm = brokerToClosingManager[spec.brokerCode];
    const phone = nextPhone();

    const lead = await prisma.lead.create({
      data: {
        firstName: spec.firstName,
        lastName: spec.lastName,
        phone,
        email: `${spec.firstName.toLowerCase()}@cplead.com`,
        status: spec.status as any,
        subStatus: ['BOOKING', 'LOAN'].includes(spec.status) ? 'DONE' : 'PENDING',
        temperature: spec.temperature as any,
        score: spec.temperature === 'HOT' ? 85 : 55,
        interestedProjectId: cpProject.id,
        assignedUserId: assignedCm?.id,
        brokerId: broker?.id,
        budget: spec.budget,
        preferredConfig: spec.preferredConfig,
        sourceId: sourceMap['REFERRAL'],
      },
    });

    await prisma.note.create({
      data: {
        leadId: lead.id,
        brokerId: broker?.id,
        userId: assignedCm?.id || broker.sourcingManagerId,
        content: `Lead brought by Broker ${broker.name}. Interested in Grand Horizon CP ${spec.preferredConfig}.`,
        noteType: 'GENERAL',
        statusAtTimeOfNote: spec.status as any,
      },
    });

    // Create Booking if applicable
    if (['BOOKING', 'LOAN'].includes(spec.status) && spec.unitNumber) {
      const unit = await getUnitByNumber(cpProject.id, 'Tower A', spec.unitNumber);
      if (unit) {
        await prisma.unit.update({
          where: { id: unit.id },
          data: {
            status: 'RESERVED',
            reservedAt: new Date(),
            reservedForId: assignedCm?.id,
          },
        });

        await prisma.lead.update({
          where: { id: lead.id },
          data: { interestedUnitId: unit.id },
        });

        const customer = await prisma.customer.create({
          data: {
            leadId: lead.id,
            firstName: lead.firstName,
            lastName: lead.lastName ?? '',
            phone: lead.phone,
            email: lead.email,
            city: 'Pune',
            state: 'Maharashtra',
          },
        });

        const agreedPrice = spec.budget;
        const bookingNum = nextBookingNumber();

        const booking = await prisma.booking.create({
          data: {
            bookingNumber: bookingNum,
            customerId: customer.id,
            unitId: unit.id,
            source: 'CHANNEL_PARTNER',
            closingManagerId: assignedCm?.id,
            agreedPrice,
            tokenAmount: Math.round(agreedPrice * 0.05),
            totalPayable: agreedPrice,
            status: spec.status === 'LOAN' ? 'LOAN_IN_PROGRESS' : 'CONFIRMED',
            bookingDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            commissionPercentage: 2.0,
            commissionAmount: Math.round(agreedPrice * 0.02),
          },
        });

        const brokerageAmount = Math.round(agreedPrice * 0.02);
        await prisma.brokerageRecord.create({
          data: {
            brokerId: broker.id,
            bookingId: booking.id,
            bookingValue: agreedPrice,
            brokeragePercent: 2.0,
            brokerageAmount,
            netPayable: brokerageAmount,
            status: 'PENDING',
          },
        });

        if (spec.status === 'LOAN') {
          await prisma.loanCase.create({
            data: {
              bookingId: booking.id,
              status: 'APPLIED',
              bankName: 'ICICI Bank',
              loanAmount: Math.round(agreedPrice * 0.75),
              applicationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            },
          });
        }

        console.log(
          `  ✓ CP Booking ${bookingNum}: ${lead.firstName} via ${broker.name} (CM: ${assignedCm?.name}) — Brokerage: ₹${brokerageAmount.toLocaleString()}`
        );
      }
    }
  }
  console.log(`  ✓ Created 5 CP leads with 2 CP bookings & commission records.`);

  // ── STEP 13: Clean up old non-demo projects ─────────────────
  console.log('\n📌 Step 13: Cleaning up old projects...');
  const keepProjectIds = [brokerageProject.id, cpProject.id];
  const deleted = await prisma.project.deleteMany({
    where: { id: { notIn: keepProjectIds } },
  });
  if (deleted.count > 0) {
    console.log(`  ✓ Removed ${deleted.count} legacy projects`);
  }

  // ── SUMMARY REPORT ──────────────────────────────────────────
  console.log('\n✅ Demo seed complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  BrokerOS Demo Environment — Systematic Lifecycle Complete');
  console.log('  All demo accounts password: Demo@1234');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🏗️ PROJECTS & INVENTORY:');
  console.log(`  • Brokerage Project: Luxury Villas (slug: luxury-villas) [isCpProject: false]`);
  console.log(`    → ALL 3 Sales Execs assigned here by Sales Manager.`);
  console.log(`    → Units reserved: 4 | Units sold: 1 | Remaining: AVAILABLE.`);
  console.log(`  • CP Project: Grand Horizon CP (slug: grand-horizon-cp) [isCpProject: true]`);
  console.log(`    → Assigned to 3 Sourcing Managers & 3 Closing Managers.`);
  console.log('──────────────────────────────────────────────────────────────────');
  console.log('  📞 PRE-SALES PIPELINE (20 Leads Total):');
  console.log('  • presales1@demo.com — 8 leads  (NEW, CONTACTED, INTERESTED + Notes & FollowUps)');
  console.log('  • presales2@demo.com — 6 leads  (NEW, CONTACTED, INTERESTED + Notes & FollowUps)');
  console.log('  • presales3@demo.com — 6 leads  (NEW, CONTACTED, INTERESTED + Notes & FollowUps)');
  console.log('  • presalesmanager@demo.com — Manages all 20 leads & 3 agents');
  console.log('──────────────────────────────────────────────────────────────────');
  console.log('  🏢 SALES EXECUTIVES (20 Leads Total, 5 Bookings):');
  console.log('  • salesexec1@demo.com — 10 leads (2 scheduled visits, 3 completed visits, 2 negotiations, 3 bookings)');
  console.log('  • salesexec2@demo.com — 6 leads  (1 scheduled visit, 2 completed visits, 2 negotiations, 1 booking)');
  console.log('  • salesexec3@demo.com — 4 leads  (1 scheduled visit, 2 completed visits, 0 negotiations, 1 booking)');
  console.log('  • salesmanager@demo.com — Manages sales pipeline across all 3 execs');
  console.log('──────────────────────────────────────────────────────────────────');
  console.log('  📦 POST-SALES PIPELINE (5 Direct Bookings in Luxury Villas):');
  console.log('  • postsales1@demo.com — Assigned all 5 customer bookings:');
  console.log('    1. Manoj Khanna   — Unit 101: BOOKING (Confirmed, KYC pending)');
  console.log('    2. Ritika Sood    — Unit 102: DOCUMENT (Aadhaar & PAN verified)');
  console.log('    3. Sanjay Luthra  — Unit 201: LOAN (HDFC Bank loan applied)');
  console.log('    4. Tarun Malviya  — Unit 202: AGREEMENT (Sale agreement draft ready)');
  console.log('    5. Vinod Chopra   — Unit 301: HANDOVER (Keys given, meter assigned, unit SOLD)');
  console.log('  • postsalesmanager@demo.com — Monitors full post-sales pipeline');
  console.log('──────────────────────────────────────────────────────────────────');
  console.log('  🤝 CP WORLD (Grand Horizon CP):');
  console.log('  • cp1@demo.com              — Channel Partner Head');
  console.log('  • sourcingmanager1@demo.com — Recruited BRK-001 Pawan Realty');
  console.log('  • sourcingmanager2@demo.com — Recruited BRK-002 Skyline Brokers');
  console.log('  • sourcingmanager3@demo.com — Recruited BRK-003 Prime Associates');
  console.log('  • closingmanager1@demo.com  — Closes BRK-001 leads (1 Booking: Smita Kulkarni)');
  console.log('  • closingmanager2@demo.com  — Closes BRK-002 leads (1 Loan: Nilesh Patil)');
  console.log('  • closingmanager3@demo.com  — Closes BRK-003 leads (Sachin Wagle)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
