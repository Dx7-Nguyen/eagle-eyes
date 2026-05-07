import { describe, it, expect } from "vitest";
import { adjustedGrossScore, differential, handicapIndex } from "./handicap.js";
import type { HoleInput } from "../../../shared/types/index.js";

// Minimal HoleInput — only par and shots.length matter for AGS
function hole(par: number, strokes: number): HoleInput {
  return {
    number: 1,
    par,
    shots: Array.from({ length: strokes }, (_, i) => ({
      shotNumber: i + 1,
      startLie: "TEE",
      startDistance: 100,
      endLie: strokes === i + 1 ? "HOLE" : "FAIRWAY",
      endDistance: 0,
    })),
  };
}

// ── adjustedGrossScore ────────────────────────────────────────────────────────

describe("adjustedGrossScore", () => {
  it("uses actual strokes when at or below cap", () => {
    expect(adjustedGrossScore([hole(4, 4)])).toBe(4);
  });

  it("caps each hole at par + 5", () => {
    // par 4 → cap = 9; 12 strokes → scored as 9
    expect(adjustedGrossScore([hole(4, 12)])).toBe(9);
  });

  it("sums multiple holes, applying cap per hole", () => {
    const holes = [
      hole(4, 4),     // 4 (no cap)
      hole(3, 3),     // 3 (no cap)
      hole(5, 11),    // capped at 10
    ];
    expect(adjustedGrossScore(holes)).toBe(17);
  });

  it("returns 0 for empty holes array", () => {
    expect(adjustedGrossScore([])).toBe(0);
  });

  it("applies cap independently per hole", () => {
    const holes = [hole(4, 20), hole(5, 20)];
    // caps: 9 and 10
    expect(adjustedGrossScore(holes)).toBe(19);
  });
});

// ── differential ─────────────────────────────────────────────────────────────

describe("differential", () => {
  it("returns 0 when AGS equals course rating on standard slope", () => {
    expect(differential(72, 72, 113)).toBeCloseTo(0);
  });

  it("is positive when AGS is above rating", () => {
    expect(differential(80, 72, 113)).toBeCloseTo(8.0);
  });

  it("is negative when AGS is below rating", () => {
    expect(differential(68, 72, 113)).toBeCloseTo(-4.0);
  });

  it("slope > 113 reduces the differential", () => {
    const lowSlope = differential(80, 70, 113);
    const highSlope = differential(80, 70, 130);
    expect(highSlope).toBeLessThan(lowSlope);
  });

  it("rounds to one decimal place", () => {
    const d = differential(79, 71.5, 120);
    expect(d).toBe(Math.round(d * 10) / 10);
  });
});

// ── handicapIndex ─────────────────────────────────────────────────────────────

describe("handicapIndex", () => {
  it("returns null with 0 differentials", () => {
    expect(handicapIndex([]).index).toBeNull();
  });

  it("returns null with fewer than 3 differentials", () => {
    expect(handicapIndex([5]).index).toBeNull();
    expect(handicapIndex([5, 8]).index).toBeNull();
  });

  it("with 3 rounds: uses 1 best, applies −2.0 adjustment", () => {
    // best diff = 5; (5 + -2.0) / 1 = 3.0
    const { index, usedCount } = handicapIndex([10, 8, 5]);
    expect(usedCount).toBe(1);
    expect(index).toBeCloseTo(3.0);
  });

  it("with 4 rounds: uses 1 best, applies −1.0 adjustment", () => {
    const { index, usedCount } = handicapIndex([4, 6, 8, 10]);
    expect(usedCount).toBe(1);
    expect(index).toBeCloseTo(3.0); // 4 - 1.0
  });

  it("with 5 rounds: uses 1 best, no adjustment", () => {
    const { index, usedCount } = handicapIndex([3, 5, 7, 9, 11]);
    expect(usedCount).toBe(1);
    expect(index).toBeCloseTo(3.0); // best = 3, no adj
  });

  it("with 6 rounds: uses 2 best, applies −1.0 adjustment", () => {
    const { index, usedCount } = handicapIndex([2, 4, 6, 8, 10, 12]);
    expect(usedCount).toBe(2);
    // avg of 2,4 = 3; 3 - 1.0 = 2.0
    expect(index).toBeCloseTo(2.0);
  });

  it("with 20 rounds: uses 8 best", () => {
    const diffs = Array.from({ length: 20 }, (_, i) => i + 1); // [1..20]
    const { usedCount } = handicapIndex(diffs);
    expect(usedCount).toBe(8);
  });

  it("selects the lowest differentials regardless of input order", () => {
    const { index: a } = handicapIndex([10, 5, 8]);
    const { index: b } = handicapIndex([5, 10, 8]);
    expect(a).toBeCloseTo(b!);
  });

  it("returns rounded result to 1 decimal", () => {
    const { index } = handicapIndex([3.33, 4.33, 5.33]);
    expect(index).toBe(Math.round(index! * 10) / 10);
  });
});
