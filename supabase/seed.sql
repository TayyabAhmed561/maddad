-- ============================================================
-- Maddad Platform — Seed Data
-- ============================================================
-- Run AFTER the migration (20260518000001_initial_schema.sql).
-- Paste into the Supabase SQL editor or run via supabase db seed.
--
-- All IDs use gen_random_uuid(). Cross-table references use
-- subqueries on unique slug columns (orgs) and campaign slugs.
-- Additive only — safe to inspect before running. No TRUNCATE.
--
-- Intentionally NOT seeded: donations, receipts, recurring_donations,
-- donation_audit_log. Financial data comes from real Stripe webhooks.
-- ============================================================


-- ============================================================
-- SECTION 1: ORGANIZATIONS (6)
-- 2 approved · 2 under_review · 1 submitted · 1 draft
-- All Ontario-based. Approved orgs have CRA BN populated.
-- ============================================================

INSERT INTO organizations (
  id,
  legal_name,
  display_name,
  slug,
  ontario_charity_registration_number,
  description,
  website_url,
  contact_email,
  contact_phone,
  verification_status,
  trust_score,
  created_by,
  created_at,
  updated_at
) VALUES

-- 1. Crescent Aid Canada — APPROVED
(
  gen_random_uuid(),
  'Crescent Aid Canada',
  'Crescent Aid',
  'crescent-aid-canada',
  '819147263 RR 0001',
  'Providing emergency relief and long-term development through Ontario-registered operations. '
  'We run overseas programs in Gaza, Syria, and Pakistan through local partner networks.',
  'https://crescentaid.ca',
  'info@crescentaid.ca',
  '+1-416-555-0101',
  'approved',
  92,
  NULL,
  '2023-04-12 09:00:00+00',
  '2025-11-20 14:30:00+00'
),

-- 2. Amal Relief & Development — APPROVED
(
  gen_random_uuid(),
  'Amal Relief & Development Inc.',
  'Amal Relief',
  'amal-relief-development',
  '742836591 RR 0001',
  'Delivering sustainable humanitarian aid from Mississauga to communities across the Middle East '
  'and South Asia. Specialising in medical relief, education, and water access.',
  'https://amalrelief.ca',
  'contact@amalrelief.ca',
  '+1-905-555-0144',
  'approved',
  87,
  NULL,
  '2022-09-01 11:00:00+00',
  '2025-10-05 09:15:00+00'
),

-- 3. Hilal Foundation of Canada — UNDER REVIEW
(
  gen_random_uuid(),
  'Hilal Foundation of Canada',
  'Hilal Foundation',
  'hilal-foundation-canada',
  '693847251 RR 0001',
  'Community-focused charity based in Brampton supporting refugee families and overseas education projects.',
  'https://hilalfoundation.ca',
  'admin@hilalfoundation.ca',
  '+1-905-555-0188',
  'under_review',
  NULL,
  NULL,
  '2024-06-18 10:00:00+00',
  '2025-12-01 16:45:00+00'
),

-- 4. Rahma Charitable Trust — UNDER REVIEW
(
  gen_random_uuid(),
  'Rahma Charitable Trust',
  'Rahma Trust',
  'rahma-charitable-trust',
  '571938462 RR 0001',
  'Rahma Trust focuses on water infrastructure and community health projects in Sub-Saharan Africa '
  'and Southeast Asia, operating from Mississauga.',
  'https://rahmatrust.ca',
  'hello@rahmatrust.ca',
  '+1-905-555-0212',
  'under_review',
  NULL,
  NULL,
  '2024-11-03 08:30:00+00',
  '2025-12-10 11:00:00+00'
),

-- 5. Karama Community Services — SUBMITTED (CRA BN pending)
(
  gen_random_uuid(),
  'Karama Community Services',
  'Karama',
  'karama-community-services',
  NULL,
  'Toronto-based grassroots charity running community iftaar programs and local newcomer support services.',
  'https://karamaservices.ca',
  'karama@karamaservices.ca',
  '+1-416-555-0255',
  'submitted',
  NULL,
  NULL,
  '2025-08-22 14:00:00+00',
  '2026-01-15 10:30:00+00'
),

-- 6. Baraka Relief Network — DRAFT
(
  gen_random_uuid(),
  'Baraka Relief Network',
  'Baraka Relief',
  'baraka-relief-network',
  NULL,
  'New charity in formation. Based in Brampton, planning to support youth education and community centres.',
  NULL,
  'baraka@barakarelief.ca',
  NULL,
  'draft',
  NULL,
  NULL,
  '2026-02-14 09:00:00+00',
  '2026-02-14 09:00:00+00'
)

ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- SECTION 2: CAMPAIGNS (12)
-- Approved: 4 · Under review: 4 · Submitted: 2 · Draft: 2
-- All 8 categories covered. At least 4 zakat_eligible.
-- Overseas campaigns run by Ontario orgs as intermediaries.
-- ============================================================

