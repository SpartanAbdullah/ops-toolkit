// Timezone helpers for computing "today" and date arithmetic in a specific zone.
//
// Why this exists:
// - Stored dates (workedDate, occurredAt) are kept at UTC noon so the calendar date is unambiguous.
// - But "what is today" / "what range is `this_month`" must be computed from the user's wall clock,
//   not the server's UTC clock. Otherwise a Dubai user at 02:00 local sees yesterday's date as today
//   (because UTC is still 22:00 of the previous day).
//
// All helpers default to "Asia/Dubai" — the app's home zone — but accept an override so individual
// profiles can be honoured.

export const DEFAULT_TIMEZONE = "Asia/Dubai";

type DateParts = { year: number; month: number; day: number };

const partsFormatterCache = new Map<string, Intl.DateTimeFormat>();

function getPartsFormatter(timezone: string) {
  let formatter = partsFormatterCache.get(timezone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    partsFormatterCache.set(timezone, formatter);
  }
  return formatter;
}

export function getZonedDateParts(date: Date, timezone: string = DEFAULT_TIMEZONE): DateParts {
  const parts = getPartsFormatter(timezone).formatToParts(date);
  const lookup: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") lookup[part.type] = part.value;
  }
  return {
    year: Number(lookup.year),
    month: Number(lookup.month),
    day: Number(lookup.day),
  };
}

/** "YYYY-MM-DD" for the wall-clock date in the given timezone. */
export function formatZonedDate(date: Date, timezone: string = DEFAULT_TIMEZONE): string {
  const { year, month, day } = getZonedDateParts(date, timezone);
  return `${year}-${`${month}`.padStart(2, "0")}-${`${day}`.padStart(2, "0")}`;
}

/** Today's calendar date in the given timezone, formatted as "YYYY-MM-DD". */
export function getTodayInTimezone(timezone: string = DEFAULT_TIMEZONE, now: Date = new Date()): string {
  return formatZonedDate(now, timezone);
}

/** Wall-clock weekday (0=Sun..6=Sat) for the given Date in the given timezone. */
export function getZonedWeekday(date: Date, timezone: string = DEFAULT_TIMEZONE): number {
  const { year, month, day } = getZonedDateParts(date, timezone);
  // Build a Date at UTC noon on that calendar date — TZ-independent for weekday lookup
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0)).getUTCDay();
}

/**
 * Returns a Date representing UTC noon on the wall-clock calendar date of `reference` in the given
 * timezone. Stable to use as a calendar reference because UTC noon never crosses a date boundary
 * for any standard timezone.
 */
export function getZonedDayAnchor(reference: Date, timezone: string = DEFAULT_TIMEZONE): Date {
  const { year, month, day } = getZonedDateParts(reference, timezone);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

function addDaysUtc(anchor: Date, days: number): Date {
  return new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), anchor.getUTCDate() + days, 12, 0, 0));
}

function ymd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Range bounds for common time windows ("this_week", "last_week", "this_month", "last_month"),
 * computed in the given timezone. Returns ISO "YYYY-MM-DD" strings (inclusive).
 *
 * Week starts on Monday — that's the convention used across the rest of the codebase.
 */
export function getZonedRangeBounds(
  range: "this_week" | "last_week" | "this_month" | "last_month" | "custom",
  timezone: string = DEFAULT_TIMEZONE,
  now: Date = new Date(),
): { from: string; to: string } {
  if (range === "custom") return { from: "", to: "" };

  const anchor = getZonedDayAnchor(now, timezone);
  const weekday = anchor.getUTCDay(); // 0..6 with 0 = Sunday
  const daysFromMonday = (weekday + 6) % 7;
  const thisWeekStart = addDaysUtc(anchor, -daysFromMonday);

  switch (range) {
    case "this_week":
      return { from: ymd(thisWeekStart), to: ymd(addDaysUtc(thisWeekStart, 6)) };
    case "last_week":
      return { from: ymd(addDaysUtc(thisWeekStart, -7)), to: ymd(addDaysUtc(thisWeekStart, -1)) };
    case "this_month": {
      const monthStart = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), 1, 12, 0, 0));
      const monthEnd = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + 1, 0, 12, 0, 0));
      return { from: ymd(monthStart), to: ymd(monthEnd) };
    }
    case "last_month": {
      const monthStart = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() - 1, 1, 12, 0, 0));
      const monthEnd = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), 0, 12, 0, 0));
      return { from: ymd(monthStart), to: ymd(monthEnd) };
    }
  }
}

/** Inclusive ISO bounds for the calendar month containing `reference`, in the given timezone. */
export function getZonedMonthBounds(reference: Date, timezone: string = DEFAULT_TIMEZONE): { from: string; to: string } {
  const anchor = getZonedDayAnchor(reference, timezone);
  const monthStart = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), 1, 12, 0, 0));
  const monthEnd = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + 1, 0, 12, 0, 0));
  return { from: ymd(monthStart), to: ymd(monthEnd) };
}
