const STORAGE_PREFIX = "heailth_routine_week_anchor";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function storageKey(routineId: string) {
  return `${STORAGE_PREFIX}:${routineId}`;
}

export function getRoutineWeekAnchor(routineId: string): number {
  const key = storageKey(routineId);
  const stored = localStorage.getItem(key);
  if (stored) {
    const parsed = Number(stored);
    if (!Number.isNaN(parsed)) return parsed;
  }

  const now = Date.now();
  localStorage.setItem(key, String(now));
  return now;
}

export function resetRoutineWeekAnchor(routineId: string, timestamp = Date.now()) {
  localStorage.setItem(storageKey(routineId), String(timestamp));
}

export function isRoutineWeekExpired(routineId: string): boolean {
  const anchor = getRoutineWeekAnchor(routineId);
  return Date.now() - anchor >= WEEK_MS;
}

/** Test helper: pretend a full week has passed. */
export function simulateWeekElapsedForTest(routineId: string) {
  resetRoutineWeekAnchor(routineId, Date.now() - WEEK_MS - 1);
}

export function daysUntilRoutineRefresh(routineId: string): number {
  const anchor = getRoutineWeekAnchor(routineId);
  const remaining = WEEK_MS - (Date.now() - anchor);
  return Math.max(0, Math.ceil(remaining / (24 * 60 * 60 * 1000)));
}