INSERT INTO campaigns (
  id,
  campaign_type,
  organization_id,
  title,
  slug,
  description,
  category,
  giving_type,
  zakat_eligible,
  location_label,
  lat,
  lng,
  country_code,
  urgency,
  goal_amount,
  raised_amount,
  currency,
  beneficiary_name,
  endorsed_by_name,
  endorsed_by_type,
  verification_status,
  is_active,
  ends_at,
  created_by,
  created_at,
  updated_at
) VALUES

-- ── APPROVED (4) ──────────────────────────────────────────────────────────

-- 1. Gaza Emergency Food Relief — need · food · urgency 5 · zakat eligible
(
  gen_random_uuid(),
  'need',
  (SELECT id FROM organizations WHERE slug = 'crescent-aid-canada'),
  'Gaza Emergency Food Relief',
  'crescent-aid-emergency-food-gaza',
  'Providing emergency food packages to families in Gaza. Each package sustains a family of five '
  'for two weeks and includes rice, flour, cooking oil, canned goods, and clean water tablets. '
  'Distributed through verified local partner networks with on-ground confirmation.',
  'food',
  NULL,
  true,
  'Gaza, Palestine',
  31.3547,
  34.3088,
  'PS',
  5,
  150000.00,
  89500.00,
  'CAD',
  NULL, NULL, NULL,
  'approved',
  true,
  '2026-06-30 23:59:59+00',
  NULL,
  '2026-01-10 09:00:00+00',
  '2026-04-20 14:00:00+00'
),

-- 2. Ontario Winter Shelter Fund — appeal · shelter · urgency 3 · zakat eligible
(
  gen_random_uuid(),
  'appeal',
  (SELECT id FROM organizations WHERE slug = 'amal-relief-development'),
  'Ontario Winter Shelter Fund',
  'amal-ontario-winter-shelter',
  'Providing emergency hotel vouchers, warming centre referrals, and transitional housing deposits '
  'for at-risk newcomer and refugee families in Toronto and Mississauga during winter months. '
  'Coordinated through Amal''s Ontario community network.',
  'shelter',
  NULL,
  true,
  'Toronto & Mississauga, ON',
  43.6532,
  -79.3832,
  'CA',
  3,
  25000.00,
  18750.00,
  'CAD',
  NULL, NULL, NULL,
  'approved',
  true,
  NULL,
  NULL,
  '2025-11-01 10:00:00+00',
  '2026-04-10 11:00:00+00'
),

-- 3. Ramadan Fidya Program 2026 — need · fidya · urgency 2 · giving_type fidya
(
  gen_random_uuid(),
  'need',
  (SELECT id FROM organizations WHERE slug = 'crescent-aid-canada'),
  'Ramadan Fidya Program 2026',
  'crescent-aid-fidya-2026',
  'Fulfil your Fidya obligation through our verified feeding program. Each day''s Fidya ($15 CAD) '
  'provides a complete meal to a person in need through our certified partner kitchens in Canada '
  'and internationally. 100% of Fidya is passed directly to meal delivery.',
  'fidya',
  'fidya',
  false,
  'Toronto, ON & International',
  43.6532,
  -79.3832,
  'CA',
  2,
  30000.00,
  21500.00,
  'CAD',
  NULL, NULL, NULL,
  'approved',
  true,
  '2026-04-30 23:59:59+00',
  NULL,
  '2026-02-01 09:00:00+00',
  '2026-04-15 16:00:00+00'
),

-- 4. Mississauga Masjid Expansion — need · masjid · urgency 2
(
  gen_random_uuid(),
  'need',
  (SELECT id FROM organizations WHERE slug = 'crescent-aid-canada'),
  'Mississauga Masjid Expansion Project',
  'crescent-aid-masjid-mississauga',
  'Expanding the prayer hall capacity of a Mississauga masjid serving 3,000+ worshippers. '
  'Phase 2 covers the main prayer hall extension (250 additional capacity), women''s musalla '
  'renovation, and new wudu facilities. Building permits secured.',
  'masjid',
  NULL,
  false,
  'Mississauga, ON',
  43.5890,
  -79.6441,
  'CA',
  2,
  200000.00,
  132000.00,
  'CAD',
  NULL, NULL, NULL,
  'approved',
  true,
  NULL,
  NULL,
  '2025-06-15 10:00:00+00',
  '2026-03-01 09:00:00+00'
),

-- ── UNDER REVIEW (4) ──────────────────────────────────────────────────────

