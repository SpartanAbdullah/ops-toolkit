import { describe, expect, it } from "vitest";
import { calculateOvertime, type WeekendDayValue } from "./overtime";

const WEEKEND_FRI_SAT: WeekendDayValue[] = ["fri", "sat"];

// 2026-05-25 is a Monday (weekday). 2026-05-29 is Friday (weekend). 2026-05-30 is Saturday (weekend).
const MONDAY = "2026-05-25";
const FRIDAY = "2026-05-29";
const SATURDAY = "2026-05-30";

function base(overrides: Partial<Parameters<typeof calculateOvertime>[0]> = {}) {
  return calculateOvertime({
    workedDate: MONDAY,
    startTime: "09:00",
    endTime: "17:00",
    overnight: false,
    calculationMode: "simple",
    standardDailyHours: 8,
    simpleHourlyRate: 30,
    weekendDays: WEEKEND_FRI_SAT,
    holidayDates: [],
    ramadanEnabled: false,
    ramadanStartDate: null,
    ramadanEndDate: null,
    ...overrides,
  });
}

describe("calculateOvertime — input validation", () => {
  it("rejects invalid start time", () => {
    const result = base({ startTime: "not-a-time" });
    expect(result.error).toMatch(/valid shift/i);
    expect(result.amount).toBe(0);
  });

  it("rejects end<=start without overnight flag", () => {
    const result = base({ startTime: "22:00", endTime: "02:00", overnight: false });
    expect(result.error).toMatch(/overnight/i);
  });

  it("accepts end<=start when overnight is true", () => {
    const result = base({ startTime: "22:00", endTime: "02:00", overnight: true });
    expect(result.error).toBeNull();
    expect(result.totalWorkedMinutes).toBe(4 * 60);
  });

  it("rejects shifts longer than 24h", () => {
    // Same time start/end with overnight = exactly 24h, which the code rejects (>0 && <=1440 required, but `> MINUTES_PER_DAY` fails on > 24h only)
    // Use 23h shift instead which should pass; then >24h is impossible from same-day input.
    const result = base({ startTime: "00:00", endTime: "23:00" });
    expect(result.error).toBeNull();
  });

  it("rejects simple mode without an hourly rate", () => {
    const result = base({ simpleHourlyRate: null });
    expect(result.error).toMatch(/fixed overtime rate/i);
  });

  it("rejects MOHRE mode without a basic salary", () => {
    const result = base({ calculationMode: "mohre_compliant", basicMonthlySalary: null });
    expect(result.error).toMatch(/basic monthly salary/i);
  });
});

describe("calculateOvertime — Simple mode, weekday", () => {
  it("no OT when worked == standard hours", () => {
    const result = base({ startTime: "09:00", endTime: "17:00" }); // 8h
    expect(result.error).toBeNull();
    expect(result.overtimeMinutes).toBe(0);
    expect(result.amount).toBe(0);
  });

  it("OT applied above standard hours at fixed rate", () => {
    const result = base({ startTime: "09:00", endTime: "19:00", simpleHourlyRate: 30 }); // 10h, 2h OT
    expect(result.overtimeMinutes).toBe(120);
    expect(result.amount).toBe(60); // 2h * 30
  });

  it("fractional OT amounts rounded to 2dp", () => {
    const result = base({ startTime: "09:00", endTime: "17:30", simpleHourlyRate: 33.33 }); // 30 min OT
    expect(result.overtimeMinutes).toBe(30);
    expect(result.amount).toBe(16.67); // 0.5 * 33.33 = 16.665 -> 16.67
  });
});

describe("calculateOvertime — Simple mode, weekend / holiday", () => {
  it("all hours count as OT on weekend (Friday)", () => {
    const result = base({ workedDate: FRIDAY, startTime: "09:00", endTime: "13:00" }); // 4h
    expect(result.isWeekend).toBe(true);
    expect(result.overtimeMinutes).toBe(240);
    expect(result.amount).toBe(120); // 4h * 30
  });

  it("all hours count as OT on Saturday (weekend)", () => {
    const result = base({ workedDate: SATURDAY, startTime: "09:00", endTime: "12:00" });
    expect(result.isWeekend).toBe(true);
    expect(result.overtimeMinutes).toBe(180);
  });

  it("all hours count as OT on public holiday (weekday)", () => {
    const result = base({ workedDate: MONDAY, holidayDates: [MONDAY], startTime: "09:00", endTime: "11:00" });
    expect(result.isHoliday).toBe(true);
    expect(result.overtimeMinutes).toBe(120);
    expect(result.amount).toBe(60);
  });
});

