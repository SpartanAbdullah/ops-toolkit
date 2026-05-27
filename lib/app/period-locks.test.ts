import { describe, expect, it } from "vitest";

import { formatOperationalPeriod, getOperationalPeriodMonth } from "./period-locks";

describe("operational period locks", () => {
  it("normalizes dates to the UTC month boundary", () => {
    expect(getOperationalPeriodMonth(new Date("2026-05-27T20:15:00.000Z")).toISOString()).toBe("2026-05-01T00:00:00.000Z");
  });

  it("formats the locked month for operator-facing errors", () => {
    expect(formatOperationalPeriod(new Date("2026-05-27T20:15:00.000Z"))).toBe("May 2026");
  });
});