-- 5. Syria Medical Relief — need · medical · urgency 4 · zakat eligible
(
  gen_random_uuid(),
  'need',
  (SELECT id FROM organizations WHERE slug = 'amal-relief-development'),
  'Syria Emergency Medical Relief',
  'amal-syria-medical-relief',
  'Supplying essential medications, surgical consumables, and diagnostic equipment to two clinics '
  'in Aleppo serving 15,000+ patients annually. Equipment sourced through verified international '
  'medical supply partners and shipped via Amal''s logistics network.',
  'medical',
  NULL,
  true,
  'Aleppo, Syria',
  36.2021,
  37.1343,
  'SY',
  4,
  75000.00,
  48200.00,
  'CAD',
  NULL, NULL, NULL,
  'under_review',
  true,
  '2026-08-31 23:59:59+00',
  NULL,
  '2026-01-20 11:00:00+00',
  '2026-03-15 14:30:00+00'
),

-- 6. Pakistan Flood Education Fund — need · education · urgency 3 · zakat eligible
(
  gen_random_uuid(),
  'need',
  (SELECT id FROM organizations WHERE slug = 'hilal-foundation-canada'),
  'Pakistan Flood Education Recovery Fund',
  'hilal-pakistan-education-fund',
  'Rebuilding two flood-damaged schools in Sindh and funding teacher salaries for one academic year. '
  'The 2022 and 2024 floods displaced thousands of students. This fund restores classrooms, '
  'replaces textbooks, and provides uniforms to 800 children returning to school.',
  'education',
  NULL,
  true,
  'Sindh, Pakistan',
  27.5300,
  68.7580,
  'PK',
  3,
  50000.00,
  12000.00,
  'CAD',
  NULL, NULL, NULL,
  'under_review',
  true,
  '2026-12-31 23:59:59+00',
  NULL,
  '2025-12-05 09:00:00+00',
  '2026-02-20 10:00:00+00'
),

-- 7. Eid Qurbani 2026 — need · qurbani · urgency 2 · giving_type qurbani
(
  gen_random_uuid(),
  'need',
  (SELECT id FROM organizations WHERE slug = 'amal-relief-development'),
  'Eid al-Adha Qurbani 2026',
  'amal-eid-qurbani-2026',
  'Perform your Qurbani through Amal''s verified program. Animals inspected by Islamic scholars, '
  'slaughtered on Eid days, and fresh meat distributed to verified families in Somalia and Pakistan. '
  'Confirmation report with distribution photos sent to every donor.',
  'qurbani',
  'qurbani',
  false,
  'Somalia & Pakistan',
  2.0469,
  45.3182,
  'SO',
  2,
  80000.00,
  22000.00,
  'CAD',
  NULL, NULL, NULL,
  'under_review',
  true,
  '2026-07-15 23:59:59+00',
  NULL,
  '2026-02-10 09:00:00+00',
  '2026-03-20 11:00:00+00'
),

-- 8. Brampton Refugee Family Housing — community_appeal · shelter · urgency 4 · zakat eligible
(
  gen_random_uuid(),
  'community_appeal',
  (SELECT id FROM organizations WHERE slug = 'hilal-foundation-canada'),
  'Emergency Housing for Newly Arrived Refugee Family',
  'hilal-brampton-refugee-housing',
  'A newly arrived refugee family of five requires rent deposit and first month''s rent to secure '
  'stable housing in Brampton. The father sustained a work injury during resettlement and cannot '
  'work for 8 weeks. Endorsed by Brampton Islamic Centre after in-person verification.',
  'shelter',
  NULL,
  true,
  'Brampton, ON',
  43.7315,
  -79.7624,
  'CA',
  4,
  18000.00,
  7200.00,
  'CAD',
  'Al-Rashid Family',
  'Brampton Islamic Centre',
  'masjid',
  'under_review',
  true,
  '2026-07-31 23:59:59+00',
  NULL,
  '2026-03-01 10:00:00+00',
  '2026-04-05 09:00:00+00'
),

-- ── SUBMITTED (2) ─────────────────────────────────────────────────────────

-- 9. Community Iftar Sponsorship — appeal · food · urgency 2
(
  gen_random_uuid(),
  'appeal',
  (SELECT id FROM organizations WHERE slug = 'karama-community-services'),
  'Ramadan Community Iftar Sponsorship',
  'karama-community-iftar-2026',
  'Sponsoring nightly community iftaar meals in Toronto for the full month of Ramadan. '
  'Open to all community members regardless of background. Coordinated with three local '
  'halal restaurants and volunteer teams from Karama''s network.',
  'food',
  'meal_sponsorship',
  false,
  'Toronto, ON',
  43.6532,
  -79.3832,
  'CA',
  2,
  12000.00,
  3500.00,
  'CAD',
  NULL, NULL, NULL,
  'submitted',
  true,
  '2026-06-15 23:59:59+00',
  NULL,
  '2026-02-20 11:00:00+00',
  '2026-03-10 14:00:00+00'
),

