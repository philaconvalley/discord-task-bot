import { describe, it, expect } from 'vitest';
import { parseDueDate, parseDateTime } from '../src/lib/parseDate';

describe('parseDueDate', () => {
  const reference = new Date('2026-07-08T12:00:00');

  it('parses a relative day name to the correct ISO date', () => {
    expect(parseDueDate('friday', reference)).toBe('2026-07-10');
  });

  it('parses "tomorrow"', () => {
    expect(parseDueDate('tomorrow', reference)).toBe('2026-07-09');
  });

  it('parses an explicit month and day', () => {
    expect(parseDueDate('july 17', reference)).toBe('2026-07-17');
  });

  it('returns null for unparseable input', () => {
    expect(parseDueDate('asdfghjkl', reference)).toBeNull();
  });
});

describe('parseDateTime', () => {
  const reference = new Date('2026-07-08T12:00:00');

  it('parses a full date and time', () => {
    const result = parseDateTime('july 30 6pm', reference);

    expect(result).not.toBeNull();
    expect(result?.getMonth()).toBe(6);
    expect(result?.getDate()).toBe(30);
    expect(result?.getHours()).toBe(18);
  });

  it('returns null for unparseable input', () => {
    expect(parseDateTime('asdfghjkl', reference)).toBeNull();
  });
});
