import { describe, it, expect } from "vitest";
import { fmtSG, fmtDate } from "./format.js";

describe("fmtSG", () => {
  it("prefixes positive values with +", () => {
    expect(fmtSG(1.5)).toBe("+1.50");
  });

  it("prefixes negative values with −", () => {
    expect(fmtSG(-0.75)).toBe("-0.75");
  });

  it("shows 0.00 for zero (no sign, since 0 is not > 0)", () => {
    expect(fmtSG(0)).toBe("0.00");
  });

  it("rounds to two decimal places", () => {
    expect(fmtSG(1.555)).toBe("+1.56");
    expect(fmtSG(-2.344)).toBe("-2.34");
  });

  it("handles large positive values", () => {
    expect(fmtSG(10)).toBe("+10.00");
  });

  it("handles large negative values", () => {
    expect(fmtSG(-10)).toBe("-10.00");
  });

  it("rounds −0.001 to 0.00 (no sign)", () => {
    // Math.round(-0.001 * 100) / 100 === 0; 0 is not > 0 so no + prefix
    expect(fmtSG(-0.001)).toBe("0.00");
  });
});

describe("fmtDate", () => {
  it("returns a non-empty string for a valid ISO date", () => {
    const result = fmtDate("2026-05-05T00:00:00.000Z");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns different strings for different dates", () => {
    const a = fmtDate("2026-01-01T00:00:00.000Z");
    const b = fmtDate("2026-12-31T00:00:00.000Z");
    expect(a).not.toBe(b);
  });
});