-- 10. Zakat Distribution Pool 2026 — need · zakat · urgency 3 · zakat eligible
(
  gen_random_uuid(),
  'need',
  (SELECT id FROM organizations WHERE slug = 'crescent-aid-canada'),
  'Zakat Distribution Pool 2026',
  'crescent-aid-zakat-pool-2026',
  'Pooled Zakat fund distributed directly to verified eligible recipients (al-fuqara and al-masakin) '
  'in Ontario and internationally. 100% of Zakat donations are distributed to recipients. '
  'All recipients verified by Islamic scholars and Crescent Aid''s caseworkers.',
  'zakat',
  'zakat',
  true,
  'Ontario, Canada & International',
  43.6532,
  -79.3832,
  'CA',
  3,
  100000.00,
  0.00,
  'CAD',
  NULL, NULL, NULL,
  'submitted',
  true,
  NULL,
  NULL,
  '2026-01-05 09:00:00+00',
  '2026-04-01 10:00:00+00'
),

-- ── DRAFT (2) ─────────────────────────────────────────────────────────────

-- 11. Somalia Clean Water Wells — need · medical · urgency 3
(
  gen_random_uuid(),
  'need',
  (SELECT id FROM organizations WHERE slug = 'rahma-charitable-trust'),
  'Somalia Community Water Wells',
  'rahma-somalia-water-wells',
  'Installing three deep-bore hand-pump wells in villages outside Mogadishu. Each well serves '
  '200–300 residents daily and provides 25+ years of clean water access. Site surveys completed.',
  'medical',
  NULL,
  false,
  'Mogadishu, Somalia',
  2.0469,
  45.3182,
  'SO',
  3,
  35000.00,
  8000.00,
  'CAD',
  NULL, NULL, NULL,
  'draft',
  true,
  NULL,
  NULL,
  '2026-03-18 10:00:00+00',
  '2026-03-18 10:00:00+00'
),

-- 12. Scarborough Muslim Youth Centre — community_appeal · education · urgency 2
(
  gen_random_uuid(),
  'community_appeal',
  (SELECT id FROM organizations WHERE slug = 'baraka-relief-network'),
  'Scarborough Muslim Youth Education Centre',
  'baraka-scarborough-youth-centre',
  'Establishing a permanent Islamic education and mentorship centre for Muslim youth aged 12–24 '
  'in Scarborough. The centre will offer Quran classes, tutoring, and career mentorship. '
  'Endorsed by Scarborough Islamic Centre.',
  'education',
  NULL,
  false,
  'Scarborough, ON',
  43.7731,
  -79.2578,
  'CA',
  2,
  45000.00,
  9000.00,
  'CAD',
  'Scarborough Muslim Youth',
  'Scarborough Islamic Centre',
  'organization',
  'draft',
  true,
  NULL,
  NULL,
  '2026-04-01 10:00:00+00',
  '2026-04-01 10:00:00+00'
)

ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- SECTION 3: CAMPAIGN UPDATES
-- 2 updates per APPROVED campaign (4 campaigns × 2 = 8 updates).
-- progress_percent reflects raised_amount relative to goal.
-- ============================================================

INSERT INTO campaign_updates (
  id,
  campaign_id,
  title,
  content,
  progress_percent,
  posted_by,
  posted_at,
  created_at,
  updated_at
) VALUES

-- Gaza Emergency Food Relief (raised 89,500 / 150,000 = 59%)
(
  gen_random_uuid(),
  (SELECT id FROM campaigns WHERE slug = 'crescent-aid-emergency-food-gaza'),
  'Phase 2 Distribution Complete — 600 Families Reached',
  'Our partners completed Phase 2 distribution in northern and central Gaza this week. '
  '600 families received full food packages including rice, flour, oil, and canned goods '
  'sufficient for two weeks. Distribution videos and receipts have been submitted for '
  'verification review. Phase 3 procurement is underway.',
  60,
  NULL,
  '2026-04-20 10:00:00+00',
  '2026-04-20 10:00:00+00',
  '2026-04-20 10:00:00+00'
),
(
  gen_random_uuid(),
  (SELECT id FROM campaigns WHERE slug = 'crescent-aid-emergency-food-gaza'),
  'Phase 1 Complete — Supplies Warehoused in Rafah',
  'Phase 1 procurement is complete. 300 food packages have been assembled and warehoused '
  'at our partner facility in Rafah. Distribution to begin within 48 hours pending '
  'logistics clearance. All supplier invoices and delivery confirmations uploaded.',
  45,
  NULL,
  '2026-03-15 14:00:00+00',
  '2026-03-15 14:00:00+00',
  '2026-03-15 14:00:00+00'
),