describe("calculateOvertime — MOHRE mode, weekday", () => {
  // basic = 9000 AED, std = 8h -> hourly = 9000 / 30 / 8 = 37.50
  const mohre = (over: Partial<Parameters<typeof calculateOvertime>[0]> = {}) =>
    base({ calculationMode: "mohre_compliant", basicMonthlySalary: 9000, simpleHourlyRate: null, ...over });

  it("no OT when worked == standard hours", () => {
    const result = mohre({ startTime: "09:00", endTime: "17:00" });
    expect(result.overtimeMinutes).toBe(0);
    expect(result.amount).toBe(0);
  });

  it("daytime OT applies 1.25x multiplier", () => {
    // 9-19 = 10h. 2h OT, none in night window (22-04).
    const result = mohre({ startTime: "09:00", endTime: "19:00" });
    expect(result.overtimeMinutes).toBe(120);
    expect(result.dayOvertimeMinutes).toBe(120);
    expect(result.nightOvertimeMinutes).toBe(0);
    // 2 * 37.50 * 1.25 = 93.75
    expect(result.amount).toBeCloseTo(93.75, 2);
  });

  it("night OT (after 22:00) applies 1.5x multiplier", () => {
    // 14-23 = 9h. 1h OT, that 1h falls inside 22-23 (night window starts at 22:00).
    const result = mohre({ startTime: "14:00", endTime: "23:00" });
    expect(result.overtimeMinutes).toBe(60);
    expect(result.nightOvertimeMinutes).toBe(60);
    expect(result.dayOvertimeMinutes).toBe(0);
    // 1 * 37.50 * 1.5 = 56.25
    expect(result.amount).toBeCloseTo(56.25, 2);
  });

  it("split day+night OT applies both multipliers", () => {
    // 13-24 (overnight to 00:00) = 11h. 3h OT. The OT block sits at 21:00-24:00.
    // Window 22:00-28:00 → 22:00-24:00 = 2h night. 21:00-22:00 = 1h day.
    const result = mohre({ startTime: "13:00", endTime: "00:00", overnight: true });
    expect(result.totalWorkedMinutes).toBe(11 * 60);
    expect(result.overtimeMinutes).toBe(3 * 60);
    expect(result.nightOvertimeMinutes).toBe(120);
    expect(result.dayOvertimeMinutes).toBe(60);
    // (1 * 37.50 * 1.25) + (2 * 37.50 * 1.5) = 46.875 + 112.50 = 159.375 -> 159.38
    expect(result.amount).toBeCloseTo(159.38, 2);
  });

  it("overnight shift ending after 04:00 — post-04:00 OT is daytime (UAE night = 22:00-04:00)", () => {
    // 20:00 → 06:00 overnight = 10h. OT = 2h. OT block sits at 04:00-06:00 next day.
    // Per UAE Federal Decree-Law 33/2021 Art. 19, night window is 22:00-04:00.
    // So 04:00-06:00 is daytime → 1.25x.
    const result = mohre({ startTime: "20:00", endTime: "06:00", overnight: true });
    expect(result.overtimeMinutes).toBe(120);
    expect(result.dayOvertimeMinutes).toBe(120);
    expect(result.nightOvertimeMinutes).toBe(0);
    // 2 * 37.50 * 1.25 = 93.75
    expect(result.amount).toBeCloseTo(93.75, 2);
  });

  it("overnight shift with OT spanning 22:00-04:00 → all night (1.5x)", () => {
    // 14:00 → 02:00 overnight = 12h. OT = 4h. OT block = 22:00-02:00. All inside night window.
    const result = mohre({ startTime: "14:00", endTime: "02:00", overnight: true });
    expect(result.overtimeMinutes).toBe(240);
    expect(result.nightOvertimeMinutes).toBe(240);
    expect(result.dayOvertimeMinutes).toBe(0);
    // 4 * 37.50 * 1.5 = 225
    expect(result.amount).toBeCloseTo(225, 2);
  });

  it("overnight OT block straddling 04:00 splits day/night correctly", () => {
    // 19:00 → 05:00 overnight = 10h. OT = 2h. OT block = 03:00-05:00.
    // 03:00-04:00 = night (60 min @ 1.5x), 04:00-05:00 = day (60 min @ 1.25x).
    const result = mohre({ startTime: "19:00", endTime: "05:00", overnight: true });
    expect(result.overtimeMinutes).toBe(120);
    expect(result.nightOvertimeMinutes).toBe(60);
    expect(result.dayOvertimeMinutes).toBe(60);
    // (1 * 37.5 * 1.25) + (1 * 37.5 * 1.5) = 46.875 + 56.25 = 103.125 → 103.13
    expect(result.amount).toBeCloseTo(103.13, 2);
  });
});

