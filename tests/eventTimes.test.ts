import { describe, it, expect } from 'vitest';
import { eventTimeError } from '../src/lib/eventTimes';

describe('eventTimeError', () => {
  it('accepts an end time after the start', () => {
    const start = new Date('2026-07-30T21:00:00Z');
    const end = new Date('2026-07-30T23:00:00Z');

    expect(eventTimeError(start, end)).toBeNull();
  });

  it('rejects an end time before the start', () => {
    const start = new Date('2026-07-30T21:00:00Z');
    const end = new Date('2026-07-30T18:00:00Z');

    expect(eventTimeError(start, end)).toBe(
      'The event ends before it starts. Check the end time.'
    );
  });

  it('rejects an end time equal to the start', () => {
    const start = new Date('2026-07-30T21:00:00Z');
    const end = new Date('2026-07-30T21:00:00Z');

    expect(eventTimeError(start, end)).toBe(
      'The event ends at the same time it starts. Check the end time.'
    );
  });
});