-- Ontario Winter Shelter Fund (raised 18,750 / 25,000 = 75%)
(
  gen_random_uuid(),
  (SELECT id FROM campaigns WHERE slug = 'amal-ontario-winter-shelter'),
  '35 Families Housed — Fund Nearing Target',
  '35 newcomer and refugee families in Toronto and Mississauga have been placed in '
  'transitional housing using this fund. Deposits and first-month rent covered for all. '
  'We are 75% of the way to our target. Additional donations will extend the program '
  'through the spring transition period.',
  75,
  NULL,
  '2026-04-10 09:00:00+00',
  '2026-04-10 09:00:00+00',
  '2026-04-10 09:00:00+00'
),
(
  gen_random_uuid(),
  (SELECT id FROM campaigns WHERE slug = 'amal-ontario-winter-shelter'),
  'Program Launched — First Families Supported',
  'The Ontario Winter Shelter Fund is now active. In the first three weeks, 18 families '
  'referred by three settlement agencies have received emergency housing support. '
  'We are coordinating with Mississauga Housing Connect and Toronto Newcomer Office.',
  50,
  NULL,
  '2026-02-28 11:00:00+00',
  '2026-02-28 11:00:00+00',
  '2026-02-28 11:00:00+00'
),

-- Ramadan Fidya Program 2026 (raised 21,500 / 30,000 = 72%)
(
  gen_random_uuid(),
  (SELECT id FROM campaigns WHERE slug = 'crescent-aid-fidya-2026'),
  'Week 3 of Ramadan — 12,000 Meals Delivered',
  'We have delivered 12,000 meals through our partner kitchens as of the 21st of Ramadan. '
  'Meals are being distributed in Toronto, Ottawa, and internationally through our '
  'Global Feeding Initiative partner. Aggregate delivery reports are available on request.',
  72,
  NULL,
  '2026-04-15 08:00:00+00',
  '2026-04-15 08:00:00+00',
  '2026-04-15 08:00:00+00'
),
(
  gen_random_uuid(),
  (SELECT id FROM campaigns WHERE slug = 'crescent-aid-fidya-2026'),
  'Fidya Program Open — Partners Confirmed',
  'Our 2026 Fidya program is now open. Three verified feeding partners have confirmed '
  'capacity: Community Iftar Network (Toronto/Mississauga), Mercy Kitchen International '
  '(Middle East), and Local Masjid Food Programs (multiple cities). $15 CAD = 1 day fidya.',
  55,
  NULL,
  '2026-03-05 10:00:00+00',
  '2026-03-05 10:00:00+00',
  '2026-03-05 10:00:00+00'
),

-- Mississauga Masjid Expansion (raised 132,000 / 200,000 = 66%)
(
  gen_random_uuid(),
  (SELECT id FROM campaigns WHERE slug = 'crescent-aid-masjid-mississauga'),
  'Structural Framework Complete — Roofing Begins Next Week',
  'The structural framework for the prayer hall extension is complete. The contractor '
  'confirmed the build is ahead of schedule by two weeks. Roofing materials have been '
  'delivered on-site. Progress photos submitted to the verification panel.',
  66,
  NULL,
  '2026-03-01 11:00:00+00',
  '2026-03-01 11:00:00+00',
  '2026-03-01 11:00:00+00'
),
(
  gen_random_uuid(),
  (SELECT id FROM campaigns WHERE slug = 'crescent-aid-masjid-mississauga'),
  'Building Permit Received — Construction Begins',
  'After a 6-week review, the City of Mississauga has issued the building permit for '
  'Phase 2 of the masjid expansion. Foundation work commenced this week. Community '
  'fundraising has exceeded $130,000 — JazakAllah khair to every donor.',
  40,
  NULL,
  '2026-01-15 09:00:00+00',
  '2026-01-15 09:00:00+00',
  '2026-01-15 09:00:00+00'
)

ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- SECTION 4: EVIDENCE ITEMS
-- 3 items per APPROVED campaign (4 campaigns × 3 = 12 items).
-- All public, all approved. confidence_score 85–100.
-- ============================================================

INSERT INTO evidence_items (
  id,
  submission_id,
  campaign_id,
  organization_id,
  evidence_type,
  title,
  description,
  status,
  confidence_score,
  visibility,
  evidence_date,
  submitted_by,
  created_at,
  updated_at
) VALUES

