export function eventTimeError(start: Date, end: Date): string | null {
  const startMs = start.getTime();
  const endMs = end.getTime();

  if (endMs < startMs) {
    return 'The event ends before it starts. Check the end time.';
  }
  if (endMs === startMs) {
    return 'The event ends at the same time it starts. Check the end time.';
  }
  return null;
}
