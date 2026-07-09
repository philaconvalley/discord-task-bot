import * as chrono from 'chrono-node';
import { toISODate } from './date';

export function parseDateTime(input: string, referenceDate: Date = new Date()): Date | null {
  return chrono.parseDate(input, referenceDate, { forwardDate: true });
}

export function parseDueDate(input: string, referenceDate: Date = new Date()): string | null {
  const result = parseDateTime(input, referenceDate);
  if (!result) {
    return null;
  }
  return toISODate(result);
}