-- Gaza Emergency Food Relief — 3 evidence items
(
  gen_random_uuid(), NULL,
  (SELECT id FROM campaigns WHERE slug = 'crescent-aid-emergency-food-gaza'),
  NULL,
  'org_registration',
  'Crescent Aid — CRA Registered Charity Certificate',
  'Official charity registration certificate from the Canada Revenue Agency confirming '
  'Crescent Aid Canada as a registered charity under the Income Tax Act. '
  'BN: 819147263 RR 0001.',
  'approved', 100, 'public', '2023-04-12',
  NULL, '2026-01-12 10:00:00+00', '2026-01-12 10:00:00+00'
),
(
  gen_random_uuid(), NULL,
  (SELECT id FROM campaigns WHERE slug = 'crescent-aid-emergency-food-gaza'),
  NULL,
  'campaign_need_photo',
  'On-Ground Assessment — Gaza Distribution Site',
  'Photographs from our local partner documenting current conditions at the distribution '
  'site and the families registered to receive food packages. All imagery reviewed by '
  'Crescent Aid''s field coordinator.',
  'approved', 94, 'public', '2026-01-08',
  NULL, '2026-01-12 10:30:00+00', '2026-01-12 10:30:00+00'
),
(
  gen_random_uuid(), NULL,
  (SELECT id FROM campaigns WHERE slug = 'crescent-aid-emergency-food-gaza'),
  NULL,
  'milestone_delivery_confirmation',
  'Phase 1 Delivery Confirmation — 300 Packages',
  'Signed confirmation from on-ground partner verifying delivery of 300 food packages to '
  'registered families in northern Gaza. Includes beneficiary count, distribution date, '
  'and supervisor signature.',
  'approved', 97, 'public', '2026-03-18',
  NULL, '2026-03-20 09:00:00+00', '2026-03-20 09:00:00+00'
),

-- Ontario Winter Shelter Fund — 3 evidence items
(
  gen_random_uuid(), NULL,
  (SELECT id FROM campaigns WHERE slug = 'amal-ontario-winter-shelter'),
  NULL,
  'org_financial_audit',
  'Amal Relief — 2024 Independent Financial Audit',
  'Independent financial audit conducted by a licensed Canadian accounting firm confirming '
  'proper fund management and compliance with CRA charitable status requirements for fiscal '
  'year ending December 2024.',
  'approved', 92, 'public', '2025-03-15',
  NULL, '2025-11-05 09:00:00+00', '2025-11-05 09:00:00+00'
),
(
  gen_random_uuid(), NULL,
  (SELECT id FROM campaigns WHERE slug = 'amal-ontario-winter-shelter'),
  NULL,
  'campaign_budget_breakdown',
  'Winter Shelter Fund — Budget Allocation Report',
  'Detailed budget showing allocation: 90% direct housing support (deposits and rent), '
  '7% case management and coordination, 3% administrative overhead. All partner agencies '
  'listed with contact information for verification.',
  'approved', 88, 'public', '2025-10-28',
  NULL, '2025-11-05 09:30:00+00', '2025-11-05 09:30:00+00'
),
(
  gen_random_uuid(), NULL,
  (SELECT id FROM campaigns WHERE slug = 'amal-ontario-winter-shelter'),
  NULL,
  'milestone_progress_photo',
  'Families Housed — Transitional Housing Documentation',
  'Photographs (with family consent, faces obscured for privacy) of transitional housing '
  'units secured using this fund. Includes lease agreement excerpts confirming deposit '
  'payments made on behalf of 18 families in the first month of the program.',
  'approved', 90, 'public', '2026-03-05',
  NULL, '2026-03-06 11:00:00+00', '2026-03-06 11:00:00+00'
),

-- Ramadan Fidya Program 2026 — 3 evidence items
(
  gen_random_uuid(), NULL,
  (SELECT id FROM campaigns WHERE slug = 'crescent-aid-fidya-2026'),
  NULL,
  'org_tax_status',
  'CRA Tax-Exempt Status Confirmation',
  'Letter from Canada Revenue Agency confirming Crescent Aid Canada''s tax-exempt status '
  'under section 149.1 of the Income Tax Act. Donors receive official receipts for all '
  'Fidya contributions.',
  'approved', 100, 'public', '2024-01-10',
  NULL, '2026-02-03 10:00:00+00', '2026-02-03 10:00:00+00'
),
(
  gen_random_uuid(), NULL,
  (SELECT id FROM campaigns WHERE slug = 'crescent-aid-fidya-2026'),
  NULL,
  'campaign_budget_breakdown',
  'Fidya 2026 — Cost per Meal Breakdown',
  'Itemised breakdown confirming $15 CAD per day Fidya rate: meal cost $12.50, logistics $1.75, '
  'platform 2% ($0.75). Verified against partner kitchen invoices from the 2025 Fidya cycle.',
  'approved', 95, 'public', '2026-01-30',
  NULL, '2026-02-03 10:30:00+00', '2026-02-03 10:30:00+00'
),
(
  gen_random_uuid(), NULL,
  (SELECT id FROM campaigns WHERE slug = 'crescent-aid-fidya-2026'),
  NULL,
  'milestone_delivery_confirmation',
  'Fidya Meal Delivery — Week 1 Confirmation',
  'Aggregate delivery confirmation from partner kitchens for the first week of Ramadan: '
  '4,200 meals delivered across Toronto, Mississauga, and international locations. '
  'Signed by each partner''s distribution supervisor.',
  'approved', 93, 'public', '2026-04-05',
  NULL, '2026-04-07 09:00:00+00', '2026-04-07 09:00:00+00'
),

