import * as chrono from 'chrono-node';

export function parseDateTime(input: string, referenceDate: Date = new Date()): Date | null {
  return chrono.parseDate(input, referenceDate, { forwardDate: true });
}

export function parseDueDate(input: string, referenceDate: Date = new Date()): string | null {
  const result = parseDateTime(input, referenceDate);
  if (!result) {
    return null;
  }
  return toISODateString(result);
}

function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
