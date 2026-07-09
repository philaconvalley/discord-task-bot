import { describe, it, expect } from 'vitest';
import { today, toISODate, addDays } from '../src/lib/date';

describe('toISODate', () => {
  it('returns the America/New_York calendar day, not the UTC calendar day, when they differ', () => {
    // 2026-07-09T02:00:00Z is 2026-07-08T22:00:00 in America/New_York (EDT, UTC-4) —
    // this instant is on different calendar days in UTC vs. America/New_York.
    const date = new Date('2026-07-09T02:00:00Z');
    expect(toISODate(date)).toBe('2026-07-08');
  });

  it('agrees with the UTC calendar day when the instant is well within it', () => {
    const date = new Date('2026-07-08T16:00:00Z'); // noon EDT
    expect(toISODate(date)).toBe('2026-07-08');
  });
});

describe('today', () => {
  it('returns a string in YYYY-MM-DD format', () => {
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('addDays', () => {
  it('adds days within a month', () => {
    expect(addDays('2026-07-08', 1)).toBe('2026-07-09');
  });

  it('rolls over a month boundary', () => {
    expect(addDays('2026-07-31', 1)).toBe('2026-08-01');
  });
});