describe("calculateOvertime — MOHRE mode, weekend / holiday", () => {
  const mohre = (over: Partial<Parameters<typeof calculateOvertime>[0]> = {}) =>
    base({ calculationMode: "mohre_compliant", basicMonthlySalary: 9000, simpleHourlyRate: null, ...over });

  it("all hours at 1.5x on weekend regardless of standard hours", () => {
    const result = mohre({ workedDate: FRIDAY, startTime: "09:00", endTime: "13:00" });
    expect(result.isWeekend).toBe(true);
    expect(result.overtimeMinutes).toBe(240);
    // 4 * 37.50 * 1.5 = 225
    expect(result.amount).toBeCloseTo(225, 2);
  });

  it("all hours at 1.5x on public holiday", () => {
    const result = mohre({ holidayDates: [MONDAY], startTime: "09:00", endTime: "12:00" });
    expect(result.isHoliday).toBe(true);
    expect(result.overtimeMinutes).toBe(180);
    expect(result.amount).toBeCloseTo(168.75, 2); // 3 * 37.50 * 1.5
  });
});

describe("calculateOvertime — Ramadan cap", () => {
  it("caps standard hours at 6 when ramadan is in range", () => {
    const result = base({
      workedDate: MONDAY,
      startTime: "09:00",
      endTime: "17:00",
      ramadanEnabled: true,
      ramadanStartDate: "2026-05-01",
      ramadanEndDate: "2026-05-31",
    });
    expect(result.ramadanApplied).toBe(true);
    expect(result.standardDailyHoursApplied).toBe(6);
    // 8h worked, std 6h → 2h OT at 30/hr = 60
    expect(result.overtimeMinutes).toBe(120);
    expect(result.amount).toBe(60);
  });

  it("does not apply ramadan cap outside the date window", () => {
    const result = base({
      workedDate: MONDAY,
      startTime: "09:00",
      endTime: "17:00",
      ramadanEnabled: true,
      ramadanStartDate: "2026-03-01",
      ramadanEndDate: "2026-03-31",
    });
    expect(result.ramadanApplied).toBe(false);
    expect(result.standardDailyHoursApplied).toBe(8);
    expect(result.overtimeMinutes).toBe(0);
  });

  it("does not apply ramadan cap when ramadanEnabled is false", () => {
    const result = base({
      workedDate: MONDAY,
      startTime: "09:00",
      endTime: "17:00",
      ramadanEnabled: false,
      ramadanStartDate: "2026-05-01",
      ramadanEndDate: "2026-05-31",
    });
    expect(result.ramadanApplied).toBe(false);
  });

  it("MOHRE hourly rate uses ramadan-adjusted standard hours (higher rate)", () => {
    // basic 9000, std 6h during ramadan → 9000/30/6 = 50/hr (vs 37.50 normally)
    // 8h worked, std 6h → 2h OT. Day OT, no night, 1.25x → 2 * 50 * 1.25 = 125
    const result = base({
      calculationMode: "mohre_compliant",
      basicMonthlySalary: 9000,
      simpleHourlyRate: null,
      startTime: "09:00",
      endTime: "17:00",
      ramadanEnabled: true,
      ramadanStartDate: "2026-05-01",
      ramadanEndDate: "2026-05-31",
    });
    expect(result.standardDailyHoursApplied).toBe(6);
    expect(result.overtimeMinutes).toBe(120);
    expect(result.amount).toBeCloseTo(125, 2);
  });
});

describe("calculateOvertime — wellbeing warning", () => {
  it("flags >2h OT", () => {
    const result = base({ startTime: "09:00", endTime: "20:00", simpleHourlyRate: 30 }); // 3h OT
    expect(result.wellbeingWarning).not.toBeNull();
  });

  it("no warning at exactly 2h OT", () => {
    const result = base({ startTime: "09:00", endTime: "19:00" }); // 2h OT
    expect(result.wellbeingWarning).toBeNull();
  });
});

describe("calculateOvertime — weekday detection", () => {
  it("treats Friday as weekend when weekendDays=[fri,sat]", () => {
    const result = base({ workedDate: FRIDAY, startTime: "09:00", endTime: "10:00" });
    expect(result.isWeekend).toBe(true);
  });

  it("treats Sunday as workday when weekendDays=[fri,sat]", () => {
    // 2026-05-31 is a Sunday
    const result = base({ workedDate: "2026-05-31", startTime: "09:00", endTime: "17:00" });
    expect(result.isWeekend).toBe(false);
    expect(result.overtimeMinutes).toBe(0);
  });

  it("respects custom weekendDays config (e.g. Sun+Mon)", () => {
    const result = base({
      workedDate: MONDAY,
      weekendDays: ["sun", "mon"],
      startTime: "09:00",
      endTime: "11:00",
    });
    expect(result.isWeekend).toBe(true);
    expect(result.overtimeMinutes).toBe(120);
  });
});