-- Mississauga Masjid Expansion — 3 evidence items
(
  gen_random_uuid(), NULL,
  (SELECT id FROM campaigns WHERE slug = 'crescent-aid-masjid-mississauga'),
  NULL,
  'org_board_resolution',
  'Board Resolution — Masjid Expansion Authorization',
  'Signed board resolution from Crescent Aid Canada''s board of directors authorizing '
  'the launch and management of the Mississauga Masjid Expansion campaign and confirming '
  'the organization''s partnership with the masjid''s building committee.',
  'approved', 100, 'public', '2025-05-20',
  NULL, '2025-06-20 09:00:00+00', '2025-06-20 09:00:00+00'
),
(
  gen_random_uuid(), NULL,
  (SELECT id FROM campaigns WHERE slug = 'crescent-aid-masjid-mississauga'),
  NULL,
  'campaign_endorsement_letter',
  'Masjid Building Committee Endorsement',
  'Official letter from the Mississauga masjid''s building committee endorsing Crescent Aid '
  'as the fundraising partner for Phase 2 of the expansion. Includes committee signatures, '
  'building permit number, and architect''s certification reference.',
  'approved', 96, 'public', '2025-06-01',
  NULL, '2025-06-20 09:30:00+00', '2025-06-20 09:30:00+00'
),
(
  gen_random_uuid(), NULL,
  (SELECT id FROM campaigns WHERE slug = 'crescent-aid-masjid-mississauga'),
  NULL,
  'milestone_progress_photo',
  'Construction Progress — Structural Framework Complete',
  'Photographs from the licensed contractor showing the completed structural framework '
  'of the prayer hall extension. Dated February 25, 2026. Engineer''s site visit '
  'report attached confirming work meets approved architectural plans.',
  'approved', 91, 'public', '2026-02-25',
  NULL, '2026-03-02 10:00:00+00', '2026-03-02 10:00:00+00'
)

ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- SECTION 5: VERIFICATION SUBMISSIONS
-- One per org (approved / under_review / submitted) = 5 org submissions
-- One per campaign (approved / under_review / submitted) = 10 campaign submissions
-- Status mirrors the parent org/campaign status.
-- ============================================================

INSERT INTO verification_submissions (
  id,
  submission_type,
  organization_id,
  campaign_id,
  status,
  submitted_by,
  submitted_at,
  submitter_notes,
  created_at,
  updated_at
) VALUES

-- ── Organization submissions ──────────────────────────────────────────────

(
  gen_random_uuid(), 'organization',
  (SELECT id FROM organizations WHERE slug = 'crescent-aid-canada'), NULL,
  'approved', NULL,
  '2023-04-15 10:00:00+00',
  'All documentation submitted. CRA registration, audit, board resolution, and tax status letter included.',
  '2023-04-15 10:00:00+00', '2023-05-02 14:00:00+00'
),
(
  gen_random_uuid(), 'organization',
  (SELECT id FROM organizations WHERE slug = 'amal-relief-development'), NULL,
  'approved', NULL,
  '2022-09-10 11:00:00+00',
  'Full documentation package submitted. Two years of audited financials provided.',
  '2022-09-10 11:00:00+00', '2022-10-01 09:00:00+00'
),
(
  gen_random_uuid(), 'organization',
  (SELECT id FROM organizations WHERE slug = 'hilal-foundation-canada'), NULL,
  'under_review', NULL,
  '2024-06-25 10:00:00+00',
  'Registration certificate and board resolution submitted. Financial audit from 2023 attached.',
  '2024-06-25 10:00:00+00', '2025-12-05 15:00:00+00'
),
(
  gen_random_uuid(), 'organization',
  (SELECT id FROM organizations WHERE slug = 'rahma-charitable-trust'), NULL,
  'under_review', NULL,
  '2024-11-10 09:00:00+00',
  'New charity — first full audit not yet available. Interim financial statement submitted.',
  '2024-11-10 09:00:00+00', '2025-12-12 10:00:00+00'
),
(
  gen_random_uuid(), 'organization',
  (SELECT id FROM organizations WHERE slug = 'karama-community-services'), NULL,
  'submitted', NULL,
  '2026-01-15 10:00:00+00',
  'Submitted for review. CRA BN application in progress — expected within 60 days.',
  '2026-01-15 10:00:00+00', '2026-01-15 10:00:00+00'
),

