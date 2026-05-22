// ── Islamic Seasonal Campaign Dates ─────────────────────────────────────────
//
// Islamic calendar dates shift ~11 days earlier each Gregorian year.
// The platform admin should update these dates each year before the season.
// Use reliable moonsighting references (e.g. ISNA, HMC) to confirm exact dates.

export const SEASONS = {
  dhulHijjah2026: {
    // Approximate — confirm via moonsighting closer to the date
    start: new Date('2026-05-27'),   // 1 Dhul Hijjah 1447H
    end:   new Date('2026-06-05'),   // 10 Dhul Hijjah (Eid al-Adha)
    arafah: new Date('2026-06-04'), // 9 Dhul Hijjah — Day of Arafah
    eid:    new Date('2026-06-05'), // 10 Dhul Hijjah — Eid al-Adha / Qurbani day
  },

  ramadan2026: {
    start: new Date('2026-02-18'),  // 1 Ramadan 1447H (approximate)
    end:   new Date('2026-03-19'),  // 29/30 Ramadan
    lastTenNightsStart: new Date('2026-03-09'), // Night 21
    laylatul_qadr: new Date('2026-03-15'),       // Night 27 (most likely)
  },

  ramadan2027: {
    start: new Date('2027-02-07'),
    end:   new Date('2027-03-08'),
    lastTenNightsStart: new Date('2027-02-26'),
    laylatul_qadr: new Date('2027-03-04'),
  },
} as const
