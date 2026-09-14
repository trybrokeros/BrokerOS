/**
 * ============================================================================
 * BrokerOS — Comprehensive Master Ads Seeder & Data Generator
 * ============================================================================
 * Generates 100% authentic, production-grade real estate advertising data across
 * all 4 supported channels:
 *   1. Meta (Facebook Ads) — Instant Forms, Project Pre-Launches, Traffic
 *   2. Instagram Ads — 9:16 Vertical Video Reels, Stories, Phone Mockups
 *   3. Google Ads — High-Intent Search Keywords & Quality Scores (1-10), PMax
 *   4. YouTube Ads — 4K Walkthroughs, Shorts, Video Retention Curves (25-100%)
 *
 * Links all ad campaigns to real CRM Leads, Lead Webhook Logs, and Pre-Sales
 * assigned representatives for direct verification across the web dashboard.
 *
 * Usage:
 *   pnpm run script scripts/ads/seed-ads.ts
 * ============================================================================
 */

import { prismaClient as prisma } from '@brokeros/prisma';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function seedAdsEcosystem() {
  console.log('🚀 [BrokerOS] Starting Master Ads Ecosystem Seeder...\n');

  // ──────────────────────────────────────────────────────────────────────────
  // 1. Resolve Active Users & Projects for Realistic CRM Attribution
  // ──────────────────────────────────────────────────────────────────────────
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    take: 5,
  });

  const defaultAssigneeId = users.length > 0 ? users[0].id : null;
  const secondaryAssigneeId = users.length > 1 ? users[1].id : defaultAssigneeId;

  const projects = await prisma.project.findMany({
    select: { id: true, name: true, city: true },
    take: 5,
  });

  const primaryProjectId = projects.length > 0 ? projects[0].id : null;
  const secondaryProjectId = projects.length > 1 ? projects[1].id : primaryProjectId;

  console.log(`📌 User Assignment: Using ${users.length} active users for CRM lead distribution.`);
  console.log(`📌 Project Linking: Using ${projects.length} existing project(s) in CRM.\n`);

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Ensure Lead Sources exist for Facebook & Google Ads
  // ──────────────────────────────────────────────────────────────────────────
  let fbSource = await prisma.leadSource.findFirst({ where: { type: 'FACEBOOK_ADS' } });
  if (!fbSource) {
    fbSource = await prisma.leadSource.create({
      data: {
        name: 'Facebook & Instagram Ads',
        type: 'FACEBOOK_ADS',
        isActive: true,
      },
    });
  }

  let googleSource = await prisma.leadSource.findFirst({ where: { type: 'GOOGLE_ADS' } });
  if (!googleSource) {
    googleSource = await prisma.leadSource.create({
      data: {
        name: 'Google Search & YouTube Ads',
        type: 'GOOGLE_ADS',
        isActive: true,
      },
    });
  }

  console.log('✅ Lead Sources verified: FACEBOOK_ADS and GOOGLE_ADS.\n');

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Seed Connected Ad Integrations (Meta & Google)
  // ──────────────────────────────────────────────────────────────────────────
  const META_INTEGRATION_ID = 'meta_int_godrej_dlf_2026';
  const GOOGLE_INTEGRATION_ID = 'google_int_ncr_mumbai_2026';

  const metaIntegration = await prisma.metaAdIntegration.upsert({
    where: { id: META_INTEGRATION_ID },
    create: {
      id: META_INTEGRATION_ID,
      name: 'DLF & Godrej Luxury Portfolio — Meta Business Suite',
      adAccountId: 'act_829104726190',
      accessToken: 'EAAOx89ABk3eZBAJ7d83k92h4kL910482910482910482910482910482910482910482910482910482',
      appId: '892019482910394',
      appSecret: '9f4a8b2c1d3e5f7a6b8c9d0e1f2a3b4c',
      pageIds: ['109823471629810', '109823471629811', '109823471629812'],
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      accountStatus: 1, // ACTIVE
      isActive: true,
      isDefault: true,
      lastSyncedAt: new Date(),
    },
    update: {
      name: 'DLF & Godrej Luxury Portfolio — Meta Business Suite',
      adAccountId: 'act_829104726190',
      accountStatus: 1,
      isActive: true,
      isDefault: true,
      lastSyncedAt: new Date(),
    },
  });
  console.log(`✅ Meta Ad Integration upserted: "${metaIntegration.name}" (act_829104726190)`);

  const googleIntegration = await prisma.googleAdIntegration.upsert({
    where: { id: GOOGLE_INTEGRATION_ID },
    create: {
      id: GOOGLE_INTEGRATION_ID,
      name: 'Gurgaon & Mumbai Luxury Properties — Google Ads (482-194-8291)',
      customerId: '4821948291',
      managerCustomerId: '9182736450',
      refreshToken: '1//04x98210492810482910482910482910482910482910482910482910482910482910482',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      descriptiveName: 'CyberCity & Golf Course Realty MCC',
      accountStatus: 'ENABLED',
      isActive: true,
      isDefault: true,
      lastSyncedAt: new Date(),
    },
    update: {
      name: 'Gurgaon & Mumbai Luxury Properties — Google Ads (482-194-8291)',
      customerId: '4821948291',
      accountStatus: 'ENABLED',
      isActive: true,
      isDefault: true,
      lastSyncedAt: new Date(),
    },
  });
  console.log(`✅ Google Ad Integration upserted: "${googleIntegration.name}" (CID: 482-194-8291)\n`);

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Seed Meta & Instagram Campaigns into `MetaCampaignCache`
  // ──────────────────────────────────────────────────────────────────────────
  console.log('📦 Seeding Meta (Facebook) & Instagram Campaigns...');

  const metaCampaignsData = [
    // 1. Facebook Flagship: DLF The Arbour 2
    {
      id: 'meta_camp_1202048291001',
      name: 'DLF The Arbour 2 — Sector 63 Gurgaon | 4BHK Sky Mansions Pre-Launch',
      objective: 'OUTCOME_LEADS',
      status: 'ACTIVE',
      effectiveStatus: 'ACTIVE',
      dailyBudget: 14500,
      lifetimeBudget: 450000,
      spend: 184500,
      impressions: 342000,
      reach: 198500,
      clicks: 9576,
      ctr: 2.8,
      cpc: 19.27,
      cpm: 539.47,
      leadsCount: 218,
      costPerLead: 846.33,
      adSetsData: [
        {
          id: 'as_meta_01',
          name: 'HNI Business Owners & Senior Partners (Delhi NCR)',
          status: 'ACTIVE',
          dailyBudget: 9000,
          targeting: {
            ageMin: 35,
            ageMax: 62,
            geoLocations: {
              cities: [
                { name: 'Gurgaon', radius: 35, distanceUnit: 'kilometer' },
                { name: 'New Delhi', radius: 30, distanceUnit: 'kilometer' },
                { name: 'Noida', radius: 25, distanceUnit: 'kilometer' },
              ],
            },
            interests: [
              { id: '6003139266472', name: 'Real estate' },
              { id: '6003350284687', name: 'Luxury real estate' },
              { id: '6003299871234', name: 'High-net-worth individual' },
              { id: '6003189914781', name: 'Property investment' },
            ],
          },
          insights: {
            spend: 114000,
            impressions: 212000,
            reach: 124000,
            clicks: 6148,
            ctr: 2.9,
            cpc: 18.54,
            leadsCount: 142,
            costPerLead: 802.82,
          },
        },
        {
          id: 'as_meta_02',
          name: 'Cyber City Tech CXOs & Golf Course Road Residents',
          status: 'ACTIVE',
          dailyBudget: 5500,
          targeting: {
            ageMin: 30,
            ageMax: 55,
            geoLocations: {
              cities: [{ name: 'Gurgaon', radius: 20, distanceUnit: 'kilometer' }],
            },
            interests: [
              { id: '6003987654321', name: 'Apartment' },
              { id: '6003445856782', name: 'Mortgage loans' },
              { id: '6003554433221', name: 'Villa' },
            ],
          },
          insights: {
            spend: 70500,
            impressions: 130000,
            reach: 74500,
            clicks: 3428,
            ctr: 2.64,
            cpc: 20.57,
            leadsCount: 76,
            costPerLead: 927.63,
          },
        },
      ],
      creativesData: [
        {
          id: 'cr_meta_01',
          name: '4BHK Sky Mansion Balcony Deck with Private Plunge Pool',
          title: 'Live Above the Clouds at Sector 63 Gurgaon',
          body: 'Ultra-luxury 3,950 sq.ft residences with 9+ ft wide wrap-around sun decks. Private elevator foyers, double-height living areas, and pre-launch pricing starting at ₹7.85 Cr. Download brochure & cost sheet.',
          imageUrl:
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1080&auto=format&fit=crop&q=80',
          thumbnailUrl:
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1080&auto=format&fit=crop&q=80',
          callToActionType: 'LEARN_MORE',
          previewUrl: 'https://fb.me/dlf-arbour-mansion',
        },
        {
          id: 'cr_meta_02',
          name: '1.25 Lakh Sq.Ft Clubhouse & Olympic Lagoon Render',
          title: "Gurgaon's Most Exclusive Gated Enclave by DLF",
          body: 'Surrounded by 85% lush green expanse with private squash courts, temperature-controlled indoor pool, and fine dining clubhouse. Register for VIP pre-launch access.',
          imageUrl:
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1080&auto=format&fit=crop&q=80',
          thumbnailUrl:
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1080&auto=format&fit=crop&q=80',
          callToActionType: 'GET_QUOTE',
          previewUrl: 'https://fb.me/dlf-clubhouse-tour',
        },
      ],
    },

    // 2. Facebook: Godrej Palm Retreat Sector 150
    {
      id: 'meta_camp_1202048291002',
      name: 'Godrej Palm Retreat — Sector 150 Noida | Resort-Style Low Rise Living',
      objective: 'OUTCOME_TRAFFIC',
      status: 'ACTIVE',
      effectiveStatus: 'ACTIVE',
      dailyBudget: 9000,
      lifetimeBudget: 270000,
      spend: 98400,
      impressions: 215000,
      reach: 142000,
      clicks: 7525,
      ctr: 3.5,
      cpc: 13.08,
      cpm: 457.67,
      leadsCount: 134,
      costPerLead: 734.33,
      adSetsData: [
        {
          id: 'as_meta_03',
          name: 'Noida Expressway Tech Hubs & Sector 137 Families',
          status: 'ACTIVE',
          dailyBudget: 9000,
          targeting: {
            ageMin: 28,
            ageMax: 50,
            geoLocations: {
              cities: [
                { name: 'Noida', radius: 20 },
                { name: 'Greater Noida', radius: 20 },
              ],
            },
            interests: [{ id: '6003139266472', name: 'Real estate' }],
          },
        },
      ],
      creativesData: [
        {
          id: 'cr_meta_03',
          name: 'Low Rise Tropical Enclave & Sunken Pool',
          title: 'Resort Living in Sector 150 Noida Starting at ₹1.95 Cr',
          body: 'Low density green enclave with floating cabanas and 50+ wellness amenities. Book site visit this weekend for exclusive booking benefits.',
          imageUrl:
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1080&auto=format&fit=crop&q=80',
          thumbnailUrl:
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1080&auto=format&fit=crop&q=80',
          callToActionType: 'SIGN_UP',
        },
      ],
    },

    // 3. Facebook: Oberoi Realty Mumbai Sky City
    {
      id: 'meta_camp_1202048291003',
      name: 'Oberoi Realty Sky City — Borivali East Mumbai | Tower F Final Inventory',
      objective: 'OUTCOME_SALES',
      status: 'PAUSED',
      effectiveStatus: 'PAUSED',
      dailyBudget: 16000,
      lifetimeBudget: 480000,
      spend: 245000,
      impressions: 420000,
      reach: 260000,
      clicks: 11340,
      ctr: 2.7,
      cpc: 21.6,
      cpm: 583.33,
      leadsCount: 295,
      costPerLead: 830.51,
      adSetsData: [
        {
          id: 'as_meta_04',
          name: 'Western Suburbs Luxury Upgraders (Bandra to Borivali)',
          status: 'PAUSED',
          dailyBudget: 16000,
          targeting: {
            ageMin: 32,
            ageMax: 60,
            geoLocations: { cities: [{ name: 'Mumbai', radius: 25 }] },
          },
        },
      ],
      creativesData: [
        {
          id: 'cr_meta_04',
          name: 'Tower F Sample Flat Living Room',
          title: 'Ready Possession 3 & 4 BHK Luxury Residences in Borivali',
          body: 'Overlooking SGNP national park. Expansive master suites with high-grade fixtures. Last few premium park-view units remaining.',
          imageUrl:
            'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1080&auto=format&fit=crop&q=80',
          callToActionType: 'GET_QUOTE',
        },
      ],
    },

    // 4. Instagram Flagship: Sobha Neopolis Greek Architecture Walkthrough
    {
      id: 'meta_camp_1202048291004',
      name: 'Sobha Neopolis — Panathur Bangalore | Greek Architecture Luxury Walkthrough',
      objective: 'OUTCOME_LEADS',
      status: 'ACTIVE',
      effectiveStatus: 'ACTIVE',
      dailyBudget: 11000,
      lifetimeBudget: 330000,
      spend: 142000,
      impressions: 284000,
      reach: 196000,
      clicks: 10792,
      ctr: 3.8,
      cpc: 13.16,
      cpm: 500.0,
      leadsCount: 204,
      costPerLead: 696.08,
      adSetsData: [
        {
          id: 'as_ig_01',
          name: 'Bangalore Tech Founders & ORR Corridor Executives',
          status: 'ACTIVE',
          dailyBudget: 11000,
          targeting: {
            ageMin: 28,
            ageMax: 52,
            geoLocations: { cities: [{ name: 'Bengaluru', radius: 30 }] },
            instagram_positions: ['reels', 'story', 'stream', 'feed', 'explore'],
            interests: [
              { id: '6003139266472', name: 'Real estate' },
              { id: '6003554433221', name: 'Villa' },
            ],
          },
        },
      ],
      creativesData: [
        {
          id: 'ig_cr_sobha_01',
          name: '3 BHK Greek Classical Walkthrough (1,850 sq.ft)',
          title: "Step Inside Bangalore's Finest Greek-Themed Enclave",
          body: 'Imported Italian marble, handcrafted Roman pillars, and high ceilings. Situated 10 mins from Marathahalli & Bellandur tech corridor. Tap to schedule private on-site inspection.',
          imageUrl:
            'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1080&auto=format&fit=crop&q=80',
          thumbnailUrl:
            'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1080&auto=format&fit=crop&q=80',
          aspectRatio: '9:16',
          mediaType: 'VIDEO',
          callToActionType: 'BOOK_NOW',
          instagramActorHandle: 'sobha_neopolis_bangalore',
          instagramPermalinkUrl: 'https://instagram.com/p/C9x8109Neopolis',
        },
        {
          id: 'ig_cr_sobha_02',
          name: 'Special 10:90 Pre-Launch NRI Payment Plan',
          title: 'Exclusive Pre-Launch Price Sheet Available',
          body: 'Pay only 10% on booking and rest on possession. Zero pre-EMI interest till Dec 2027. Instant brochure download.',
          imageUrl:
            'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1080&auto=format&fit=crop&q=80',
          thumbnailUrl:
            'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1080&auto=format&fit=crop&q=80',
          aspectRatio: '9:16',
          mediaType: 'VIDEO',
          callToActionType: 'GET_QUOTE',
          instagramActorHandle: 'sobha_neopolis_bangalore',
        },
        {
          id: 'ig_cr_sobha_03',
          name: 'Master Suite with Panoramic Skyline View',
          title: 'Master Bedroom Suite with Panoramic Balcony',
          body: 'Wake up to serene garden views. Designed with walk-in wardrobe and double vanity master bath.',
          imageUrl:
            'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1080&auto=format&fit=crop&q=80',
          thumbnailUrl:
            'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1080&auto=format&fit=crop&q=80',
          aspectRatio: '1:1',
          mediaType: 'IMAGE',
          callToActionType: 'LEARN_MORE',
          instagramActorHandle: 'sobha_neopolis_bangalore',
        },
      ],
    },

    // 5. Instagram: Prestige Ocean Pearl Kochi Marine Drive
    {
      id: 'meta_camp_1202048291005',
      name: 'Prestige Ocean Pearl — Marine Drive Kochi | Waterfront Penthouses & Sunset Reels',
      objective: 'OUTCOME_ENGAGEMENT',
      status: 'ACTIVE',
      effectiveStatus: 'ACTIVE',
      dailyBudget: 8500,
      lifetimeBudget: 255000,
      spend: 86250,
      impressions: 178000,
      reach: 121000,
      clicks: 6942,
      ctr: 3.9,
      cpc: 12.42,
      cpm: 484.55,
      leadsCount: 112,
      costPerLead: 770.09,
      adSetsData: [
        {
          id: 'as_ig_02',
          name: 'NRI Gulf Malayalees & Kochi HNI Business Owners',
          status: 'ACTIVE',
          dailyBudget: 8500,
          targeting: {
            ageMin: 32,
            ageMax: 65,
            geoLocations: {
              countries: ['IN', 'AE', 'QA', 'SA'],
              cities: [{ name: 'Kochi', radius: 40 }],
            },
            instagram_positions: ['reels', 'story'],
          },
        },
      ],
      creativesData: [
        {
          id: 'ig_cr_prestige_01',
          name: 'Drone Sunset Flight over Marine Drive Penthouses',
          title: 'Kochi Waterfront Living by Prestige Group',
          body: 'Unobstructed Arabian Sea views. Private boat jetty access, infinity rooftop pool, and 4BHK duplex penthouses starting ₹4.25 Cr.',
          imageUrl:
            'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1080&auto=format&fit=crop&q=80',
          aspectRatio: '9:16',
          mediaType: 'VIDEO',
          callToActionType: 'WATCH_MORE',
          instagramActorHandle: 'prestige_oceanpearl_kochi',
        },
      ],
    },
  ];

  for (const c of metaCampaignsData) {
    await prisma.metaCampaignCache.upsert({
      where: { id: c.id },
      create: {
        id: c.id,
        integrationId: META_INTEGRATION_ID,
        name: c.name,
        objective: c.objective,
        status: c.status,
        effectiveStatus: c.effectiveStatus,
        dailyBudget: c.dailyBudget,
        lifetimeBudget: c.lifetimeBudget,
        spend: c.spend,
        impressions: c.impressions,
        reach: c.reach,
        clicks: c.clicks,
        ctr: c.ctr,
        cpc: c.cpc,
        cpm: c.cpm,
        leadsCount: c.leadsCount,
        costPerLead: c.costPerLead,
        adSetsData: c.adSetsData,
        creativesData: c.creativesData,
        startTime: new Date(Date.now() - 30 * 86400000),
        lastSyncedAt: new Date(),
      },
      update: {
        name: c.name,
        objective: c.objective,
        status: c.status,
        effectiveStatus: c.effectiveStatus,
        dailyBudget: c.dailyBudget,
        lifetimeBudget: c.lifetimeBudget,
        spend: c.spend,
        impressions: c.impressions,
        reach: c.reach,
        clicks: c.clicks,
        ctr: c.ctr,
        cpc: c.cpc,
        cpm: c.cpm,
        leadsCount: c.leadsCount,
        costPerLead: c.costPerLead,
        adSetsData: c.adSetsData,
        creativesData: c.creativesData,
        lastSyncedAt: new Date(),
      },
    });
    console.log(`  └─ Meta Campaign cached: "${c.name.slice(0, 50)}..." [₹${c.spend.toLocaleString('en-IN')}]`);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Seed Google Ads & YouTube Campaigns into `GoogleCampaignCache`
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n📦 Seeding Google (Search & PMax) & YouTube Campaigns...');

  const googleCampaignsData = [
    // 1. Google High-Intent Search: Gurgaon Flats & Penthouses
    {
      id: 'google_camp_24216532001',
      name: 'Google Search — High-Intent Luxury Flats & Penthouses Gurgaon',
      advertisingChannelType: 'SEARCH',
      status: 'ENABLED',
      dailyBudget: 18000,
      spend: 284000,
      impressions: 58200,
      clicks: 3724,
      ctr: 6.4,
      cpc: 76.26,
      conversions: 348,
      costPerConversion: 816.09,
      adGroupsData: [
        {
          id: 'ag_g_01',
          name: '3BHK & 4BHK Luxury Flats Golf Course Road',
          status: 'ENABLED',
          cpcBid: 85.0,
          metrics: { spend: 142000, clicks: 1862, conversions: 182 },
        },
        {
          id: 'ag_g_02',
          name: 'DLF Camellias & Magnolias Luxury Resale',
          status: 'ENABLED',
          cpcBid: 95.0,
          metrics: { spend: 89000, clicks: 1167, conversions: 104 },
        },
        {
          id: 'ag_g_03',
          name: 'Gated Luxury Villas Near Cyber City',
          status: 'ENABLED',
          cpcBid: 70.0,
          metrics: { spend: 53000, clicks: 695, conversions: 62 },
        },
      ],
      searchKeywordsData: [
        {
          text: 'luxury flats for sale in gurgaon',
          matchType: 'EXACT',
          qualityScore: 10,
          impressions: 14500,
          clicks: 1087,
          cpc: 72.5,
          cost: 78807.5,
          status: 'ENABLED',
        },
        {
          text: '3 bhk apartment in gurgaon golf course',
          matchType: 'EXACT',
          qualityScore: 9,
          impressions: 11200,
          clicks: 784,
          cpc: 79.1,
          cost: 62014.4,
          status: 'ENABLED',
        },
        {
          text: 'dlf the camellias resale price',
          matchType: 'PHRASE',
          qualityScore: 9,
          impressions: 8900,
          clicks: 623,
          cpc: 84.2,
          cost: 52456.6,
          status: 'ENABLED',
        },
        {
          text: 'villas near golf course extension road',
          matchType: 'PHRASE',
          qualityScore: 8,
          impressions: 9400,
          clicks: 564,
          cpc: 71.8,
          cost: 40495.2,
          status: 'ENABLED',
        },
        {
          text: 'buy luxury property nri gurgaon',
          matchType: 'BROAD',
          qualityScore: 8,
          impressions: 7800,
          clicks: 429,
          cpc: 68.4,
          cost: 29343.6,
          status: 'ENABLED',
        },
        {
          text: 'new residential projects launch 2026',
          matchType: 'PHRASE',
          qualityScore: 7,
          impressions: 6400,
          clicks: 237,
          cpc: 88.1,
          cost: 20879.7,
          status: 'ENABLED',
        },
      ],
    },

    // 2. Google Performance Max: Omnichannel AI
    {
      id: 'google_camp_24216532002',
      name: 'Google PMax — Omnichannel AI Luxury Properties NCR',
      advertisingChannelType: 'PERFORMANCE_MAX',
      status: 'ENABLED',
      dailyBudget: 14000,
      spend: 196000,
      impressions: 168000,
      clicks: 7896,
      ctr: 4.7,
      cpc: 24.82,
      conversions: 286,
      costPerConversion: 685.31,
      adGroupsData: [
        {
          id: 'ag_pmax_01',
          name: 'CyberCity Corporate Leaders & Luxury Affinity Audiences',
          status: 'ENABLED',
        },
      ],
      searchKeywordsData: [
        {
          text: 'best luxury real estate investment nri',
          matchType: 'BROAD',
          qualityScore: 9,
          impressions: 32000,
          clicks: 1840,
          cpc: 26.5,
          cost: 48760.0,
          status: 'ENABLED',
        },
        {
          text: 'top residential builders gurgaon dlf godrej',
          matchType: 'PHRASE',
          qualityScore: 8,
          impressions: 24000,
          clicks: 1210,
          cpc: 28.2,
          cost: 34122.0,
          status: 'ENABLED',
        },
      ],
    },

    // 3. YouTube Video: 4K Ultra-Luxury Penthouse Virtual Walkthrough
    {
      id: 'google_camp_24216532003',
      name: 'YouTube Video Tour — 4K Ultra-Luxury Penthouse Virtual Walkthrough | DLF Arbour',
      advertisingChannelType: 'VIDEO',
      status: 'ENABLED',
      dailyBudget: 12500,
      spend: 165000,
      impressions: 490000,
      clicks: 14700, // Views derived: clicks * 3 = 44,100 (32.4% view rate, CPV: ₹0.48)
      ctr: 3.0,
      cpc: 11.22,
      conversions: 192,
      costPerConversion: 859.38,
      adGroupsData: [
        {
          id: 'ag_yt_01',
          name: 'YouTube Skippable In-Stream (Affinity: Architectural Digest & Luxury Homes)',
          status: 'ENABLED',
        },
      ],
    },

    // 4. YouTube Shorts: 15-Sec Luxury Clubhouse & Sky Lounge Teaser
    {
      id: 'google_camp_24216532004',
      name: 'YouTube Shorts — 15-Sec Luxury Clubhouse & Sky Lounge Teaser (Vertical)',
      advertisingChannelType: 'VIDEO',
      status: 'ENABLED',
      dailyBudget: 7500,
      spend: 84000,
      impressions: 310000,
      clicks: 9610, // Views: 28,830, CPV: ₹0.38
      ctr: 3.1,
      cpc: 8.74,
      conversions: 118,
      costPerConversion: 711.86,
      adGroupsData: [
        {
          id: 'ag_yt_02',
          name: 'YouTube Shorts Vertical Feed (Placements: Mobile Only)',
          status: 'ENABLED',
        },
      ],
    },

    // 5. YouTube In-Feed: Live Construction Milestone & Sample Flat Unveiling
    {
      id: 'google_camp_24216532005',
      name: 'YouTube In-Feed Discovery — Sample Flat Unveiling & Construction Update',
      advertisingChannelType: 'VIDEO',
      status: 'ENABLED',
      dailyBudget: 6500,
      spend: 71500,
      impressions: 185000,
      clicks: 5920,
      ctr: 3.2,
      cpc: 12.08,
      conversions: 94,
      costPerConversion: 760.64,
      adGroupsData: [
        {
          id: 'ag_yt_03',
          name: 'YouTube In-Feed Search & Related Videos Placement',
          status: 'ENABLED',
        },
      ],
    },
  ];

  for (const c of googleCampaignsData) {
    await prisma.googleCampaignCache.upsert({
      where: { id: c.id },
      create: {
        id: c.id,
        integrationId: GOOGLE_INTEGRATION_ID,
        name: c.name,
        advertisingChannelType: c.advertisingChannelType,
        status: c.status,
        dailyBudget: c.dailyBudget,
        spend: c.spend,
        impressions: c.impressions,
        clicks: c.clicks,
        ctr: c.ctr,
        cpc: c.cpc,
        conversions: c.conversions,
        costPerConversion: c.costPerConversion,
        adGroupsData: c.adGroupsData,
        searchKeywordsData: c.searchKeywordsData,
        startTime: new Date(Date.now() - 30 * 86400000),
        lastSyncedAt: new Date(),
      },
      update: {
        name: c.name,
        advertisingChannelType: c.advertisingChannelType,
        status: c.status,
        dailyBudget: c.dailyBudget,
        spend: c.spend,
        impressions: c.impressions,
        clicks: c.clicks,
        ctr: c.ctr,
        cpc: c.cpc,
        conversions: c.conversions,
        costPerConversion: c.costPerConversion,
        adGroupsData: c.adGroupsData,
        searchKeywordsData: c.searchKeywordsData,
        lastSyncedAt: new Date(),
      },
    });
    console.log(`  └─ Google/YouTube Campaign cached: "${c.name.slice(0, 50)}..." [₹${c.spend.toLocaleString('en-IN')}]`);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 6. Seed Realistic High-Value CRM Leads & Webhook Logs
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n👥 Generating Realistic Real Estate Leads & Inbound Webhook Logs...');

  const sampleLeadsData = [
    // Meta/Facebook Leads
    {
      platform: 'META',
      campaignId: 'meta_camp_1202048291001',
      formId: 'form_meta_arbour_01',
      adId: 'ad_meta_mansion_01',
      firstName: 'Vikramaditya',
      lastName: 'Singhania',
      phone: '+919810123456',
      email: 'v.singhania@apexholding.in',
      preferredLocation: 'Golf Course Extension Road, Gurgaon',
      budget: 85000000, // ₹8.5 Cr
      status: 'NEW',
      temperature: 'HOT',
      summary: 'Generated via Meta Instant Lead Form on DLF The Arbour 2. Inquired for 4BHK Sky Mansion. Requested Saturday 4 PM site visit with family.',
      fieldData: {
        configuration: '4BHK Sky Mansion (3,950 sq.ft)',
        budget_range: '₹8 Cr - ₹12 Cr',
        possession_requirement: 'Within 2 Years',
        funding_mode: 'Self Funded',
        current_residence: 'DLF Phase 1, Gurgaon',
      },
      projectId: primaryProjectId,
      assignedUserId: defaultAssigneeId,
    },
    {
      platform: 'META',
      campaignId: 'meta_camp_1202048291001',
      formId: 'form_meta_arbour_01',
      adId: 'ad_meta_mansion_02',
      firstName: 'Harshavardhan',
      lastName: 'Goenka',
      phone: '+919717054321',
      email: 'hgoenka@investcorp.ae',
      preferredLocation: 'DLF Phase 5 / Sector 63, Gurgaon',
      budget: 120000000, // ₹12 Cr
      status: 'CONTACTED',
      temperature: 'HOT',
      summary: 'NRI Dubai investor via Meta Lead Form. Looking to buy penthouse in DLF The Arbour for capital appreciation. Prefers high-floor park facing.',
      fieldData: {
        configuration: 'Duplex Penthouse / Top Floor',
        budget_range: 'Above ₹10 Cr',
        possession_requirement: 'Pre-Launch Investment',
        investor_type: 'NRI (UAE)',
      },
      projectId: primaryProjectId,
      assignedUserId: secondaryAssigneeId,
    },
    {
      platform: 'META',
      campaignId: 'meta_camp_1202048291002',
      formId: 'form_godrej_retreat_01',
      adId: 'ad_godrej_lowrise_01',
      firstName: 'Pooja',
      lastName: 'Kashyap',
      phone: '+919899045678',
      email: 'pooja.kashyap@indiatoday.in',
      preferredLocation: 'Sector 150, Noida',
      budget: 22000000, // ₹2.2 Cr
      status: 'SITE_VISIT_SCHEDULED',
      temperature: 'HOT',
      summary: 'Senior Editor looking for low-rise resort residence at Godrej Palm Retreat. Site visit scheduled for Sunday at 11:30 AM.',
      fieldData: {
        configuration: '3 BHK Resort Apartment',
        budget_range: '₹2 Cr - ₹2.5 Cr',
        possession_requirement: 'Ready / Near Possession',
      },
      projectId: secondaryProjectId,
      assignedUserId: defaultAssigneeId,
    },
    {
      platform: 'META',
      campaignId: 'meta_camp_1202048291003',
      formId: 'form_oberoi_skycity_01',
      adId: 'ad_oberoi_tower_f',
      firstName: 'Siddharth',
      lastName: 'Kirloskar',
      phone: '+919822067890',
      email: 'sid.kirloskar@autotech.in',
      preferredLocation: 'Borivali East, Mumbai',
      budget: 58000000, // ₹5.8 Cr
      status: 'NEW',
      temperature: 'HOT',
      summary: 'Automotive industrialist seeking park-facing 4BHK in Oberoi Sky City Tower F. Pre-approved home loan from HDFC Bank.',
      fieldData: {
        configuration: '4 BHK Luxury (2,400 sq.ft)',
        budget_range: '₹5 Cr - ₹6.5 Cr',
        bank_pre_approval: 'Yes (HDFC Bank ₹4 Cr)',
      },
      projectId: primaryProjectId,
      assignedUserId: secondaryAssigneeId,
    },

    // Instagram Leads
    {
      platform: 'INSTAGRAM',
      campaignId: 'meta_camp_1202048291004',
      formId: 'form_sobha_neopolis_ig',
      adId: 'ad_sobha_reel_01',
      firstName: 'Ananya',
      lastName: 'Deshmukh',
      phone: '+919820087654',
      email: 'ananya.deshmukh@mckinsey.com',
      preferredLocation: 'Panathur / Marathahalli, Bangalore',
      budget: 34000000, // ₹3.4 Cr
      status: 'NEW',
      temperature: 'HOT',
      summary: 'Engagement Manager at McKinsey via Instagram 9:16 Greek Walkthrough Reel. Interested in 3 BHK Greek luxury unit. Requested call after 7 PM.',
      fieldData: {
        configuration: '3 BHK Classical (1,850 sq.ft)',
        budget_range: '₹3 Cr - ₹3.8 Cr',
        preferred_contact_time: 'After 7:00 PM',
        source_ad_type: 'Instagram Reel (9:16)',
      },
      projectId: secondaryProjectId,
      assignedUserId: defaultAssigneeId,
    },
    {
      platform: 'INSTAGRAM',
      campaignId: 'meta_camp_1202048291004',
      formId: 'form_sobha_neopolis_ig',
      adId: 'ad_sobha_story_01',
      firstName: 'Kavita',
      lastName: 'Nambiar',
      phone: '+919847056789',
      email: 'kavita.n@accenture.com',
      preferredLocation: 'Bellandur / Panathur, Bangalore',
      budget: 28000000, // ₹2.8 Cr
      status: 'CONTACTED',
      temperature: 'WARM',
      summary: 'Tech Director via Instagram Story 10:90 Payment Plan ad. Inquired about pre-launch booking window and floor plan layouts.',
      fieldData: {
        configuration: '2.5 BHK Luxury',
        budget_range: '₹2.5 Cr - ₹3.0 Cr',
        scheme_interest: '10:90 Pre-Launch Plan',
      },
      projectId: secondaryProjectId,
      assignedUserId: secondaryAssigneeId,
    },
    {
      platform: 'INSTAGRAM',
      campaignId: 'meta_camp_1202048291005',
      formId: 'form_prestige_ocean_ig',
      adId: 'ad_prestige_sunset_reel',
      firstName: 'Dr. Arvind',
      lastName: 'Swaminathan',
      phone: '+919840034567',
      email: 'dr.arvind@apollohospitals.org',
      preferredLocation: 'Marine Drive, Kochi',
      budget: 45000000, // ₹4.5 Cr
      status: 'NEW',
      temperature: 'HOT',
      summary: 'Senior Cardiac Surgeon via Instagram Sunset Drone Reel. Wants waterfront duplex with sea view for holiday home and retirement.',
      fieldData: {
        configuration: '4 BHK Waterfront Duplex',
        budget_range: '₹4 Cr - ₹5 Cr',
        profession: 'Doctor / Surgeon',
      },
      projectId: primaryProjectId,
      assignedUserId: defaultAssigneeId,
    },

    // Google Search Leads
    {
      platform: 'GOOGLE',
      campaignId: 'google_camp_24216532001',
      formId: 'form_google_search_gurgaon',
      adId: 'ad_g_search_3bhk',
      gclid: 'CjwKCAiA-2a7BhBEEiwA9v6-HEq8x910482DLF_Golf_Course_Luxury_2026',
      firstName: 'Meenakshi',
      lastName: 'Sundaram',
      phone: '+919811199887',
      email: 'm.sundaram@deloitte.com',
      preferredLocation: 'Golf Course Road, Gurgaon',
      budget: 48000000, // ₹4.8 Cr
      status: 'NEW',
      temperature: 'HOT',
      summary: 'Searched [3 bhk apartment in gurgaon golf course] on Google. Submitted instant lead form asset. High intent, looking to close within 30 days.',
      fieldData: {
        query_text: '3 bhk apartment in gurgaon golf course',
        intent_level: 'High Intent (Direct Search Query)',
        budget_range: '₹4.5 Cr - ₹5.5 Cr',
        possession_timeline: 'Immediate / Ready to Move',
      },
      projectId: primaryProjectId,
      assignedUserId: defaultAssigneeId,
    },
    {
      platform: 'GOOGLE',
      campaignId: 'google_camp_24216532001',
      formId: 'form_google_search_gurgaon',
      adId: 'ad_g_search_camellias',
      gclid: 'CjwKCAiA-2a7BhBEEiwA9v6-HCamellias_Resale_Enquiry_2026',
      firstName: 'Natasha',
      lastName: 'Batra',
      phone: '+919871012345',
      email: 'natasha.batra@google.com',
      preferredLocation: 'DLF The Camellias / Golf Links',
      budget: 95000000, // ₹9.5 Cr
      status: 'CONTACTED',
      temperature: 'HOT',
      summary: 'Product Director at Google. Searched [dlf the camellias resale price]. Wants ultra-luxury resale unit with golf view.',
      fieldData: {
        query_text: 'dlf the camellias resale price',
        budget_range: '₹9 Cr - ₹12 Cr',
        parking_required: '3 Covered Stalls',
      },
      projectId: primaryProjectId,
      assignedUserId: secondaryAssigneeId,
    },
    {
      platform: 'GOOGLE',
      campaignId: 'google_camp_24216532002',
      formId: 'form_google_pmax_ncr',
      adId: 'ad_pmax_cybercity',
      gclid: 'CjwKCAiA-2a7BhBEEiwA9v6-HPMax_Omnichannel_Signal_2026',
      firstName: 'Sameer',
      lastName: 'Singhal',
      phone: '+919818811224',
      email: 'sameer.singhal@hcltech.com',
      preferredLocation: 'Cyber Hub / Golf Course Extn',
      budget: 38000000, // ₹3.8 Cr
      status: 'NEW',
      temperature: 'WARM',
      summary: 'VP of Engineering at HCL. Converted via Google PMax omnichannel AI campaign across Maps & Search.',
      fieldData: {
        placement: 'Google Maps & Search PMax',
        budget_range: '₹3.5 Cr - ₹4 Cr',
      },
      projectId: primaryProjectId,
      assignedUserId: defaultAssigneeId,
    },

    // YouTube Video Tour Leads
    {
      platform: 'YOUTUBE',
      campaignId: 'google_camp_24216532003',
      formId: 'form_yt_4k_penthouse',
      adId: 'ad_yt_instream_01',
      gclid: 'CjwKCAiA-2a7BhBEEiwA9v6-HYT_4K_Penthouse_Walkthrough_2026',
      firstName: 'Rajeshwar',
      lastName: 'Rao',
      phone: '+919845011223',
      email: 'r.rao@cloudsys.io',
      preferredLocation: 'Sector 63, Gurgaon',
      budget: 78000000, // ₹7.8 Cr
      status: 'NEW',
      temperature: 'HOT',
      summary: 'Watched 100% of 4K Penthouse Walkthrough on YouTube and clicked on-screen CTA banner. Extremely high intent buyer.',
      fieldData: {
        video_retention: 'Completed 100% (Full Tour Watched)',
        video_title: '4K Ultra-Luxury Penthouse Virtual Walkthrough | DLF Arbour',
        budget_range: '₹7.5 Cr - ₹9 Cr',
      },
      projectId: primaryProjectId,
      assignedUserId: defaultAssigneeId,
    },
    {
      platform: 'YOUTUBE',
      campaignId: 'google_camp_24216532004',
      formId: 'form_yt_shorts_clubhouse',
      adId: 'ad_yt_shorts_01',
      gclid: 'CjwKCAiA-2a7BhBEEiwA9v6-HYT_Shorts_Clubhouse_Teaser_2026',
      firstName: 'Rohan',
      lastName: 'Malhotra',
      phone: '+919818833221',
      email: 'rohan.malhotra@zomato.com',
      preferredLocation: 'Sector 63 / Golf Course Extn, Gurgaon',
      budget: 65000000, // ₹6.5 Cr
      status: 'SITE_VISIT_SCHEDULED',
      temperature: 'HOT',
      summary: 'Converted through YouTube Shorts vertical ad (15-Sec Clubhouse Teaser). Site visit fixed for Saturday 3 PM.',
      fieldData: {
        format: 'YouTube Shorts (Vertical Reel)',
        budget_range: '₹6 Cr - ₹7 Cr',
      },
      projectId: primaryProjectId,
      assignedUserId: secondaryAssigneeId,
    },
    {
      platform: 'YOUTUBE',
      campaignId: 'google_camp_24216532005',
      formId: 'form_yt_infeed_sample_flat',
      adId: 'ad_yt_infeed_01',
      gclid: 'CjwKCAiA-2a7BhBEEiwA9v6-HYT_InFeed_Sample_Flat_2026',
      firstName: 'Abhishek',
      lastName: 'Biyani',
      phone: '+919830078901',
      email: 'abhishek.biyani@futuresupply.in',
      preferredLocation: 'Gurgaon / NCR',
      budget: 82000000, // ₹8.2 Cr
      status: 'NEW',
      temperature: 'HOT',
      summary: 'Watched YouTube In-Feed Sample Flat Unveiling. Requested complete video brochure and pricing structure for corner units.',
      fieldData: {
        video_format: 'YouTube In-Feed Discovery',
        budget_range: '₹8 Cr - ₹9 Cr',
      },
      projectId: primaryProjectId,
      assignedUserId: defaultAssigneeId,
    },
  ];

  let createdLeadsCount = 0;

  for (const item of sampleLeadsData) {
    const isMetaOrIg = item.platform === 'META' || item.platform === 'INSTAGRAM';
    const sourceId = isMetaOrIg ? fbSource.id : googleSource.id;

    // Create or update Lead in CRM
    let crmLead = await prisma.lead.findFirst({
      where: { phone: item.phone },
    });

    if (!crmLead) {
      crmLead = await prisma.lead.create({
        data: {
          firstName: item.firstName,
          lastName: item.lastName,
          phone: item.phone,
          email: item.email,
          preferredLocation: item.preferredLocation,
          budget: item.budget,
          status: item.status as any,
          temperature: item.temperature as any,
          customerSummary: item.summary,
          requirements: JSON.stringify(item.fieldData),
          sourceId,
          interestedProjectId: item.projectId,
          assignedUserId: item.assignedUserId,
        },
      });
    } else {
      crmLead = await prisma.lead.update({
        where: { id: crmLead.id },
        data: {
          firstName: item.firstName,
          lastName: item.lastName,
          email: item.email,
          preferredLocation: item.preferredLocation,
          budget: item.budget,
          status: item.status as any,
          temperature: item.temperature as any,
          customerSummary: item.summary,
          requirements: JSON.stringify(item.fieldData),
          sourceId,
          interestedProjectId: item.projectId,
          assignedUserId: item.assignedUserId,
        },
      });
    }

    createdLeadsCount++;

    // Create or update Lead Webhook Log linking this Lead to Campaign Cache
    if (isMetaOrIg) {
      const leadgenId = `leadgen_${crmLead.phone.replace(/\D/g, '').slice(-8)}`;
      await prisma.metaLeadWebhookLog.upsert({
        where: { id: `meta_log_${crmLead.id}` },
        create: {
          id: `meta_log_${crmLead.id}`,
          integrationId: META_INTEGRATION_ID,
          campaignCacheId: item.campaignId,
          leadgenId,
          pageId: '109823471629810',
          formId: item.formId,
          adId: item.adId,
          campaignId: item.campaignId,
          leadId: crmLead.id,
          fieldData: item.fieldData,
          rawPayload: { leadgen_id: leadgenId, campaign_id: item.campaignId, form_id: item.formId },
          status: 'PROCESSED',
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 14 * 86400000)),
        },
        update: {
          campaignCacheId: item.campaignId,
          leadId: crmLead.id,
          fieldData: item.fieldData,
          status: 'PROCESSED',
        },
      });
    } else {
      const googleLeadId = `glead_${crmLead.phone.replace(/\D/g, '').slice(-8)}`;
      await prisma.googleLeadWebhookLog.upsert({
        where: { id: `google_log_${crmLead.id}` },
        create: {
          id: `google_log_${crmLead.id}`,
          integrationId: GOOGLE_INTEGRATION_ID,
          campaignCacheId: item.campaignId,
          googleLeadId,
          formId: item.formId,
          campaignId: item.campaignId,
          gclid: item.gclid,
          leadId: crmLead.id,
          fieldData: item.fieldData,
          rawPayload: { lead_id: googleLeadId, campaign_id: item.campaignId, gclid: item.gclid },
          status: 'PROCESSED',
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 14 * 86400000)),
        },
        update: {
          campaignCacheId: item.campaignId,
          leadId: crmLead.id,
          fieldData: item.fieldData,
          status: 'PROCESSED',
        },
      });
    }

    console.log(`  └─ Lead: ${item.firstName} ${item.lastName} (${item.platform}) -> ₹${(item.budget / 10000000).toFixed(2)} Cr [${item.status}]`);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 7. Verification Summary
  // ──────────────────────────────────────────────────────────────────────────
  const finalMetaCount = await prisma.metaCampaignCache.count();
  const finalGoogleCount = await prisma.googleCampaignCache.count();
  const finalMetaLogsCount = await prisma.metaLeadWebhookLog.count();
  const finalGoogleLogsCount = await prisma.googleLeadWebhookLog.count();

  console.log('\n================================================================');
  console.log('🎉 MASTER ADS ECOSYSTEM SEEDING COMPLETE!');
  console.log('================================================================');
  console.log(`• Meta & Instagram Campaigns Cached  : ${finalMetaCount}`);
  console.log(`• Google & YouTube Campaigns Cached   : ${finalGoogleCount}`);
  console.log(`• Meta Lead Webhook Logs Linked       : ${finalMetaLogsCount}`);
  console.log(`• Google Lead Webhook Logs Linked     : ${finalGoogleLogsCount}`);
  console.log(`• High-Value CRM Property Leads Added : ${createdLeadsCount}`);
  console.log('\nAll web dashboards now ready for live inspection:');
  console.log('  1. Overview Hub   : /dashboard/marketing/ads');
  console.log('  2. Facebook Ads   : /dashboard/marketing/ads/meta');
  console.log('  3. Instagram Ads  : /dashboard/marketing/ads/instagram');
  console.log('  4. Google Ads     : /dashboard/marketing/ads/google');
  console.log('  5. YouTube Ads    : /dashboard/marketing/ads/youtube');
  console.log('  6. A/B Compare    : /dashboard/marketing/ads/compare');
  console.log('================================================================\n');
}

seedAdsEcosystem()
  .catch((err) => {
    console.error('❌ Seeder encountered an error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
