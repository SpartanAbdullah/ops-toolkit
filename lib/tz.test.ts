import { describe, expect, it } from "vitest";
import {
  DEFAULT_TIMEZONE,
  formatZonedDate,
  getTodayInTimezone,
  getZonedDateParts,
  getZonedMonthBounds,
  getZonedRangeBounds,
  getZonedWeekday,
} from "./tz";

describe("getZonedDateParts", () => {
  it("returns Dubai-local parts when UTC has already crossed to next day", () => {
    // 2026-05-31 22:00 UTC = 2026-06-01 02:00 Dubai
    const moment = new Date("2026-05-31T22:00:00.000Z");
    expect(getZonedDateParts(moment, "Asia/Dubai")).toEqual({ year: 2026, month: 6, day: 1 });
  });

  it("returns UTC parts when timezone is UTC", () => {
    const moment = new Date("2026-05-31T22:00:00.000Z");
    expect(getZonedDateParts(moment, "UTC")).toEqual({ year: 2026, month: 5, day: 31 });
  });

  it("handles New York DST correctly", () => {
    // 2026-06-15 03:00 UTC = 2026-06-14 23:00 New York (EDT, UTC-4)
    const moment = new Date("2026-06-15T03:00:00.000Z");
    expect(getZonedDateParts(moment, "America/New_York")).toEqual({ year: 2026, month: 6, day: 14 });
  });
});

describe("formatZonedDate", () => {
  it("formats as YYYY-MM-DD with zero-padding", () => {
    const moment = new Date("2026-01-05T10:00:00.000Z");
    expect(formatZonedDate(moment, "Asia/Dubai")).toBe("2026-01-05");
  });

  it("returns the wall-clock date in Dubai when UTC says previous day", () => {
    // 2026-12-31 21:00 UTC = 2027-01-01 01:00 Dubai
    expect(formatZonedDate(new Date("2026-12-31T21:00:00.000Z"), "Asia/Dubai")).toBe("2027-01-01");
  });

  it("defaults to Asia/Dubai", () => {
    const moment = new Date("2026-05-31T22:00:00.000Z");
    expect(formatZonedDate(moment)).toBe("2026-06-01");
  });
});

describe("getTodayInTimezone", () => {
  it("returns date string in the given zone", () => {
    expect(getTodayInTimezone("Asia/Dubai", new Date("2026-07-01T00:30:00.000Z"))).toBe("2026-07-01");
  });
});

describe("getZonedWeekday", () => {
  it("returns 1 (Monday) for 2026-05-25 in Dubai", () => {
    expect(getZonedWeekday(new Date("2026-05-25T12:00:00.000Z"), "Asia/Dubai")).toBe(1);
  });

  it("uses zone-local date, not UTC date", () => {
    // 2026-05-31 22:00 UTC = 2026-06-01 02:00 Dubai (Monday)
    // UTC weekday would be 0 (Sunday); Dubai weekday should be 1 (Monday)
    expect(getZonedWeekday(new Date("2026-05-31T22:00:00.000Z"), "Asia/Dubai")).toBe(1);
  });
});

describe("getZonedMonthBounds", () => {
  it("returns June bounds when Dubai clock is just past midnight 1 June, even though UTC is still May", () => {
    const moment = new Date("2026-05-31T22:00:00.000Z"); // 02:00 Dubai 1 June
    expect(getZonedMonthBounds(moment, "Asia/Dubai")).toEqual({ from: "2026-06-01", to: "2026-06-30" });
  });

  it("returns May bounds for the same moment in UTC zone", () => {
    expect(getZonedMonthBounds(new Date("2026-05-31T22:00:00.000Z"), "UTC")).toEqual({
      from: "2026-05-01",
      to: "2026-05-31",
    });
  });

  it("handles February in a non-leap year", () => {
    expect(getZonedMonthBounds(new Date("2026-02-15T12:00:00.000Z"), "Asia/Dubai")).toEqual({
      from: "2026-02-01",
      to: "2026-02-28",
    });
  });

  it("handles February in a leap year", () => {
    expect(getZonedMonthBounds(new Date("2028-02-15T12:00:00.000Z"), "Asia/Dubai")).toEqual({
      from: "2028-02-01",
      to: "2028-02-29",
    });
  });
});

describe("getZonedRangeBounds", () => {
  // 2026-05-25 is a Monday
  const monMidday = new Date("2026-05-25T08:00:00.000Z"); // 12:00 Dubai Mon

  it("this_week starts Monday and ends Sunday", () => {
    expect(getZonedRangeBounds("this_week", "Asia/Dubai", monMidday)).toEqual({
      from: "2026-05-25",
      to: "2026-05-31",
    });
  });

  it("last_week is the prior Mon-Sun", () => {
    expect(getZonedRangeBounds("last_week", "Asia/Dubai", monMidday)).toEqual({
      from: "2026-05-18",
      to: "2026-05-24",
    });
  });

  it("this_month is full calendar month", () => {
    expect(getZonedRangeBounds("this_month", "Asia/Dubai", monMidday)).toEqual({
      from: "2026-05-01",
      to: "2026-05-31",
    });
  });

  it("last_month is previous calendar month", () => {
    expect(getZonedRangeBounds("last_month", "Asia/Dubai", monMidday)).toEqual({
      from: "2026-04-01",
      to: "2026-04-30",
    });
  });

  it("custom returns empty strings", () => {
    expect(getZonedRangeBounds("custom", "Asia/Dubai", monMidday)).toEqual({ from: "", to: "" });
  });

  it("this_week boundary: at 01:00 Dubai Sunday, range is Mon-Sun of the just-finishing week (UTC would say Sat)", () => {
    // 2026-05-30 21:00 UTC = 2026-05-31 01:00 Dubai (Sunday)
    const sunEarly = new Date("2026-05-30T21:00:00.000Z");
    expect(getZonedRangeBounds("this_week", "Asia/Dubai", sunEarly)).toEqual({
      from: "2026-05-25",
      to: "2026-05-31",
    });
    // Same instant computed in UTC = 2026-05-30 Saturday, which falls in same Mon-Sun week
    expect(getZonedRangeBounds("this_week", "UTC", sunEarly)).toEqual({
      from: "2026-05-25",
      to: "2026-05-31",
    });
  });

  it("month-boundary regression: 02:00 Dubai 1 June returns June, not May", () => {
    const earlyJune = new Date("2026-05-31T22:00:00.000Z");
    expect(getZonedRangeBounds("this_month", "Asia/Dubai", earlyJune)).toEqual({
      from: "2026-06-01",
      to: "2026-06-30",
    });
    // The UTC version stays in May — that's the bug we just fixed by passing timezone
    expect(getZonedRangeBounds("this_month", "UTC", earlyJune)).toEqual({
      from: "2026-05-01",
      to: "2026-05-31",
    });
  });
});

describe("DEFAULT_TIMEZONE", () => {
  it("is Asia/Dubai", () => {
    expect(DEFAULT_TIMEZONE).toBe("Asia/Dubai");
  });
});