-- ── Campaign submissions — approved (4) ───────────────────────────────────

(
  gen_random_uuid(), 'campaign',
  NULL, (SELECT id FROM campaigns WHERE slug = 'crescent-aid-emergency-food-gaza'),
  'approved', NULL,
  '2026-01-11 09:00:00+00',
  'Partner confirmation, budget, and on-ground photos submitted.',
  '2026-01-11 09:00:00+00', '2026-01-14 11:00:00+00'
),
(
  gen_random_uuid(), 'campaign',
  NULL, (SELECT id FROM campaigns WHERE slug = 'amal-ontario-winter-shelter'),
  'approved', NULL,
  '2025-11-03 10:00:00+00',
  'Budget breakdown, partner agency MOU, and pilot program results submitted.',
  '2025-11-03 10:00:00+00', '2025-11-10 14:00:00+00'
),
(
  gen_random_uuid(), 'campaign',
  NULL, (SELECT id FROM campaigns WHERE slug = 'crescent-aid-fidya-2026'),
  'approved', NULL,
  '2026-02-02 09:00:00+00',
  'Partner confirmation, cost-per-meal audit, and prior-year delivery report submitted.',
  '2026-02-02 09:00:00+00', '2026-02-05 10:00:00+00'
),
(
  gen_random_uuid(), 'campaign',
  NULL, (SELECT id FROM campaigns WHERE slug = 'crescent-aid-masjid-mississauga'),
  'approved', NULL,
  '2025-06-18 09:00:00+00',
  'Building permits, endorsement letter, architect certification, and board resolution submitted.',
  '2025-06-18 09:00:00+00', '2025-06-25 14:00:00+00'
),

-- ── Campaign submissions — under_review (4) ───────────────────────────────

(
  gen_random_uuid(), 'campaign',
  NULL, (SELECT id FROM campaigns WHERE slug = 'amal-syria-medical-relief'),
  'under_review', NULL,
  '2026-01-22 10:00:00+00',
  'Clinic registration, supply chain documentation, and field assessment report submitted.',
  '2026-01-22 10:00:00+00', '2026-03-16 09:00:00+00'
),
(
  gen_random_uuid(), 'campaign',
  NULL, (SELECT id FROM campaigns WHERE slug = 'hilal-pakistan-education-fund'),
  'under_review', NULL,
  '2025-12-08 10:00:00+00',
  'School damage assessment, partner NGO credentials, and budget submitted.',
  '2025-12-08 10:00:00+00', '2026-02-21 11:00:00+00'
),
(
  gen_random_uuid(), 'campaign',
  NULL, (SELECT id FROM campaigns WHERE slug = 'amal-eid-qurbani-2026'),
  'under_review', NULL,
  '2026-02-12 11:00:00+00',
  'Partner slaughter facility credentials, prior-year distribution report, and scholar endorsement submitted.',
  '2026-02-12 11:00:00+00', '2026-03-21 10:00:00+00'
),
(
  gen_random_uuid(), 'campaign',
  NULL, (SELECT id FROM campaigns WHERE slug = 'hilal-brampton-refugee-housing'),
  'under_review', NULL,
  '2026-03-03 10:00:00+00',
  'Masjid endorsement letter, family referral documentation, and housing cost breakdown submitted.',
  '2026-03-03 10:00:00+00', '2026-04-06 09:00:00+00'
),

-- ── Campaign submissions — submitted (2) ─────────────────────────────────

(
  gen_random_uuid(), 'campaign',
  NULL, (SELECT id FROM campaigns WHERE slug = 'karama-community-iftar-2026'),
  'submitted', NULL,
  '2026-03-10 14:00:00+00',
  'Restaurant partner agreements and budget submitted. Org verification still in progress.',
  '2026-03-10 14:00:00+00', '2026-03-10 14:00:00+00'
),
(
  gen_random_uuid(), 'campaign',
  NULL, (SELECT id FROM campaigns WHERE slug = 'crescent-aid-zakat-pool-2026'),
  'submitted', NULL,
  '2026-04-01 10:00:00+00',
  'Scholar endorsement, recipient eligibility criteria, and distribution methodology submitted.',
  '2026-04-01 10:00:00+00', '2026-04-01 10:00:00+00'
)

ON CONFLICT (id) DO NOTHING;
